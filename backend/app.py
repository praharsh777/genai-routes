# app.py (replace your existing file)
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from ortools.constraint_solver import routing_enums_pb2, pywrapcp
import requests

load_dotenv()
ORS_API_KEY = os.getenv("ORS_API_KEY")
ORS_BASE_URL = "https://api.openrouteservice.org/v2/directions/driving-car"
FALLBACK_SPEED = float(os.getenv("FALLBACK_SPEED", 15.0))  # m/s for duration fallback

app = Flask(__name__)
CORS(app)


def get_route_from_ors(coords):
    """
    coords: list of [lon, lat]
    returns ORS route (geojson) or {"error": "..."}
    """
    headers = {"Authorization": ORS_API_KEY, "Content-Type": "application/json"}
    body = {"coordinates": coords, "format": "geojson"}
    try:
        r = requests.post(ORS_BASE_URL, json=body, headers=headers, timeout=20)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        return {"error": str(e)}


def compute_distance_matrix(locations):
    """
    locations: list of [lat, lon]
    Returns (distances, durations) where distances[i][j] in meters, durations[i][j] in seconds.
    Falls back to Euclidean if ORS fails.
    """
    try:
        url = "https://api.openrouteservice.org/v2/matrix/driving-car"
        headers = {"Authorization": ORS_API_KEY, "Content-Type": "application/json"}
        # ORS expects coords as [lon, lat]
        coords = [[lon, lat] for lat, lon in locations]
        body = {"locations": coords, "metrics": ["distance", "duration"], "units": "m"}
        resp = requests.post(url, json=body, headers=headers, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        if "distances" not in data:
            raise RuntimeError(f"No 'distances' in ORS response: {data}")
        distances = data["distances"]
        durations = data.get("durations", None)
        return distances, durations
    except Exception as e:
        # Euclidean fallback
        n = len(locations)
        distances = [[0] * n for _ in range(n)]
        durations = [[0] * n for _ in range(n)]
        for i in range(n):
            for j in range(n):
                lat_diff = locations[i][0] - locations[j][0]
                lon_diff = locations[i][1] - locations[j][1]
                dist = ((lat_diff ** 2 + lon_diff ** 2) ** 0.5) * 111000
                distances[i][j] = int(dist)
                durations[i][j] = int(dist / FALLBACK_SPEED)
        print("⚠️ ORS Matrix failed — using Euclidean fallback")
        return distances, durations


@app.route("/api/calculate_before_metrics", methods=["POST"])
def calculate_before_metrics():
    """
    Calculates baseline (naive) metrics for a fleet of `numVehicles`.
    Strategy: round-robin assignment of customers to vehicles (intentionally inefficient).
    Request JSON: { depot: {lat, lon}, customers: [{lat,lon,...}, ...], numVehicles: int (optional) }
    Response: { beforeDistance: int (meters), beforeTime: int (seconds), breakdown: [...] }
    """
    try:
        data = request.get_json()
        depot = data.get("depot")
        customers = data.get("customers", [])
        num_vehicles = int(data.get("numVehicles", 1))

        if not depot or not customers:
            return jsonify({"error": "Depot or customers missing"}), 400
        if num_vehicles < 1:
            num_vehicles = 1

        # Build locations array (index 0 = depot, 1..N = customers)
        locations = [[depot["lat"], depot["lon"]]] + [[c["lat"], c["lon"]] for c in customers]
        distances, durations = compute_distance_matrix(locations)

        # If ORS didn't return durations, build durations using fallback speed
        if durations is None:
            durations = [[int(dist / FALLBACK_SPEED) for dist in row] for row in distances]

        # Round-robin assign customers (indices 1..N) to vehicles
        n_customers = len(customers)
        assignments = [[] for _ in range(num_vehicles)]
        for idx in range(1, len(locations)):
            vehicle_idx = (idx - 1) % num_vehicles  # round-robin
            assignments[vehicle_idx].append(idx)

        total_distance = 0
        total_duration = 0
        breakdown = []

        for vidx, assigned in enumerate(assignments):
            if not assigned:
                breakdown.append({"vehicle": vidx + 1, "distance": 0, "duration": 0})
                continue

            # compute route: depot -> assigned[0] -> assigned[1] ... -> assigned[-1] -> depot
            vehicle_dist = distances[0][assigned[0]]
            vehicle_time = durations[0][assigned[0]]
            for a, b in zip(assigned, assigned[1:]):
                vehicle_dist += distances[a][b]
                vehicle_time += durations[a][b]
            vehicle_dist += distances[assigned[-1]][0]
            vehicle_time += durations[assigned[-1]][0]

            total_distance += int(vehicle_dist)
            total_duration += int(vehicle_time)
            breakdown.append({"vehicle": vidx + 1, "distance": int(vehicle_dist), "duration": int(vehicle_time)})

        return jsonify({
            "beforeDistance": int(total_distance),
            "beforeTime": int(total_duration),
            "breakdown": breakdown
        })

    except Exception as e:
        print("Before metrics error:", e)
        return jsonify({"error": str(e)}), 500


def solve_vrp(distance_matrix, depot_index, demands, vehicle_capacity, num_vehicles):
    """
    Solve CVRP using OR-Tools using the provided distance_matrix (list of lists in meters).
    Returns list of routes (each is list of node indices visited, starting with depot index).
    """
    n = len(distance_matrix)
    manager = pywrapcp.RoutingIndexManager(n, num_vehicles, depot_index)
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        return int(distance_matrix[manager.IndexToNode(from_index)][manager.IndexToNode(to_index)])

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    def demand_callback(from_index):
        return int(demands[manager.IndexToNode(from_index)])

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index, 0, [vehicle_capacity] * num_vehicles, True, "Capacity"
    )

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    solution = routing.SolveWithParameters(search_parameters)

    routes = []
    if solution:
        for vehicle_id in range(num_vehicles):
            idx = routing.Start(vehicle_id)
            route = []
            while not routing.IsEnd(idx):
                node_index = manager.IndexToNode(idx)
                route.append(node_index)
                idx = solution.Value(routing.NextVar(idx))
            # if route only contains depot (0), skip if desired; keep it for info
            routes.append(route)
    return routes


@app.route("/api/optimize_routes", methods=["POST"])
def optimize_routes():
    """
    Request: { depot: {lat,lon}, customers: [...], numVehicles: int, capacity: int }
    Response: { vehicles: [ { id, stops, route: { routes: [{ summary, geometry }] }, totalDistance, totalDuration } ], warnings: [] }
    """
    try:
        data = request.get_json()
        depot = data.get("depot")
        customers = data.get("customers", [])
        num_vehicles = int(data.get("numVehicles", 1))
        vehicle_capacity = int(data.get("capacity", 40))

        if not depot or not customers:
            return jsonify({"error": "Depot or customers missing"}), 400
        if num_vehicles < 1:
            num_vehicles = 1

        locations = [[depot["lat"], depot["lon"]]] + [[c["lat"], c["lon"]] for c in customers]
        demands = [0] + [int(c.get("demand", 0)) for c in customers]

        # compute distance matrix once
        distance_matrix, durations = compute_distance_matrix(locations)
        # ensure durations exists
        if durations is None:
            durations = [[int(dist / FALLBACK_SPEED) for dist in row] for row in distance_matrix]

        # Solve VRP using the distance_matrix
        vrp_routes = solve_vrp(distance_matrix, 0, demands, vehicle_capacity, num_vehicles)
        if not vrp_routes:
            return jsonify({"error": "No feasible routes found"}), 400

        vehicles_data = []
        warnings = []

        for idx, route in enumerate(vrp_routes):
            if not route:
                # empty route for this vehicle
                continue

            # Build route coords for ORS: for each node in route, append [lon, lat]
            # route currently typically starts with depot (0) — if not, it's okay
            route_coords = [[locations[i][1], locations[i][0]] for i in route]
            # ensure we return to depot at end
            route_coords.append([locations[0][1], locations[0][0]])

            ors_data = get_route_from_ors(route_coords)
            if "error" in ors_data:
                warnings.append(f"Vehicle {idx+1}: ORS route error ({ors_data['error']})")
                # fallback: compute distance/time from distance_matrix for this vehicle
                assigned = [i for i in route if i != 0]
                if not assigned:
                    continue
                vehicle_dist = distance_matrix[0][assigned[0]]
                vehicle_time = durations[0][assigned[0]]
                for a, b in zip(assigned, assigned[1:]):
                    vehicle_dist += distance_matrix[a][b]
                    vehicle_time += durations[a][b]
                vehicle_dist += distance_matrix[assigned[-1]][0]
                vehicle_time += durations[assigned[-1]][0]
                stops = []
                for i in route:
                    if i != 0:
                        c = customers[i - 1]
                        stops.append({
                            "name": c.get("LocationName", f"Stop {i}"),
                            "lat": c["lat"],
                            "lon": c["lon"],
                            "demand": int(c.get("demand", 0))
                        })
                vehicles_data.append({
                    "id": idx + 1,
                    "stops": stops,
                    "route": {
                        "routes": [{
                            "summary": {"distance": int(vehicle_dist), "duration": int(vehicle_time)},
                            "geometry": None
                        }]
                    },
                    "totalDistance": int(vehicle_dist),
                    "totalDuration": int(vehicle_time)
                })
                continue

            # Normal ORS response
            try:
                summary = ors_data["routes"][0]["summary"]
                geometry = ors_data["routes"][0].get("geometry")
                # Build stops list (skip depot index 0)
                stops = []
                for i in route:
                    if i != 0:
                        c = customers[i - 1]
                        stops.append({
                            "name": c.get("LocationName", f"Stop {i}"),
                            "lat": c["lat"],
                            "lon": c["lon"],
                            "demand": int(c.get("demand", 0))
                        })

                vehicles_data.append({
                    "id": idx + 1,
                    "stops": stops,
                    "route": {
                        "routes": [{
                            "summary": {"distance": int(summary.get("distance", 0)), "duration": int(summary.get("duration", 0))},
                            "geometry": geometry
                        }]
                    },
                    "totalDistance": int(summary.get("distance", 0)),
                    "totalDuration": int(summary.get("duration", 0))
                })
            except Exception as ex:
                warnings.append(f"Vehicle {idx+1}: parsing ORS response failed ({ex})")

        return jsonify({"vehicles": vehicles_data, "warnings": warnings})

    except Exception as e:
        print("Optimization error:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # host 0.0.0.0 helps LAN testing in demos; change for production
    app.run(debug=True, host="0.0.0.0", port=int(os.getenv("PORT", 5000)))

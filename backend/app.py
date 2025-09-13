import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from ortools.constraint_solver import routing_enums_pb2, pywrapcp
import requests

# Load environment variables
load_dotenv()

ORS_API_KEY = os.getenv("ORS_API_KEY")
ORS_BASE_URL = "https://api.openrouteservice.org/v2/directions/driving-car"

app = Flask(__name__)
CORS(app)


def get_route_from_ors(coords):
    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
    }
    body = {"coordinates": coords, "format": "geojson"}
    try:
        response = requests.post(ORS_BASE_URL, json=body, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}


def compute_distance_matrix(locations):
    """Compute road distance matrix using ORS Matrix API; fallback to Euclidean if limit exceeded."""
    try:
        url = "https://api.openrouteservice.org/v2/matrix/driving-car"
        headers = {"Authorization": ORS_API_KEY, "Content-Type": "application/json"}
        coords = [[lon, lat] for lat, lon in locations]  # convert to [lon, lat]

        body = {
            "locations": coords,
            "metrics": ["distance", "duration"],
            "units": "m"
        }

        resp = requests.post(url, json=body, headers=headers)
        if resp.status_code != 200:
            raise RuntimeError(resp.text)

        data = resp.json()
        if "distances" not in data:
            raise RuntimeError(f"No 'distances' in ORS response: {data}")

        return data["distances"], data.get("durations", None)

    except Exception as e:
        # fallback: Euclidean distance in meters, assume 15 m/s average speed
        n = len(locations)
        distances = []
        durations = []
        for i in range(n):
            row_d = []
            row_t = []
            for j in range(n):
                lat_diff = locations[i][0] - locations[j][0]
                lon_diff = locations[i][1] - locations[j][1]
                dist = ((lat_diff ** 2 + lon_diff ** 2) ** 0.5) * 111000
                row_d.append(int(dist))
                row_t.append(int(dist / 15))
            distances.append(row_d)
            durations.append(row_t)
        print("ORS Matrix API failed, using Euclidean fallback")
        return distances, durations


@app.route("/api/calculate_before_metrics", methods=["POST"])
def calculate_before_metrics():
    """
    Calculates baseline total distance/duration using the raw order of stops (unoptimized).
    """
    try:
        data = request.get_json()
        depot = data.get("depot")
        customers = data.get("customers", [])

        if not depot or not customers:
            return jsonify({"error": "Depot or customers missing"}), 400

        # Internal coordinates [lat, lon]
        locations = [[depot["lat"], depot["lon"]]] + [[c["lat"], c["lon"]] for c in customers]
        distances, durations = compute_distance_matrix(locations)

        # Sum total distance/duration for depot -> all stops -> depot
        total_distance = sum(distances[i][i + 1] for i in range(len(distances) - 1))
        total_duration = sum(durations[i][i + 1] for i in range(len(distances) - 1))

        return jsonify({
            "beforeDistance": total_distance,
            "beforeTime": total_duration
        })

    except Exception as e:
        print("Before metrics error:", e)
        return jsonify({"error": str(e)}), 500


def solve_vrp(depot_index, locations, demands, vehicle_capacity, num_vehicles):
    """Solve CVRP using OR-Tools."""
    distance_matrix, _ = compute_distance_matrix(locations)
    manager = pywrapcp.RoutingIndexManager(len(locations), num_vehicles, depot_index)
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        return distance_matrix[manager.IndexToNode(from_index)][manager.IndexToNode(to_index)]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    def demand_callback(from_index):
        return demands[manager.IndexToNode(from_index)]

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
            if route:
                routes.append(route)
    return routes


@app.route("/api/optimize_routes", methods=["POST"])
def optimize_routes():
    try:
        data = request.get_json()
        depot = data.get("depot")
        customers = data.get("customers", [])
        num_vehicles = int(data.get("numVehicles", 1))
        vehicle_capacity = int(data.get("capacity", 40))

        if not depot or not customers:
            return jsonify({"error": "Depot or customers missing"}), 400

        locations = [[depot["lat"], depot["lon"]]] + [[c["lat"], c["lon"]] for c in customers]
        demands = [0] + [c.get("demand", 0) for c in customers]

        vrp_routes = solve_vrp(0, locations, demands, vehicle_capacity, num_vehicles)
        if not vrp_routes:
            return jsonify({"error": "No feasible routes found"}), 400

        vehicles_data = []
        for idx, route in enumerate(vrp_routes):
            route_coords = [[locations[i][1], locations[i][0]] for i in route]
            route_coords = [route_coords[0]] + route_coords + [route_coords[0]]

            ors_data = get_route_from_ors(route_coords)
            if "error" in ors_data:
                print(f"ORS route error for vehicle {idx+1}:", ors_data)
                continue

            stops = []
            for i in route:
                if i != 0:
                    c = customers[i - 1]
                    stops.append({
                        "name": c.get("LocationName", f"Stop {i}"),
                        "lat": c["lat"],
                        "lon": c["lon"],
                        "demand": c.get("demand", 0)
                    })

            vehicles_data.append({
                "id": idx + 1,
                "stops": stops,
                "route": {
                    "routes": [{
                        "summary": ors_data["routes"][0]["summary"],
                        "geometry": ors_data["routes"][0]["geometry"]
                    }]
                }
            })

        return jsonify({"vehicles": vehicles_data})

    except Exception as e:
        print("Optimization error:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)

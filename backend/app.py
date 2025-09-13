import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import requests

# Load environment variables
load_dotenv()

ORS_API_KEY = os.getenv("ORS_API_KEY")
ORS_BASE_URL = "https://api.openrouteservice.org/v2/directions/driving-car"

app = Flask(__name__)
CORS(app)


def get_route_from_ors(coords):
    """
    coords: list of [lon, lat] pairs
    returns ORS route geometry (GeoJSON)
    """
    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
    }
    body = {
        "coordinates": coords,
        "format": "geojson"
    }
    try:
        response = requests.post(ORS_BASE_URL, json=body, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}


def compute_distance_matrix(locations):
    """
    Compute Euclidean distance matrix (scaled to integer) for OR-Tools
    locations: list of [lat, lon]
    """
    n = len(locations)
    matrix = []
    for i in range(n):
        row = []
        for j in range(n):
            dx = locations[i][0] - locations[j][0]
            dy = locations[i][1] - locations[j][1]
            row.append(int(((dx**2 + dy**2)**0.5) * 100000))
        matrix.append(row)
    return matrix


def solve_vrp(depot_index, locations, demands, vehicle_capacity, num_vehicles):
    """
    Solve Capacitated Vehicle Routing Problem using OR-Tools
    Returns list of routes (each route is a list of node indices)
    """
    distance_matrix = compute_distance_matrix(locations)
    manager = pywrapcp.RoutingIndexManager(len(locations), num_vehicles, depot_index)
    routing = pywrapcp.RoutingModel(manager)

    # Distance callback
    def distance_callback(from_index, to_index):
        return distance_matrix[manager.IndexToNode(from_index)][manager.IndexToNode(to_index)]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # Capacity constraints
    def demand_callback(from_index):
        return demands[manager.IndexToNode(from_index)]

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,
        [vehicle_capacity] * num_vehicles,
        True,
        "Capacity"
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
            if len(route) > 0:
                routes.append(route)

    return routes


@app.route("/api/optimize_routes", methods=["POST"])
def optimize_routes():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON body"}), 400

        depot = data.get("depot")
        customers = data.get("customers", [])
        num_vehicles = int(data.get("numVehicles", 1))
        vehicle_capacity = int(data.get("capacity", 40))

        if not depot or len(customers) == 0:
            return jsonify({"error": "Depot or customers missing"}), 400

        # Build locations & demands lists
        # Depot is at index 0
        locations = [[depot["lat"], depot["lon"]]] + [[c["lat"], c["lon"]] for c in customers]
        demands = [0] + [c.get("demand", 0) for c in customers]  # depot demand = 0

        vrp_routes = solve_vrp(0, locations, demands, vehicle_capacity, num_vehicles)

        if not vrp_routes:
            return jsonify({"error": "No feasible routes found with given capacity/vehicles"}), 400

        vehicles_data = []
        for idx, route in enumerate(vrp_routes):
            # Prepare ORS coordinates: include depot at start
            route_coords = [[locations[i][1], locations[i][0]] for i in route]
            route_coords = [[locations[0][1], locations[0][0]]] + route_coords  # prepend depot
            route_coords.append([locations[0][1], locations[0][0]])  # end at depot
            ors_data = get_route_from_ors(route_coords)

            # Stops: only customer stops (exclude depot)
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
                "route": ors_data
            })

        return jsonify({"vehicles": vehicles_data})

    except Exception as e:
        print("Optimization error:", e)
        return jsonify({"error": f"Route optimization failed: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)

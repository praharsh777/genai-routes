# app.py
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from ortools.constraint_solver import routing_enums_pb2, pywrapcp
import requests

load_dotenv()
ORS_API_KEY = os.getenv("ORS_API_KEY")
SERPAPI_KEY = os.getenv("SERPAPI_KEY")
GENAI_API_URL = os.getenv("GENAI_API_URL")       # e.g. "http://localhost:8000/generate_insights"
GENAI_API_KEY = os.getenv("GENAI_API_KEY")       # optional API key/header for your GenAI service
ORS_BASE_URL = "https://api.openrouteservice.org/v2/directions/driving-car"
FALLBACK_SPEED = float(os.getenv("FALLBACK_SPEED", 15.0))  # m/s for duration fallback

app = Flask(__name__)
allowed_origin = os.getenv("CORS_ALLOWED_ORIGIN", "*")
CORS(app, resources={r"/api/*": {"origins": allowed_origin}}, supports_credentials=True)


# --- External helper functions ---

def get_answer_from_serpapi(question: str):
    """Fallback: query SerpAPI (Google snippets)"""
    if not SERPAPI_KEY:
        return "No SerpAPI key configured."
    url = "https://serpapi.com/search"
    params = {
        "q": question,
        "api_key": SERPAPI_KEY,
        "engine": "google",
        "num": 1
    }
    try:
        resp = requests.get(url, params=params, timeout=20)
        resp.raise_for_status()
        data = resp.json()
        return data.get('answer_box', {}).get('answer') or \
               data.get('answer_box', {}).get('snippet') or \
               data.get('organic_results', [{}])[0].get('snippet', "No answer found.")
    except Exception as e:
        return f"⚠️ SerpAPI Error: {e}"


def call_genai_model(payload: dict):
    """
    Call external GenAI API. Returns (data, error)
    """
    if not GENAI_API_URL:
        return None, "No GENAI_API_URL configured."

    headers = {"Content-Type": "application/json"}
    if GENAI_API_KEY:
        headers["Authorization"] = f"Bearer {GENAI_API_KEY}"

    try:
        resp = requests.post(GENAI_API_URL, json=payload, headers=headers, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        return data, None
    except Exception as e:
        return None, str(e)


def get_route_from_ors(coords):
    """
    coords: list of [lon, lat]
    returns ORS route (geojson) or {"error": "..." }
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
    Fallback: Euclidean if ORS fails.
    """
    try:
        url = "https://api.openrouteservice.org/v2/matrix/driving-car"
        headers = {"Authorization": ORS_API_KEY, "Content-Type": "application/json"}
        coords = [[lon, lat] for lat, lon in locations]  # ORS expects [lon, lat]
        body = {"locations": coords, "metrics": ["distance", "duration"], "units": "m"}
        resp = requests.post(url, json=body, headers=headers, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        distances = data.get("distances")
        durations = data.get("durations", distances)  # fallback if durations missing
        return distances, durations
    except Exception as e:
        # Euclidean fallback
        n = len(locations)
        distances = [[0]*n for _ in range(n)]
        durations = [[0]*n for _ in range(n)]
        for i in range(n):
            for j in range(n):
                lat_diff = locations[i][0] - locations[j][0]
                lon_diff = locations[i][1] - locations[j][1]
                dist = ((lat_diff**2 + lon_diff**2)**0.5) * 111000
                distances[i][j] = int(dist)
                durations[i][j] = int(dist / FALLBACK_SPEED)
        print("⚠️ ORS Matrix failed — using Euclidean fallback")
        return distances, durations


def solve_vrp(distance_matrix, depot_index, demands, vehicle_capacity, num_vehicles):
    """Solve CVRP using OR-Tools. Returns list of routes (lists of node indices)."""
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
    routing.AddDimensionWithVehicleCapacity(demand_callback_index, 0, [vehicle_capacity]*num_vehicles, True, "Capacity")

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
            routes.append(route)
    return routes


# --- API Endpoints ---

@app.route("/api/explain_routes", methods=["POST"])
def explain_routes():
    data = request.json
    vehicles = data.get("vehicles", [])
    baseline = data.get("baseline", {})

    total_distance = sum(v["route"]["routes"][0]["summary"]["distance"] for v in vehicles)
    total_time = sum(v["route"]["routes"][0]["summary"]["duration"] for v in vehicles)

    baseline_distance = baseline.get("distance", total_distance * 1.2)
    baseline_time = baseline.get("duration", total_time * 1.1)

    distance_savings = round((1 - total_distance / baseline_distance) * 100, 2)
    time_savings = round((1 - total_time / baseline_time) * 100, 2)

    insights = []
    for v in vehicles:
        stops = v.get("stops", [])
        dist = v["route"]["routes"][0]["summary"]["distance"] / 1000
        dur = v["route"]["routes"][0]["summary"]["duration"] / 3600
        route_str = "No stops assigned"
        if stops:
            start_name = stops[0].get("name", "Depot")
            end_name = stops[-1].get("name", "Depot")
            route_str = f"{start_name} → ... → {end_name}"

        insights.append({
            "vehicle": f"Truck {v['id']}",
            "explanation": f"{route_str} covers {dist:.2f} km in {dur:.2f} hrs. "
                           f"This contributes to overall {distance_savings}% fuel and {time_savings}% time savings."
        })

    # Fleet-wide summary
    insights.append({
        "vehicle": "Fleet Summary",
        "explanation": f"Optimization reduced total distance by {distance_savings}% "
                       f"({baseline_distance/1000:.2f} km → {total_distance/1000:.2f} km) "
                       f"and time by {time_savings}% ({baseline_time/3600:.2f} hrs → {total_time/3600:.2f} hrs)."
    })

    return jsonify({"insights": insights})
@app.route("/api/ask", methods=["POST"])
def ask():
    data = request.json
    question = data.get("question", "").strip().lower()
    vehicles = data.get("vehicles", [])
    baseline = data.get("baseline", {})

    # --- Compute metrics ---
    total_distance_after = sum(v.get("totalDistance", 0) for v in vehicles)
    total_time_after = sum(v.get("totalDuration", 0) for v in vehicles)
    fuel_cost_after = (total_distance_after / 1000) * 10
    total_cost_after = (total_distance_after / 1000) * 13

    total_distance_before = baseline.get("distance", total_distance_after * 1.2)
    total_time_before = baseline.get("duration", total_time_after * 1.2)
    fuel_cost_before = baseline.get("fuel_cost", (total_distance_before / 1000) * 10)
    total_cost_before = baseline.get("total_cost", (total_distance_before / 1000) * 13)

    distance_saved = total_distance_before - total_distance_after
    time_saved = total_time_before - total_time_after
    fuel_saved = fuel_cost_before - fuel_cost_after
    total_cost_saved = total_cost_before - total_cost_after

    # --- Define flexible keyword mapping ---
    keyword_map = [
        {"keywords": ["distance", "km", "travelled", "moved"], "metric": "distance", 
         "before": f"{total_distance_before/1000:.2f} km",
         "after": f"{total_distance_after/1000:.2f} km",
         "saved": f"{distance_saved/1000:.2f} km"},
        {"keywords": ["time", "travel time", "duration", "hours", "hrs"], "metric": "time", 
         "before": f"{total_time_before/3600:.2f} hrs",
         "after": f"{total_time_after/3600:.2f} hrs",
         "saved": f"{time_saved/3600:.2f} hrs"},
        {"keywords": ["fuel", "fuel cost", "gas", "petrol"], "metric": "fuel", 
         "before": f"₹{fuel_cost_before:.0f}",
         "after": f"₹{fuel_cost_after:.0f}",
         "saved": f"₹{fuel_saved:.0f}"},
        {"keywords": ["cost", "total cost", "money", "expenses"], "metric": "cost", 
         "before": f"₹{total_cost_before:.0f}",
         "after": f"₹{total_cost_after:.0f}",
         "saved": f"₹{total_cost_saved:.0f}"}
    ]

    response = None

    # --- Check which metric user is asking about ---
    for km in keyword_map:
        if any(k in question for k in km["keywords"]):
            if "before" in question:
                response = f"{km['metric'].title()} before optimization: {km['before']}"
            elif "after" in question or "total" in question or "taken" in question:
                response = f"{km['metric'].title()} after optimization: {km['after']}"
            elif "saved" in question or "difference" in question:
                response = f"{km['metric'].title()} saved: {km['saved']}"
            else:
                response = f"{km['metric'].title()} after optimization: {km['after']}"
            break

    # --- Fallback to SerpAPI if unrelated ---
    if response is None:
        response = get_answer_from_serpapi(question)

    return jsonify({"answer": response})


@app.route("/api/calculate_before_metrics", methods=["POST"])
def calculate_before_metrics():
    try:
        data = request.get_json()
        depot = data.get("depot")
        customers = data.get("customers", [])
        num_vehicles = max(1, int(data.get("numVehicles", 1)))

        if not depot or not customers:
            return jsonify({"error": "Depot or customers missing"}), 400

        locations = [[depot["lat"], depot["lon"]]] + [[c["lat"], c["lon"]] for c in customers]
        distances, durations = compute_distance_matrix(locations)

        if durations is None:
            durations = [[int(dist/FALLBACK_SPEED) for dist in row] for row in distances]

        assignments = [[] for _ in range(num_vehicles)]
        for idx in range(1, len(locations)):
            vehicle_idx = (idx-1) % num_vehicles
            assignments[vehicle_idx].append(idx)

        total_distance = 0
        total_duration = 0
        breakdown = []

        for vidx, assigned in enumerate(assignments):
            if not assigned:
                breakdown.append({"vehicle": vidx+1, "distance": 0, "duration": 0})
                continue
            vehicle_dist = distances[0][assigned[0]]
            vehicle_time = durations[0][assigned[0]]
            for a,b in zip(assigned, assigned[1:]):
                vehicle_dist += distances[a][b]
                vehicle_time += durations[a][b]
            vehicle_dist += distances[assigned[-1]][0]
            vehicle_time += durations[assigned[-1]][0]

            total_distance += int(vehicle_dist)
            total_duration += int(vehicle_time)
            breakdown.append({"vehicle": vidx+1, "distance": int(vehicle_dist), "duration": int(vehicle_time)})

        return jsonify({
            "beforeDistance": int(total_distance),
            "beforeTime": int(total_duration),
            "breakdown": breakdown
        })

    except Exception as e:
        print("Before metrics error:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/optimize_routes", methods=["POST"])
def optimize_routes():
    try:
        data = request.get_json()
        depot = data.get("depot")
        customers = data.get("customers", [])
        num_vehicles = max(1, int(data.get("numVehicles", 1)))
        vehicle_capacity = int(data.get("capacity", 40))

        if not depot or not customers:
            return jsonify({"error": "Depot or customers missing"}), 400

        locations = [[depot["lat"], depot["lon"]]] + [[c["lat"], c["lon"]] for c in customers]
        demands = [0] + [int(c.get("demand", 0)) for c in customers]

        distance_matrix, durations = compute_distance_matrix(locations)
        if durations is None:
            durations = [[int(dist/FALLBACK_SPEED) for dist in row] for row in distance_matrix]

        vrp_routes = solve_vrp(distance_matrix, 0, demands, vehicle_capacity, num_vehicles)
        if not vrp_routes:
            return jsonify({"error": "No feasible routes found"}), 400

        vehicles_data = []
        warnings = []

        for idx, route in enumerate(vrp_routes):
            if not route:
                continue

            route_coords = [[locations[i][1], locations[i][0]] for i in route]
            route_coords.append([locations[0][1], locations[0][0]])

            ors_data = get_route_from_ors(route_coords)
            if "error" in ors_data:
                warnings.append(f"Vehicle {idx+1}: ORS route error ({ors_data['error']})")
                assigned = [i for i in route if i != 0]
                if not assigned:
                    continue
                vehicle_dist = distance_matrix[0][assigned[0]]
                vehicle_time = durations[0][assigned[0]]
                for a,b in zip(assigned, assigned[1:]):
                    vehicle_dist += distance_matrix[a][b]
                    vehicle_time += durations[a][b]
                vehicle_dist += distance_matrix[assigned[-1]][0]
                vehicle_time += durations[assigned[-1]][0]

                stops = []
                for i in route:
                    if i != 0:
                        c = customers[i-1]
                        stops.append({
                            "name": c.get("LocationName", f"Stop {i}"),
                            "lat": c["lat"],
                            "lon": c["lon"],
                            "demand": int(c.get("demand", 0))
                        })

                vehicles_data.append({
                    "id": idx+1,
                    "stops": stops,
                    "route": {
                        "routes": [{"summary": {"distance": int(vehicle_dist), "duration": int(vehicle_time)}, "geometry": None}]
                    },
                    "totalDistance": int(vehicle_dist),
                    "totalDuration": int(vehicle_time)
                })
                continue

            try:
                summary = ors_data["routes"][0]["summary"]
                geometry = ors_data["routes"][0].get("geometry")
                stops = []
                for i in route:
                    if i != 0:
                        c = customers[i-1]
                        stops.append({
                            "name": c.get("LocationName", f"Stop {i}"),
                            "lat": c["lat"],
                            "lon": c["lon"],
                            "demand": int(c.get("demand", 0))
                        })

                vehicles_data.append({
                    "id": idx+1,
                    "stops": stops,
                    "route": {
                        "routes": [{"summary": {"distance": int(summary.get("distance", 0)),
                                                "duration": int(summary.get("duration", 0))},
                                    "geometry": geometry}]
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
    app.run(debug=True, host="0.0.0.0", port=int(os.getenv("PORT", 5000)))

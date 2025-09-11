import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

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


@app.route("/api/optimize_routes", methods=["POST"])
def optimize_routes():
    # Read JSON body
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    depot = data.get("depot")
    customers = data.get("customers", [])
    num_vehicles = data.get("numVehicles", 1)

    if not depot or not customers:
        return jsonify({"error": "Missing depot or customers"}), 400

    # Naive split: 1 vehicle covers all customers
    coords = [[depot["lon"], depot["lat"]]] + [
        [c["lon"], c["lat"]] for c in customers
    ] + [[depot["lon"], depot["lat"]]]

    ors_data = get_route_from_ors(coords)

    return jsonify({
        "vehicles": [
            {
                "id": 1,
                "stops": [depot] + customers + [depot],
                "route": ors_data
            }
        ]
    })


if __name__ == "__main__":
    app.run(debug=True)

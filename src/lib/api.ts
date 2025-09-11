import axios from "axios";

const API_BASE = "http://127.0.0.1:5000/api";

export async function getOptimizedRoutes(depot: any, customers: any[], numVehicles: number) {
  const res = await axios.post(`${API_BASE}/optimize_routes`, {
    depot,
    customers,
    numVehicles,
  });
  return res.data;
}

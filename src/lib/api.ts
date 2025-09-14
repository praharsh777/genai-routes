import axios from "axios";

// ✅ Environment-aware API base URL
const API_BASE = import.meta.env.VITE_API_BASE_URL + "/api";

export async function getOptimizedRoutes(
  depot: any,
  customers: any[],
  numVehicles: number
) {
  const res = await axios.post(`${API_BASE}/optimize_routes`, {
    depot,
    customers,
    numVehicles,
  });
  return res.data;
}

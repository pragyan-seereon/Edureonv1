import api from "./axios";

export const VECV_CLIENT_ID = "e035ba14-36d3-4de-MOTHER-34168ed23a70";

/** Request the latest vehicle positions from VECV and persist them server-side. */
export const syncVecvLiveData = (clientId = VECV_CLIENT_ID) =>
  api.post(
    "/vecv/live-data",
    { clientId },
    {
      headers: { "Content-Type": "application/json" },
      // A GPS sync should not trigger the app-wide data-refresh interceptor.
      skipDataRefresh: true,
    },
  );

/** Return the vehicle positions saved by the latest successful VECV sync. */
export const getVecvVehicles = () => api.get("/vecv/vehicles");

/** Return the saved position for one vehicle. */
export const getVecvVehicle = (vehicleNo) =>
  api.get(`/vecv/vehicles/${encodeURIComponent(vehicleNo)}`);

export default {
  syncVecvLiveData,
  getVecvVehicles,
  getVecvVehicle,
};

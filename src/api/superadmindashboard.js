import api from "./axios";

export const getSuperAdminDashboard = async () => {
  const response = await api.get("/superadmin/dashboard");
  return response.data?.data ?? response.data;
};

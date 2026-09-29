import api from "./axios";
import useAuthStore from "../store/authStore";
import useSessionStore from "../store/sessionStore";

const getSessionYear = () => {
  return useSessionStore.getState().sessionYear;
};

// =====================================================
// HEADERS
// =====================================================

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  if (!instituteUUID) {
    throw new Error("Institute UUID is not available.");
  }

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// =====================================================
// STUDENT FEE REPORT
// =====================================================

export const getStudentFeeReport = (params = {}) => {
  return api.get("/reports/student-fees", {
    headers: getHeaders(),
    params,
  });
};

// =====================================================
// FEE COLLECTION — MONTHLY MANAGEMENT REPORT
// =====================================================

export const getMonthlyFeeManagementReport = (
  params = {}
) => {
  return api.get("/reports/student-fees/monthly-management", {
    headers: getHeaders(),
    params: { ...params, session_year: getSessionYear() },
  });
};

export const getOtherPaymentsReport = (params = {}) => {
  return api.get("/reports/student-fees/other-payments", {
    headers: getHeaders(),
    params,
  });
};

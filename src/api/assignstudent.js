import api from "./axios";
import useAuthStore from "../store/authStore";
import useSessionStore from "../store/sessionStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// An explicit argument still wins; otherwise fall back to the active session
const getSessionYear = (override) =>
  override ?? useSessionStore.getState().sessionYear;

export const getUnassignedStudents = async (sessionYear) => {
  const { instituteUUID } = useAuthStore.getState();

  const { data } = await api.get("/students/session/unassigned", {
    headers: getHeaders(),
    params: {
      institute_uuid: instituteUUID,
      session_year: getSessionYear(sessionYear),
    },
  });

  return data;
};

export const assignStudentsToSection = async (payload) => {
  const { data } = await api.post(
    "/sections/assign-students",
    {
      ...payload,
      session_year: getSessionYear(payload?.session_year),
    },
    {
      headers: getHeaders(),
    }
  );

  return data;
};

export const getActiveStudents = async (sessionYear) => {
  const { instituteUUID } = useAuthStore.getState();

  const { data } = await api.get("/students/", {
    headers: getHeaders(),
    params: {
      institute_uuid: instituteUUID,
      status: "ACTIVE",
      session_year: getSessionYear(sessionYear),
    },
  });

  return data;
};
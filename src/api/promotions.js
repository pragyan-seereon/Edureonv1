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

// Fetch unassigned students
export const getUnassignedSessionStudents = async (sessionYear) => {
  const { instituteUUID } = useAuthStore.getState();

  const { data } = await api.get("/students/session/unassigned", {
    params: {
      institute_uuid: instituteUUID,
      session_year: getSessionYear(sessionYear),
    },
    headers: getHeaders(),
  });

  return data;
};

// Fetch students for promotion
export const getPromotionStudents = async (sessionYear) => {
  const { instituteUUID } = useAuthStore.getState();

  const { data } = await api.get("/students/section-assignments", {
    params: {
      institute_uuid: instituteUUID,
      session_year: getSessionYear(sessionYear),
    },
    headers: getHeaders(),
  });

  return data;
};

// Promote students
export const promoteStudents = async (payload) => {
  const { data } = await api.post(
    "/promotions",
    {
      ...payload,
      // payload.session_year is the destination ("New Session") chosen by the user,
      // so it wins; the store session is only a fallback if it's missing
      session_year: getSessionYear(payload?.session_year),
    },
    {
      headers: getHeaders(),
    }
  );

  return data;
};
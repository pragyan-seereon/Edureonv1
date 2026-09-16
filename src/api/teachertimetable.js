import api from "./axios";

import useAuthStore from "../store/authStore";
import useSessionStore from "../store/sessionStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

export const getTeacherTimetable = async () => {
  const { sessionYear } = useSessionStore.getState();

  const { data } = await api.get("/teacher-portal/my-timetable", {
    headers: getHeaders(),
    params: {
      academic_year: sessionYear,
    },
  });

  return data;
};
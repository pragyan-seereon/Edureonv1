

import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

export const getTeacherClasses = async () => {
  const { data } = await api.get("/teacher-portal/my-classes", {
    headers: getHeaders(),
  });

  return data;
};

import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();
  return { "X-Institute-UUID": instituteUUID };
};

export const getLessonPlans = async () => {
  const { data } = await api.get("/lesson-plans", { headers: getHeaders() });
  return data;
};

export const createLessonPlan = async (formData) => {
  const { data } = await api.post("/lesson-plans", formData, {
    headers: { ...getHeaders(), "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const downloadLessonPlan = async (lesson_plan_uuid) => {
  const { data } = await api.get(`/lesson-plans/${lesson_plan_uuid}/download`, {
    headers: getHeaders(),
  });
  return data;
};

export const getLessonPlanDetail = async (lesson_plan_uuid) => {
  const { data } = await api.get(`/lesson-plans/${lesson_plan_uuid}`, {
    headers: getHeaders(),
  });
  return data;
};

export const updateLessonPlan = async (lesson_plan_uuid, formData) => {
  const { data } = await api.put(`/lesson-plans/${lesson_plan_uuid}`, formData, {
    headers: { ...getHeaders(), "Content-Type": "multipart/form-data" },
  });
  return data;
};
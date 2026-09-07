import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// Get all lesson plans
export const getLessonPlans = async () => {
  const { data } = await api.get("/lesson-plans", {
    headers: getHeaders(),
  });

  return data;
};

// Create lesson plan
export const createLessonPlan = async (payload) => {
  const { data } = await api.post(
    "/lesson-plans",
    payload,
    {
      headers: getHeaders(),
    }
  );

  return data;
};

// Download lesson plan PDF
export const downloadLessonPlan = async (lesson_plan_uuid) => {
  const { data } = await api.get(
    `/lesson-plans/${lesson_plan_uuid}/download`,
    {
      headers: getHeaders(),
    }
  );

  return data;
};
import api from "./axios";

import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// Get students by class and section
export const getAssignmentStudents = async (class_uuid, section_uuid) => {
  const { data } = await api.get("/assignments/students", {
    params: {
      class_uuid,
      section_uuid,
    },
    headers: getHeaders(),
  });

  return data;
};

// Get a single assignment's submissions (paginated) — used to populate the
// "Assigned students" table on the teacher assignment detail view.
export const getAssignmentSubmissions = async (
  assignment_uuid,
  page = 1,
  page_size = 20,
) => {
  const { data } = await api.get(
    `/assignments/${assignment_uuid}/submissions`,
    {
      params: { page, page_size },
      headers: getHeaders(),
    },
  );

  return data;
};

export const gradeSubmission = async (
  assignment_uuid,
  submission_uuid,
  payload, 
) => {
  const { data } = await api.patch(
    `/assignments/${assignment_uuid}/submissions/${submission_uuid}/grade`,
    payload,
    { headers: getHeaders() },
  );

  return data;
};
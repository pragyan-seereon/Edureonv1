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

// Get all inquiries (questions) students raised on an assignment
export const getAssignmentInquiries = async (assignment_uuid) => {
  const { data } = await api.get(
    `/assignments/${assignment_uuid}/inquiries`,
    { headers: getHeaders() },
  );

  return data;
};

// Reply to a single student inquiry
export const replyAssignmentInquiry = async (
  assignment_uuid,
  inquiry_uuid,
  reply,
) => {
  const { data } = await api.patch(
    `/assignments/${assignment_uuid}/inquiries/${inquiry_uuid}/reply`,
    { reply },
    { headers: getHeaders() },
  );

  return data;
};

// Save (or re-save) a draft — dedicated draft endpoint, never publishes
export const saveAssignmentDraft = async (formData) => {
  const { data } = await api.post("/assignments/save-draft", formData, {
    headers: {
      ...getHeaders(),
      // Force axios to drop any default JSON content-type and let the
      // browser attach the correct multipart boundary for FormData.
      "Content-Type": undefined,
    },
  });
  return data;
};

// Pull a saved draft back (used by the review endpoint)
export const getAssignmentDraftReview = async (draftUuid) => {
  const { data } = await api.get(
    `/assignments/drafts/${draftUuid}/review`,
    { headers: getHeaders() },
  );
  return data;
};

// Publish an existing draft directly from its draft_uuid
export const publishAssignmentDraft = async (draftUuid) => {
  const { data } = await api.post(
    "/assignments/publish",
    { draft_uuid: draftUuid },
    { headers: getHeaders() },
  );
  return data;
};
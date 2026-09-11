import api from "./axios";
import useAuthStore from "../store/authStore";
import useSessionStore from "../store/sessionStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();
  const { sessionYear } = useSessionStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
    "X-Session-Year": sessionYear,
  };
};

// ---------------- Question Bank ----------------

// Get all questions (paginated)
export const getQuestionBank = async ({ skip = 0, limit = 100 } = {}) => {
  const { data } = await api.get("/question-bank", {
    headers: getHeaders(),
    params: { skip, limit },
  });

  return data; // { items, total }
};

// Get single question by UUID
export const getQuestionBankById = async (uuid) => {
  const { data } = await api.get(`/question-bank/${uuid}`, {
    headers: getHeaders(),
  });

  return data;
};

// Create a single question — API expects { questions: [ {...} ] }
export const createQuestion = async (payload) => {
  const { data } = await api.post(
    "/question-bank",
    { questions: [payload] },
    { headers: getHeaders() },
  );

  const created = data?.items ?? data?.questions ?? data;
  return Array.isArray(created) ? created[0] : created;
};

// Create multiple questions in ONE request — the endpoint already
// accepts an array under "questions".
export const createQuestionsBulk = async (questions) => {
  const { data } = await api.post(
    "/question-bank",
    { questions },
    { headers: getHeaders() },
  );

  const items = data?.items ?? data?.questions ?? data ?? [];
  return { total_created: items.length, items };
};

// Update a question
export const updateQuestionBank = async (uuid, payload) => {
  const { data } = await api.put(`/question-bank/${uuid}`, payload, {
    headers: getHeaders(),
  });

  return data;
};

// Delete a question
export const deleteQuestionBank = async (uuid) => {
  const { data } = await api.delete(`/question-bank/${uuid}`, {
    headers: getHeaders(),
  });

  return data;
};

export const importQuestionBank = async (file, classUuid) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("/question-bank/import", formData, {
    headers: {
      ...getHeaders(),
      "Content-Type": undefined,
    },
    params: classUuid ? { class_uuid: classUuid } : undefined,
  });

  return data;
};
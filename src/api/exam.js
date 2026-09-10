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

// ---------------- Exam Categories ----------------

// Get all exam categories
export const getExamCategories = async ({
  skip = 0,
  limit = 100,
} = {}) => {
  const { data } = await api.get("/exam-categories", {
    headers: getHeaders(),
    params: {
      skip,
      limit,
    },
  });

  return data;
};

// Get exam category by UUID
export const getExamCategoryById = async (uuid) => {
  const { data } = await api.get(`/exam-categories/${uuid}`, {
    headers: getHeaders(),
  });

  return data;
};

// Create exam category
export const createExamCategory = async (payload) => {
  const { data } = await api.post("/exam-categories", payload, {
    headers: getHeaders(),
  });

  return data;
};

// Update exam category
export const updateExamCategory = async (uuid, payload) => {
  const { data } = await api.put(`/exam-categories/${uuid}`, payload, {
    headers: getHeaders(),
  });

  return data;
};

// Delete exam category
export const deleteExamCategory = async (uuid) => {
  const { data } = await api.delete(`/exam-categories/${uuid}`, {
    headers: getHeaders(),
  });

  return data;
};

// ---------------- Exams ----------------

// Get all exams
export const getExams = async ({ skip = 0, limit = 100 } = {}) => {
  const { data } = await api.get("/exams", {
    headers: getHeaders(),
    params: { skip, limit },
  });

  return data;
};

// Get exam by UUID
export const getExamById = async (uuid) => {
  const { data } = await api.get(`/exams/${uuid}`, {
    headers: getHeaders(),
  });

  return data;
};

// Create exam
export const createExam = async (payload) => {
  const { data } = await api.post("/exams", payload, {
    headers: getHeaders(),
  });

  return data;
};

// Update exam
export const updateExam = async (uuid, payload) => {
  const { data } = await api.put(`/exams/${uuid}`, payload, {
    headers: getHeaders(),
  });

  return data;
};

// Delete exam
export const deleteExam = async (uuid) => {
  const { data } = await api.delete(`/exams/${uuid}`, {
    headers: getHeaders(),
  });

  return data;
};

// ---------------- Class-Subject Mappings ----------------

// Get subjects mapped to a class
export const getClassSubjects = async (classUuid) => {
  const { data } = await api.get(
    `/class-subject-mappings/class/${classUuid}/subjects`,
    { headers: getHeaders() },
  );

  return data;
};

export const getRooms = async () => {
  const { data } = await api.get("/infrastructure/rooms", {
    headers: getHeaders(),
  });
  return data?.data ?? data ?? [];
};

// ---------------- Exam Papers ----------------

export const getExamPapers = async ({ skip = 0, limit = 100 } = {}) => {
  const { data } = await api.get("/exam-papers", {
    headers: getHeaders(),
    params: { skip, limit },
  });
  return data;
};

export const createExamPapersBulk = async (examUuid, papers) => {
  const { data } = await api.post(
    "/exam-papers/bulk",
    { exam_uuid: examUuid, papers },
    { headers: getHeaders() },
  );
  return data;
};

export const getExamPaperById = async (uuid) => {
  const { data } = await api.get(`/exam-papers/${uuid}`, {
    headers: getHeaders(),
  });
  return data;
};

export const updateExamPaper = async (uuid, payload) => {
  const { data } = await api.put(`/exam-papers/${uuid}`, payload, {
    headers: getHeaders(),
  });
  return data;
};

export const deleteExamPaper = async (uuid) => {
  const { data } = await api.delete(`/exam-papers/${uuid}`, {
    headers: getHeaders(),
  });
  return data;
};

export const importExamPapers = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/exam-papers/import", formData, {
    headers: {
      ...getHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};


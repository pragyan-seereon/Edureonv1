// import api from "./axios";
// import useAuthStore from "../store/authStore";
// import useSessionStore from "../store/sessionStore";

// const getHeaders = () => {
//   const { instituteUUID } = useAuthStore.getState();
//   const { sessionYear } = useSessionStore.getState();


//   return {
//     "X-Institute-UUID": instituteUUID,
//     "X-Session-Year": sessionYear,
//   };
// };

// // ---------------- Exam Categories ----------------

// // Get all exam categories
// export const getExamCategories = async ({
//   skip = 0,
//   limit = 100,
// } = {}) => {
//   const { data } = await api.get("/exam-categories", {
//     headers: getHeaders(),
//     params: {
//       skip,
//       limit,
//     },
//   });

//   return data;
// };

// // Get exam category by UUID
// export const getExamCategoryById = async (uuid) => {
//   const { data } = await api.get(`/exam-categories/${uuid}`, {
//     headers: getHeaders(),
//   });

//   return data;
// };

// // Create exam category
// export const createExamCategory = async (payload) => {
//   const { data } = await api.post("/exam-categories", payload, {
//     headers: getHeaders(),
//   });

//   return data;
// };

// // Update exam category
// export const updateExamCategory = async (uuid, payload) => {
//   const { data } = await api.put(`/exam-categories/${uuid}`, payload, {
//     headers: getHeaders(),
//   });

//   return data;
// };

// // Delete exam category
// export const deleteExamCategory = async (uuid) => {
//   const { data } = await api.delete(`/exam-categories/${uuid}`, {
//     headers: getHeaders(),
//   });

//   return data;
// };

// // ---------------- Exams ----------------

// // Get all exams
// export const getExams = async ({ skip = 0, limit = 100 } = {}) => {
//   const { data } = await api.get("/exams", {
//     headers: getHeaders(),
//     params: { skip, limit },
//   });

//   return data;
// };

// // Get exam by UUID
// export const getExamById = async (uuid) => {
//   const { data } = await api.get(`/exams/${uuid}`, {
//     headers: getHeaders(),
//   });

//   return data;
// };

// // Create exam
// export const createExam = async (payload) => {
//   const { data } = await api.post("/exams", payload, {
//     headers: getHeaders(),
//   });

//   return data;
// };

// // Update exam
// export const updateExam = async (uuid, payload) => {
//   const { data } = await api.put(`/exams/${uuid}`, payload, {
//     headers: getHeaders(),
//   });

//   return data;
// };

// // Delete exam
// export const deleteExam = async (uuid) => {
//   const { data } = await api.delete(`/exams/${uuid}`, {
//     headers: getHeaders(),
//   });

//   return data;
// };

// // ---------------- Class-Subject Mappings ----------------

// // Get subjects mapped to a class
// export const getClassSubjects = async (classUuid) => {
//   const { data } = await api.get(
//     `/class-subject-mappings/class/${classUuid}/subjects`,
//     { headers: getHeaders() },
//   );

//   return data;
// };

// export const getRooms = async () => {
//   const { data } = await api.get("/infrastructure/rooms", {
//     headers: getHeaders(),
//   });
//   return data?.data ?? data ?? [];
// };

// // ---------------- Exam Papers ----------------

// export const getExamPapers = async ({ skip = 0, limit = 100 } = {}) => {
//   const { data } = await api.get("/exam-papers", {
//     headers: getHeaders(),
//     params: { skip, limit },
//   });
//   return data;
// };

// export const createExamPapersBulk = async (examUuid, papers) => {
//   const { data } = await api.post(
//     "/exam-papers/bulk",
//     { exam_uuid: examUuid, papers },
//     { headers: getHeaders() },
//   );
//   return data;
// };

// export const getExamPaperById = async (uuid) => {
//   const { data } = await api.get(`/exam-papers/${uuid}`, {
//     headers: getHeaders(),
//   });
//   return data;
// };

// export const updateExamPaper = async (uuid, payload) => {
//   const { data } = await api.put(`/exam-papers/${uuid}`, payload, {
//     headers: getHeaders(),
//   });
//   return data;
// };

// export const deleteExamPaper = async (uuid) => {
//   const { data } = await api.delete(`/exam-papers/${uuid}`, {
//     headers: getHeaders(),
//   });
//   return data;
// };

// export const importExamPapers = async (file) => {
//   const formData = new FormData();
//   formData.append("file", file);
//   const { data } = await api.post("/exam-papers/import", formData, {
//     headers: {
//       ...getHeaders(),
//       "Content-Type": "multipart/form-data",
//     },
//   });
//   return data;
// };

// // ---------------- Exam Marks ----------------

// export const importExamMarks = async (file, { examUuid, classUuid, sectionUuid } = {}) => {
//   const formData = new FormData();
//   formData.append("file", file);
//   if (examUuid) formData.append("exam_uuid", examUuid);
//   if (classUuid) formData.append("class_uuid", classUuid);
//   if (sectionUuid) formData.append("section_uuid", sectionUuid);

//   const { data } = await api.post("/exam-marks/import", formData, {
//     headers: {
//       ...getHeaders(),
//       "Content-Type": "multipart/form-data",
//     },
//   });
//   return data;
// };

// // Get exam marks (filtered by exam + class)
// export const getExamMarks = async ({ examUuid, classUuid, skip = 0, limit = 200 } = {}) => {
//   const { data } = await api.get("/exam-marks", {
//     headers: getHeaders(),
//     params: { exam_uuid: examUuid, class_uuid: classUuid, skip, limit },
//   });
//   return data;
// };

// // Update a single student's exam result (totals/grade/status)
// export const updateExamMarks = async (resultUuid, payload) => {
//   const { data } = await api.put(`/exam-marks/${resultUuid}`, payload, {
//     headers: getHeaders(),
//   });
//   return data;
// };


// export const publishExamMarks = async ({
//   examUuid,
//   classUuid,
//   sectionUuid,
//   resultUuids,
//   studentUuids,
// } = {}) => {
//   const payload = {
//     exam_uuid: examUuid,
//     class_uuid: classUuid,
//     section_uuid: sectionUuid,
//     result_uuids: resultUuids,
//     student_uuids: studentUuids,
//   };
//   const { data } = await api.post("/exam-marks/publish", payload, {
//     headers: getHeaders(),
//   });
//   return data;
// };

// export const getExamResultAnalytics = async ({ topLimit = 5, examUuid } = {}) => {
//   const { data } = await api.get("/exam-marks/result-analytics", {
//     headers: getHeaders(),
//     params: {
//       top_limit: topLimit,
//       exam_uuid: examUuid,
//     },
//   });
//   return data;
// };


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

// Teacher Portal: categories available for teacher-created internal tests.
export const getTeacherExamCategories = async () => {
  const { data } = await api.get("/teacher-portal/exam-categories", {
    headers: getHeaders(),
  });
  return data;
};

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

export const getTeacherClassScopes = async () => {
  const { data } = await api.get("/teacher-portal/my-classes", {
    headers: getHeaders(),
  });
  return data;
};

export const createTeacherInternalTest = async (payload) => {
  const { sessionYear } = useSessionStore.getState();
  const { data } = await api.post("/teacher-portal/internal-tests", payload, {
    headers: getHeaders(),
    params: { session_year: sessionYear },
  });
  return data;
};

export const getTeacherInternalTests = async () => {
  const { sessionYear } = useSessionStore.getState();
  const { data } = await api.get("/teacher-portal/internal-tests", {
    headers: getHeaders(),
    params: { session_year: sessionYear },
  });
  return data;
};

// Teacher Portal: internal tests created by the logged-in teacher.
export const getTeacherExams = async () => {
  const { sessionYear } = useSessionStore.getState();
  const { data } = await api.get("/teacher-portal/exams", {
    headers: getHeaders(),
    params: { session_year: sessionYear },
  });
  return data;
};

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

// ---------------- Exam Marks ----------------

export const importExamMarks = async (file, { examUuid, classUuid, sectionUuid } = {}) => {
  const formData = new FormData();
  formData.append("file", file);
  if (examUuid) formData.append("exam_uuid", examUuid);
  if (classUuid) formData.append("class_uuid", classUuid);
  if (sectionUuid) formData.append("section_uuid", sectionUuid);

  const { data } = await api.post("/exam-marks/import", formData, {
    headers: {
      ...getHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

// Teacher Portal: import marks for a specific paper via Excel (multipart).
// Teacher-only equivalent of the administrator exam-marks Excel import.
export const importTeacherExamMarks = async (
  file,
  { examUuid, classUuid, sectionUuid } = {},
) => {
  const { sessionYear } = useSessionStore.getState();

  const formData = new FormData();
  formData.append("exam_uuid", examUuid);
  formData.append("class_uuid", classUuid);
  formData.append("section_uuid", sectionUuid);
  formData.append("file", file);

  const { data } = await api.post("/teacher-portal/marks/import", formData, {
    headers: {
      ...getHeaders(),
      "Content-Type": "multipart/form-data",
    },
    params: { session_year: sessionYear },
  });
  return data;
};

// Get exam marks (filtered by exam + class)
export const getExamMarks = async ({
  examUuid,
  classUuid,
  sectionUuid,
  skip = 0,
  limit = 200,
} = {}) => {
  const { data } = await api.get("/exam-marks", {
    headers: getHeaders(),
    params: {
      exam_uuid: examUuid,
      class_uuid: classUuid,
      section_uuid: sectionUuid,
      skip,
      limit,
    },
  });
  return data;
};

// Update a single student's exam result (totals/grade/status)
export const updateExamMarks = async (resultUuid, payload) => {
  const { data } = await api.put(`/exam-marks/${resultUuid}`, payload, {
    headers: getHeaders(),
  });
  return data;
};


export const publishExamMarks = async ({
  examUuid,
  classUuid,
  sectionUuid,
  resultUuids,
  studentUuids,
} = {}) => {
  const payload = {
    exam_uuid: examUuid,
    class_uuid: classUuid,
    section_uuid: sectionUuid,
    result_uuids: resultUuids,
    student_uuids: studentUuids,
  };
  const { data } = await api.post("/exam-marks/publish", payload, {
    headers: getHeaders(),
  });
  return data;
};


export const getExamResultAnalytics = async ({ topLimit = 5, examUuid } = {}) => {
  const { data } = await api.get("/exam-marks/result-analytics", {
    headers: getHeaders(),
    params: {
      top_limit: topLimit,
      exam_uuid: examUuid,
    },
  });
  return data;
};
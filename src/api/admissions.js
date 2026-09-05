

// import api from "./axios";
// import useAuthStore from "../store/authStore";
// import useSessionStore from "../store/sessionStore";

// // ============================================================
// // Common Headers
// // ============================================================

// const getHeaders = () => {
//   const { instituteUUID } = useAuthStore.getState();

//   return {
//     "X-Institute-UUID": instituteUUID,
//   };
// };

// // ============================================================
// // Active Session
// // ============================================================

// const getSessionYear = () => {
//   return useSessionStore.getState().sessionYear;
// };

// // ============================================================
// // Create Admission
// // POST - NO session filter added here
// // ============================================================

// export const createAdmission = (data) => {
//   return api.post("/admissions/", data, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//       ...getHeaders(),
//     },
//   });
// };

// // ============================================================
// // Admission Sources
// // GET - Session
// // ============================================================

// export const getAdmissionSources = () => {
//   return api.get("/admission-sources", {
//     headers: getHeaders(),
//     params: {
//       session_year: getSessionYear(),
//     },
//   });
// };

// // ============================================================
// // Admission Pipeline
// // GET - Session
// // ============================================================

// export const getAdmissionPipeline = () => {
//   return api.get("/admissions/pipeline", {
//     headers: getHeaders(),
//     params: {
//       session_year: getSessionYear(),
//     },
//   });
// };

// // ============================================================
// // Single Admission
// // GET - UUID only
// // ============================================================

// export const getAdmissionByUuid = (uuid) => {
//   return api.get(`/admissions/${uuid}`, {
//     headers: getHeaders(),
//   });
// };

// // ============================================================
// // Get Stages
// // GET - No session
// // ============================================================

// export const getStages = () => {
//   return api.get("/admissions", {
//     headers: getHeaders(),
//   });
// };

// // ============================================================
// // Admission Counselors
// // GET - No session
// // ============================================================

// export const getAdmissionCounselors = () => {
//   return api.get("/admission-counselors/", {
//     headers: getHeaders(),
//   });
// };

// // ============================================================
// // Admission Analytics
// // GET - Session
// // ============================================================

// export const getAdmissionAnalytics = () => {
//   return api.get("/admissions/analytics", {
//     headers: getHeaders(),
//     params: {
//       session_year: getSessionYear(),
//     },
//   });
// };

// // ============================================================
// // Get All Admissions
// // GET - Session
// // ============================================================

// export const getAllAdmissions = () => {
//   return api.get("/admissions/all", {
//     headers: getHeaders(),
//     params: {
//       session_year: getSessionYear(),
//     },
//   });
// };

// // ============================================================
// // Stage History
// // GET - UUID only
// // ============================================================

// export const getAdmissionStageHistory = (uuid) => {
//   return api.get(`/admission-stage-history/${uuid}`, {
//     headers: getHeaders(),
//   });
// };

// // ============================================================
// // Activity Logs
// // GET - UUID only
// // ============================================================

// export const getAdmissionActivityLogs = (uuid) => {
//   return api.get(`/admission-activity-logs/${uuid}`, {
//     headers: getHeaders(),
//   });
// };

// // ============================================================
// // Get Followups
// // GET - UUID only
// // ============================================================

// export const getFollowups = (uuid) => {
//   return api.get(`/admissions/${uuid}/followups`, {
//     headers: getHeaders(),
//   });
// };

// // ============================================================
// // Guardian
// // PUT - NO session
// // ============================================================

// export const updateGuardian = (uuid, data) => {
//   return api.put(`/admissions/${uuid}/guardian`, data, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//       ...getHeaders(),
//     },
//   });
// };

// // ============================================================
// // Services
// // PUT - NO session
// // ============================================================

// export const updateServices = (uuid, data) => {
//   return api.put(`/admissions/${uuid}/Services`, data, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//       ...getHeaders(),
//     },
//   });
// };

// // ============================================================
// // Medical
// // PUT - NO session
// // ============================================================

// export const updateMedical = (uuid, data) => {
//   return api.put(`/admissions/${uuid}/Medical`, data, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//       ...getHeaders(),
//     },
//   });
// };

// // ============================================================
// // Documents
// // PUT - NO session
// // ============================================================

// export const updateDocuments = (uuid, data) => {
//   return api.put(`/admissions/${uuid}/Documents`, data, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//       ...getHeaders(),
//     },
//   });
// };

// // ============================================================
// // Full Stage Update
// // PUT - NO session
// // ============================================================

// export const updateStage = (uuid, data) => {
//   return api.put(`/admissions/${uuid}/stage`, data, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//       ...getHeaders(),
//     },
//   });
// };

// // ============================================================
// // Enroll Student
// // PUT - NO session
// // ============================================================

// export const enrollStudent = (uuid, stage_id) => {
//   const formData = new FormData();

//   formData.append("stage_id", stage_id);

//   return api.put(`/admissions/${uuid}/enroll`, formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//       ...getHeaders(),
//     },
//   });
// };

// // ============================================================
// // Update Admission
// // PUT - NO session
// // ============================================================

// export const updateAdmission = (uuid, data) => {
//   return api.put(`/admissions/${uuid}`, data, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//       ...getHeaders(),
//     },
//   });
// };

// // ============================================================
// // Archive Admission
// // PUT - NO session
// // ============================================================

// export const archiveAdmission = (uuid, data) => {
//   return api.put(`/admissions/${uuid}/archive`, data, {
//     headers: getHeaders(),
//   });
// };

// // ============================================================
// // Restore Admission
// // PUT - NO session
// // ============================================================

// export const restoreAdmission = (uuid) => {
//   return api.put(`/admissions/${uuid}/restore`, null, {
//     headers: getHeaders(),
//   });
// };

// // ============================================================
// // Delete Admission
// // DELETE - NO session
// // ============================================================

// export const deleteAdmission = (uuid) => {
//   return api.delete(`/admissions/${uuid}`, {
//     headers: getHeaders(),
//   });
// };

// // ============================================================
// // Create Followup
// // POST - NO session
// // ============================================================

// export const createFollowup = (uuid, data) => {
//   return api.post(`/admissions/${uuid}/followups`, data, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//       ...getHeaders(),
//     },
//   });
// };

// // ============================================================
// // Complete Followup
// // PUT - NO session
// // ============================================================

// export const completeFollowup = (id) => {
//   return api.put(`/admissions/followups/${id}/complete`, null, {
//     headers: getHeaders(),
//   });
// };

// // ============================================================
// // Delete Followup
// // DELETE - NO session
// // ============================================================

// export const deleteFollowup = (id) => {
//   return api.delete(`/admissions/followups/${id}`, {
//     headers: getHeaders(),
//   });
// };

// // ============================================================
// // Get Sections
// // GET - Session
// // ============================================================

// export const getSections = (classUuid) => {
//   return api.get("/sections", {
//     headers: getHeaders(),
//     params: {
//       class_id: classUuid,
//       count: false,
//       session_year: getSessionYear(),
//     },
//   });
// };

// // ============================================================
// // Reject Admission
// // PUT - NO session
// // ============================================================

// export const rejectAdmission = (uuid, reason) => {
//   return api.put(
//     `/admissions/${uuid}/reject`,
//     {
//       reason,
//     },
//     {
//       headers: getHeaders(),
//     }
//   );
// };

// // ============================================================
// // Reinstate Admission
// // PUT - NO session
// // ============================================================

// export const reinstateAdmission = (uuid) => {
//   return api.put(`/admissions/${uuid}/reinstate`, null, {
//     headers: getHeaders(),
//   });
// };

// // ============================================================
// // Import Admissions Excel
// // POST - NO session
// // ============================================================

// export const importAdmissions = (file) => {
//   const formData = new FormData();

//   formData.append("file", file);

//   return api.post("/admissions/import", formData, {
//     headers: {
//       ...getHeaders(),
//       "Content-Type": "multipart/form-data",
//     },
//   });
// };

// // ============================================================
// // MPSAT Imports, Admission Creation and Reports
// // ============================================================

// const uploadMpsExcel = (url, file) => {
//   const formData = new FormData();
//   formData.append("file", file);

//   return api.post(url, formData, {
//     headers: {
//       ...getHeaders(),
//       "Content-Type": "multipart/form-data",
//     },
//   });
// };

// export const importMpsRegistrations = (file) =>
//   uploadMpsExcel("/registrations/import-excel", file);

// export const importMpsetResults = (file) =>
//   uploadMpsExcel("/mpset-results/import-excel", file);

// export const createQualifiedMpsAdmissions = () =>
//   api.post("/mpset-results/create-qualified-admissions", null, {
//     headers: getHeaders(),
//   });

// export const getMpsetReport = (reportType) =>
//   api.get(`/mpset-reports/${reportType}`, {
//     headers: getHeaders(),
//     params: {
//       session: getSessionYear(),
//     },
//   });

// // ============================================================
// // Default Export
// // ============================================================

// export default {
//   createAdmission,
//   getAdmissionSources,
//   getAdmissionPipeline,
//   getAdmissionByUuid,
//   getStages,
//   getAdmissionCounselors,
//   getAdmissionAnalytics,
//   getAllAdmissions,
//   getAdmissionStageHistory,
//   getAdmissionActivityLogs,
//   getFollowups,
//   updateGuardian,
//   updateServices,
//   updateMedical,
//   updateDocuments,
//   updateStage,
//   enrollStudent,
//   updateAdmission,
//   archiveAdmission,
//   restoreAdmission,
//   deleteAdmission,
//   createFollowup,
//   completeFollowup,
//   deleteFollowup,
//   getSections,
//   rejectAdmission,
//   reinstateAdmission,
//   importAdmissions,
//   importMpsRegistrations,
//   importMpsetResults,
//   createQualifiedMpsAdmissions,
//   getMpsetReport,
// };


import api from "./axios";
import useAuthStore from "../store/authStore";
import useSessionStore from "../store/sessionStore";

// ============================================================
// Common Headers
// ============================================================

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// ============================================================
// Active Session
// ============================================================

const getSessionYear = () => {
  return useSessionStore.getState().sessionYear;
};

// ============================================================
// Create Admission
// POST - NO session filter added here
// ============================================================

export const createAdmission = (data) => {
  return api.post("/admissions/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getHeaders(),
    },
  });
};

// ============================================================
// Admission Sources
// GET - Session
// ============================================================

export const getAdmissionSources = () => {
  return api.get("/admission-sources/", {
    headers: getHeaders(),
    params: {
      session_year: getSessionYear(),
    },
  });
};

// ============================================================
// Admission Pipeline
// GET - Session
// ============================================================

export const getAdmissionPipeline = () => {
  return api.get("/admissions/pipeline", {
    headers: getHeaders(),
    params: {
      session_year: getSessionYear(),
    },
  });
};

// ============================================================
// Single Admission
// GET - UUID only
// ============================================================

export const getAdmissionByUuid = (uuid) => {
  return api.get(`/admissions/${uuid}`, {
    headers: getHeaders(),
  });
};

// ============================================================
// Get Stages
// GET - No session
// ============================================================

export const getStages = () => {
  return api.get("/admissions/", {
    headers: getHeaders(),
  });
};

// ============================================================
// Admission Counselors
// GET - No session
// ============================================================

export const getAdmissionCounselors = () => {
  return api.get("/admission-counselors/", {
    headers: getHeaders(),
  });
};

// ============================================================
// Admission Analytics
// GET - Session
// ============================================================

export const getAdmissionAnalytics = () => {
  return api.get("/admissions/analytics", {
    headers: getHeaders(),
    params: {
      session_year: getSessionYear(),
    },
  });
};

// ============================================================
// Get All Admissions
// GET - Session
// ============================================================

export const getAllAdmissions = () => {
  return api.get("/admissions/all", {
    headers: getHeaders(),
    params: {
      session_year: getSessionYear(),
    },
  });
};

// ============================================================
// Stage History
// GET - UUID only
// ============================================================

export const getAdmissionStageHistory = (uuid) => {
  return api.get(`/admission-stage-history/${uuid}`, {
    headers: getHeaders(),
  });
};

// ============================================================
// Activity Logs
// GET - UUID only
// ============================================================

export const getAdmissionActivityLogs = (uuid) => {
  return api.get(`/admission-activity-logs/${uuid}`, {
    headers: getHeaders(),
  });
};

// ============================================================
// Get Followups
// GET - UUID only
// ============================================================

export const getFollowups = (uuid) => {
  return api.get(`/admissions/${uuid}/followups`, {
    headers: getHeaders(),
  });
};

// ============================================================
// Guardian
// PUT - NO session
// ============================================================

export const updateGuardian = (uuid, data) => {
  return api.put(`/admissions/${uuid}/guardian`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getHeaders(),
    },
  });
};

// ============================================================
// Services
// PUT - NO session
// ============================================================

export const updateServices = (uuid, data) => {
  return api.put(`/admissions/${uuid}/Services`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getHeaders(),
    },
  });
};

// ============================================================
// Medical
// PUT - NO session
// ============================================================

export const updateMedical = (uuid, data) => {
  return api.put(`/admissions/${uuid}/Medical`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getHeaders(),
    },
  });
};

// ============================================================
// Documents
// PUT - NO session
// ============================================================

export const updateDocuments = (uuid, data) => {
  return api.put(`/admissions/${uuid}/Documents`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getHeaders(),
    },
  });
};

// ============================================================
// Full Stage Update
// PUT - NO session
// ============================================================

export const updateStage = (uuid, data) => {
  return api.put(`/admissions/${uuid}/stage`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getHeaders(),
    },
  });
};

// ============================================================
// Enroll Student
// PUT - NO session
// ============================================================

export const enrollStudent = (uuid, stage_id) => {
  const formData = new FormData();

  formData.append("stage_id", stage_id);

  return api.put(`/admissions/${uuid}/enroll`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getHeaders(),
    },
  });
};

// ============================================================
// Update Admission
// PUT - NO session
// ============================================================

export const updateAdmission = (uuid, data) => {
  return api.put(`/admissions/${uuid}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getHeaders(),
    },
  });
};

// ============================================================
// Archive Admission
// PUT - NO session
// ============================================================

export const archiveAdmission = (uuid, data) => {
  return api.put(`/admissions/${uuid}/archive`, data, {
    headers: getHeaders(),
  });
};

// ============================================================
// Restore Admission
// PUT - NO session
// ============================================================

export const restoreAdmission = (uuid) => {
  return api.put(`/admissions/${uuid}/restore`, null, {
    headers: getHeaders(),
  });
};

// ============================================================
// Delete Admission
// DELETE - NO session
// ============================================================

export const deleteAdmission = (uuid) => {
  return api.delete(`/admissions/${uuid}`, {
    headers: getHeaders(),
  });
};

// ============================================================
// Create Followup
// POST - NO session
// ============================================================

export const createFollowup = (uuid, data) => {
  return api.post(`/admissions/${uuid}/followups`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getHeaders(),
    },
  });
};

// ============================================================
// Complete Followup
// PUT - NO session
// ============================================================

export const completeFollowup = (id) => {
  return api.put(`/admissions/followups/${id}/complete`, null, {
    headers: getHeaders(),
  });
};

// ============================================================
// Delete Followup
// DELETE - NO session
// ============================================================

export const deleteFollowup = (id) => {
  return api.delete(`/admissions/followups/${id}`, {
    headers: getHeaders(),
  });
};

// ============================================================
// Get Sections
// GET - Session
// ============================================================

export const getSections = (classUuid) => {
  return api.get("/sections", {
    headers: getHeaders(),
    params: {
      class_id: classUuid,
      count: false,
      session_year: getSessionYear(),
    },
  });
};

// ============================================================
// Reject Admission
// PUT - NO session
// ============================================================

export const rejectAdmission = (uuid, reason) => {
  return api.put(
    `/admissions/${uuid}/reject`,
    {
      reason,
    },
    {
      headers: getHeaders(),
    }
  );
};

// ============================================================
// Reinstate Admission
// PUT - NO session
// ============================================================

export const reinstateAdmission = (uuid) => {
  return api.put(`/admissions/${uuid}/reinstate`, null, {
    headers: getHeaders(),
  });
};

// ============================================================
// Import Admissions Excel
// POST - NO session
// ============================================================

export const importAdmissions = (file) => {
  const formData = new FormData();

  formData.append("file", file);

  return api.post("/admissions/import", formData, {
    headers: {
      ...getHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });
};

// ============================================================
// MPSAT Imports, Admission Creation and Reports
// ============================================================

const uploadMpsExcel = (url, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post(url, formData, {
    headers: {
      ...getHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });
};

export const importMpsRegistrations = (file) =>
  uploadMpsExcel("/registrations/import-excel", file);

export const importMpsetResults = (file) =>
  uploadMpsExcel("/mpset-results/import-excel", file);

export const createQualifiedMpsAdmissions = () =>
  api.post("/mpset-results/create-qualified-admissions", null, {
    headers: getHeaders(),
  });

export const getMpsetReport = (reportType) =>
  api.get(`/mpset-reports/${reportType}`, {
    headers: getHeaders(),
    params: {
      session: getSessionYear(),
    },
  });

// ============================================================
// Default Export
// ============================================================

export default {
  createAdmission,
  getAdmissionSources,
  getAdmissionPipeline,
  getAdmissionByUuid,
  getStages,
  getAdmissionCounselors,
  getAdmissionAnalytics,
  getAllAdmissions,
  getAdmissionStageHistory,
  getAdmissionActivityLogs,
  getFollowups,
  updateGuardian,
  updateServices,
  updateMedical,
  updateDocuments,
  updateStage,
  enrollStudent,
  updateAdmission,
  archiveAdmission,
  restoreAdmission,
  deleteAdmission,
  createFollowup,
  completeFollowup,
  deleteFollowup,
  getSections,
  rejectAdmission,
  reinstateAdmission,
  importAdmissions,
  importMpsRegistrations,
  importMpsetResults,
  createQualifiedMpsAdmissions,
  getMpsetReport,
};
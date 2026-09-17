// import api from "./axios";
// import useAuthStore from "../store/authStore";

// const getHeaders = () => {
//   const { instituteUUID } = useAuthStore.getState();

//   return {
//     "X-Institute-UUID": instituteUUID,
//   };
// };


// // ---------------- Communications / Notices ----------------

// export const getNotices = async () => {
//   const { data } = await api.get("/communications/notes", {
//     headers: getHeaders(),
//   });
//   return data;
// };

// export const saveNoticeDraft = async (formData) => {
//   formData.set("status", "DRAFT");
//   const { data } = await api.post("/communications/notes", formData, {
//     // The axios instance defaults Content-Type to application/json; unset it
//     // here so the browser sets multipart/form-data with the right boundary.
//     headers: { ...getHeaders(), "Content-Type": undefined },
//   });
 
//   return data;
// };

// export const publishNotice = async (formData) => {
//   formData.set("status", "PUBLISHED");
//   const { data } = await api.post("/communications/notes", formData, {
//     headers: { ...getHeaders(), "Content-Type": undefined },
//   });
 
//   return data;
// };

// export const getNoticeById = async (uuid) => {
//   const { data } = await api.get("/communications/notes", {
//     headers: getHeaders(),
//     params: { notes_uuid: uuid },
//   });
//   return { ...data, data: Array.isArray(data?.data) ? data.data[0] : null };
// };

// export const getNoticeCategories = async () => {
//   const { data } = await api.get("/communications/categories", {
//     headers: getHeaders(),
//   });
//   return data;
// };

// export const updateNotice = async (uuid, formData) => {
//   const { data } = await api.patch(`/communications/notes/${uuid}`, formData, {
//     headers: { ...getHeaders(), "Content-Type": undefined },
//   });
//   return data;
// };

// export const deleteNotice = async (uuid) => {
//   const { data } = await api.delete(`/communications/notes/${uuid}`, {
//     headers: getHeaders(),
//   });
//   return data;
// };

// export const publishNoticeById = async (uuid) => {
//   const formData = new FormData();
//   formData.append("status", "PUBLISHED");
//   const { data } = await api.patch(`/communications/notes/${uuid}`, formData, {
//     headers: { ...getHeaders(), "Content-Type": undefined },
//   });
//   return data;
// };

// export const unpublishNoticeById = async (uuid) => {
//   const formData = new FormData();
//   formData.append("status", "UNPUBLISHED");
//   const { data } = await api.patch(`/communications/notes/${uuid}`, formData, {
//     headers: { ...getHeaders(), "Content-Type": undefined },
//   });
//   return data;
// };


import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};


// ---------------- Communications / Notices ----------------

export const getNotices = async () => {
  const { data } = await api.get("/communications", {
    headers: getHeaders(),
  });
  return data;
};

// Notices visible to the currently logged-in teacher.  The backend applies
// the teacher audience rules; optional filters match the student portal API.
export const getTeacherPortalNotices = async ({
  category,
  search,
  page = 1,
  pageSize = 100,
} = {}) => {
  const params = { page, page_size: pageSize };
  if (category) params.category = category;
  if (search) params.search = search;

  const { data } = await api.get("/teacher-portal/notices", {
    headers: getHeaders(),
    params,
  });
  return data;
};

export const saveNoticeDraft = async (formData) => {
  const { data } = await api.post("/communications/save-draft", formData, {
    // The axios instance defaults Content-Type to application/json; unset it
    // here so the browser sets multipart/form-data with the right boundary.
    headers: { ...getHeaders(), "Content-Type": undefined },
  });
 
  return data;
};

export const publishNotice = async (formData) => {
  const { data } = await api.post("/communications/publish", formData, {
    headers: { ...getHeaders(), "Content-Type": undefined },
  });
 
  return data;
};

export const getNoticeById = async (uuid) => {
  const { data } = await api.get(`/communications/${uuid}`, {
    headers: getHeaders(),
  });
  return data;
};

export const getNoticeCategories = async () => {
  const { data } = await api.get("/communications/categories", {
    headers: getHeaders(),
  });
  return data;
};

// Creates a new communication category on the fly (e.g. from the "+" button
// next to the notice tabs). Mirrors CommunicationService.create_category /
// CategoryCreateRequest on the backend, which expects { name } as JSON.
export const createNoticeCategory = async (name) => {
  const { data } = await api.post(
    "/communications/categories",
    { name },
    { headers: getHeaders() }
  );
  return data;
};

export const updateNoticeCategory = async (uuid, name) => {
  const { data } = await api.put(
    `/communications/categories/${uuid}`,
    { name },
    { headers: getHeaders() }
  );
  return data;
};

export const deleteNoticeCategory = async (uuid) => {
  const { data } = await api.delete(`/communications/categories/${uuid}`, {
    headers: getHeaders(),
  });
  return data;
};

export const updateNotice = async (uuid, formData) => {
  if (!uuid) throw new Error("A communication UUID is required to update a notice.");
  const { data } = await api.put(`/communications/${uuid}`, formData, {
    headers: { ...getHeaders(), "Content-Type": undefined },
  });
  return data;
};

export const deleteNotice = async (uuid) => {
  if (!uuid) throw new Error("A communication UUID is required to delete a notice.");
  const { data } = await api.delete(`/communications/${uuid}`, {
    headers: getHeaders(),
  });
  return data;
};

export const publishNoticeById = async (uuid) => {
  const { data } = await api.patch(`/communications/${uuid}/publish`, null, {
    headers: getHeaders(),
  });
  return data;
};

export const unpublishNoticeById = async (uuid) => {
  const { data } = await api.patch(`/communications/${uuid}/unpublish`, null, {
    headers: getHeaders(),
  });
  return data;
};

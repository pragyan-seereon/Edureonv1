import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// ---------------- Admin APIs ----------------

// Dashboard stats
export const getGalleryStats = async () => {
  const { data } = await api.get("/gallery/stats", {
    headers: getHeaders(),
  });

  return data.data;
};

// Create album with media (multipart/form-data)
export const createAlbum = async (formData) => {
  const { data } = await api.post("/gallery/albums", formData, {
    headers: {
      ...getHeaders(),
      "Content-Type": undefined, // let the browser set multipart/form-data + boundary
    },
  });

  return data;
};

// List all albums (paginated)
export const getAlbums = async ({ page = 1, pageSize = 20, published, category, search } = {}) => {
  const { data } = await api.get("/gallery/albums", {
    params: {
      page,
      page_size: pageSize,
      ...(published !== undefined ? { published } : {}),
      ...(category ? { category } : {}),
      ...(search ? { search } : {}),
    },
    headers: getHeaders(),
  });

  return data; // { success, data: [...], pagination }
};

// Get album details (with full media array)
export const getAlbumDetail = async (albumUuid) => {
  const { data } = await api.get(`/gallery/albums/${albumUuid}`, {
    headers: getHeaders(),
  });

  return data.data;
};

// Update album (application/json)
export const updateAlbum = async (albumUuid, payload) => {
  const { data } = await api.patch(`/gallery/albums/${albumUuid}`, payload, {
    headers: getHeaders(), // JSON content-type is axios's default, no override needed
  });

  return data;
};

// Publish album
export const publishAlbum = async (albumUuid) => {
  const { data } = await api.patch(`/gallery/albums/${albumUuid}/publish`, null, {
    headers: getHeaders(),
  });

  return data;
};

// Unpublish album
export const unpublishAlbum = async (albumUuid) => {
  const { data } = await api.patch(`/gallery/albums/${albumUuid}/unpublish`, null, {
    headers: getHeaders(),
  });

  return data;
};

// Add media to an existing album (multipart/form-data)
export const addAlbumMedia = async (albumUuid, formData) => {
  const { data } = await api.post(`/gallery/albums/${albumUuid}/media`, formData, {
    headers: {
      ...getHeaders(),
      "Content-Type": undefined, // let the browser set multipart/form-data + boundary
    },
  });

  return data;
};

// Change media order (application/json array)
export const updateMediaOrder = async (albumUuid, orderPayload) => {
  const { data } = await api.patch(`/gallery/albums/${albumUuid}/media/order`, orderPayload, {
    headers: getHeaders(),
  });

  return data;
};

// Delete one media file
export const deleteAlbumMedia = async (albumUuid, mediaUuid) => {
  const { data } = await api.delete(`/gallery/albums/${albumUuid}/media/${mediaUuid}`, {
    headers: getHeaders(),
  });

  return data;
};

// Delete album (and its media + S3 files)
export const deleteAlbum = async (albumUuid) => {
  const { data } = await api.delete(`/gallery/albums/${albumUuid}`, {
    headers: getHeaders(),
  });

  return data;
};

// ---------------- Student and Parent APIs ----------------

// List published portal albums (audience filtered by logged-in user's role)
export const getPortalAlbums = async ({ page = 1, pageSize = 20, category, search } = {}) => {
  const { data } = await api.get("/gallery/portal/albums", {
    params: {
      page,
      page_size: pageSize,
      ...(category ? { category } : {}),
      ...(search ? { search } : {}),
    },
    headers: getHeaders(),
  });

  return data; // { success, data: [...], pagination }
};

// Open a portal album (full album + ordered media)
export const getPortalAlbumDetail = async (albumUuid) => {
  const { data } = await api.get(`/gallery/portal/albums/${albumUuid}`, {
    headers: getHeaders(),
  });

  return data.data;
};
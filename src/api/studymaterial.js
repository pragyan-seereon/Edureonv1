import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// Get all study materials
export const getStudyMaterials = async () => {
  const { data } = await api.get("/materials", {
    headers: getHeaders(),
  });

  return data;
};

// Create / share study material
export const createStudyMaterial = async (formData) => {
  const { data } = await api.post("/materials", formData, {
    headers: {
      ...getHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

// Update an existing study material
export const updateStudyMaterial = async (material_uuid, formData) => {
  const { data } = await api.put(`/materials/${material_uuid}`, formData, {
    headers: {
      ...getHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};
// Download study material
export const downloadStudyMaterial = async (material_uuid) => {
  const { data } = await api.get(
    `/materials/${material_uuid}/download`,
    {
      headers: getHeaders(),
    }
  );

  return data;
};

import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const instituteUUID = useAuthStore.getState().instituteUUID;
  return {
    "X-Institute-UUID": instituteUUID,
    "institute-uuid": instituteUUID,
  };
};


export async function downloadSampleTimetable() {
  const response = await api.get("/regular-timetable/sample/download", {
    responseType: "blob",
    headers: getHeaders(),
  });
  return response.data;
}

/**
 * Fetches the saved timetable for a given section + academic year.
 * Expected shape: { timetable: [...periodRows], timetable_uuid, version, status, file_name, ... }
 * Throws (so the caller's try/catch treats "no timetable yet" as empty state).
 */
export async function getSectionTimetable(sectionUUID, academicYear) {
  const response = await api.get(
    `/regular-timetable/section/${sectionUUID}`,
    { params: { academic_year: academicYear }, headers: getHeaders() },
  );
  return response.data;
}

export async function downloadSummerTimetableSample() {
  const response = await api.get("/summer-timetable/sample/download", {
    responseType: "blob",
    headers: getHeaders(),
  });
  return response.data;
}

export async function downloadExaminationTimetableSample() {
  const response = await api.get("/examination-timetable/sample/download", {
    responseType: "blob",
    headers: getHeaders(),
  });
  return response.data;
}

export async function downloadAdditionalTimetableSample() {
  const response = await api.get("/additional-timetable/sample/download", {
    responseType: "blob",
    headers: getHeaders(),
  });
  return response.data;
}

/**
 * Uploads a filled-in Excel file for a class/section/academic year.
 * Sends multipart/form-data.
 */
export async function uploadTimetable({
  classUUID,
  sectionUUID,
  academicYear,
  file,
}) {
  const formData = new FormData();
  formData.append("institute_uuid", useAuthStore.getState().instituteUUID);
  formData.append("class_uuid", classUUID);
  formData.append("section_uuid", sectionUUID);
  formData.append("academic_year", academicYear);
  formData.append("file", file);

  const response = await api.post("/regular-timetable/upload", formData, {
    headers: { ...getHeaders(), "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function uploadSummerTimetable({
  classUUID,
  sectionUUID,
  academicYear,
  file,
}) {
  const formData = new FormData();
  formData.append("institute_uuid", useAuthStore.getState().instituteUUID);
  formData.append("class_uuid", classUUID);
  formData.append("section_uuid", sectionUUID);
  formData.append("academic_year", academicYear);
  formData.append("file", file);

  const response = await api.post("/summer-timetable/upload", formData, {
    headers: { ...getHeaders(), "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

async function uploadSpecialTimetable(path, {
  classUUID,
  sectionUUID,
  academicYear,
  file,
}) {
  const formData = new FormData();
  formData.append("institute_uuid", useAuthStore.getState().instituteUUID);
  formData.append("academic_year", academicYear);
  formData.append("academic_year_uuid", academicYear);
  formData.append("class_uuid", classUUID);
  formData.append("section_uuid", sectionUUID);
  if (path.includes("additional")) {
    formData.append("section_uuids", sectionUUID);
  }
  formData.append("file", file);

  const response = await api.post(path, formData, {
    headers: { ...getHeaders(), "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export function uploadExaminationTimetable(payload) {
  return uploadSpecialTimetable("/examination-timetable/upload", payload);
}

export function uploadAdditionalTimetable(payload) {
  return uploadSpecialTimetable("/additional-timetable/upload", payload);
}

export async function deleteTimetable(timetableUUID) {
  const response = await api.delete(`/regular-timetable/${timetableUUID}`, {
    headers: getHeaders(),
  });
  return response.data;
}

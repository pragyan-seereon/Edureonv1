

import api from "./axios";
import useAuthStore from "../store/authStore";

// Get Institute UUID from auth store
const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// Get students for attendance
export const getAttendanceStudents = async (classUUID, sectionUUID) => {
  const { data } = await api.get(
    "/teacher-portal/attendance/students",
    {
      params: {
        class_uuid: classUUID,
        section_uuid: sectionUUID,
      },
      headers: getHeaders(),
    }
  );

  return data;
};

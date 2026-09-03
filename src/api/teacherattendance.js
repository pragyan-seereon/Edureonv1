import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};


export const getTeacherClasses = async () => {
  const { data } = await api.get("/teacher-portal/my-classes", {
    headers: getHeaders(),
  });

  return data;
};

export const getAttendanceStudents = async (classUuid, sectionUuid) => {
  const { data } = await api.get("/teacher-portal/attendance/students", {
    headers: getHeaders(),
    params: {
      class_uuid: classUuid,
      section_uuid: sectionUuid,
    },
  });

  return data;
};

export const submitAttendance = async (sectionUuid, classUuid, attendanceDate, students) => {
  const { data } = await api.post(
    `/teacher-portal/attendance/${sectionUuid}/submit`,
    {
      attendance_date: attendanceDate,
      students,
    },
    {
      headers: getHeaders(),
      params: { class_uuid: classUuid },
    },
  );

  return data;
};
import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// ---------------- Gate Pass Students ----------------

// GET /gate-pass/students/search?search=&page=&page_size=
export const searchGatePassStudents = async (query = "", page = 1, pageSize = 20) => {
  const { data } = await api.get("/gate-pass/students/search", {
    headers: getHeaders(),
    params: {
      search: query,
      page,
      page_size: pageSize,
    },
  });

  return data;
};

// ---------------- Gate Pass Create / List ----------------

// POST /gate-pass
// payload: {
//   pass_type, person_name, student_uuid, class_uuid, section_uuid,
//   out_time, contact_number, vehicle_number, permission_authority,
//   accompanied_by, purpose
// }
export const createGatePass = async (payload) => {
  const { data } = await api.post("/gate-pass", payload, {
    headers: getHeaders(),
  });

  return data;
};

// GET /gate-pass?page=&page_size=
// Returns { success, page, page_size, total, data: [...] } — all gate passes,
// newest first, across the institute.
export const getGatePasses = async (page = 1, pageSize = 10) => {
  const { data } = await api.get("/gate-pass", {
    headers: getHeaders(),
    params: { page, page_size: pageSize },
  });

  return data;
};
// ---------------- Gate Pass Employees ----------------

// GET /gate-pass/employees/search?search=&page=&page_size=
export const searchGatePassEmployees = async (query = "", page = 1, pageSize = 20) => {
  const { data } = await api.get("/gate-pass/employees/search", {
    headers: getHeaders(),
    params: {
      search: query,
      page,
      page_size: pageSize,
    },
  });

  return data;
};


// GET /gate-pass/:gatePassUUID
export const getGatePassByUUID = async (gatePassUUID) => {
  const { data } = await api.get(`/gate-pass/${gatePassUUID}`, {
    headers: getHeaders(),
  });
  return data;
};


// DELETE /gate-pass/:gatePassUUID
export const deleteGatePass = async (gatePassUUID) => {
  const { data } = await api.delete(`/gate-pass/${gatePassUUID}`, {
    headers: getHeaders(),
  });
  return data;
};

// PATCH /gate-pass/:gatePassUUID/return
export const returnGatePass = async (gatePassUUID) => {
  const { data } = await api.patch(`/gate-pass/${gatePassUUID}/return`, {}, {
    headers: getHeaders(),
  });
  return data;
};
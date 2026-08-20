import axios from "axios";

const API_BASE_URL = "https://api.edureone.com/api/v1";

export const getParentAdmissionConfirmation = (token) => {
  return axios.get(
    `${API_BASE_URL}/parent/admission-confirmation/${token}`
  );
};

export const submitParentAdmissionConfirmation = (token) => {
  return axios.post(
    `${API_BASE_URL}/parent/admission-confirmation/${token}`
  );
};
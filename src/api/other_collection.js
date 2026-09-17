import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// ================================
// Other Collection Type APIs
// ================================

export const getOtherCollectionRoles = () =>
  api.get("/other-collections/roles", {
    headers: getHeaders(),
  });

export const getOtherCollectionTypes = (params = {}) =>
  api.get("/other-collections/types", {
    headers: getHeaders(),
    params,
  });

export const createOtherCollectionType = (data) =>
  api.post("/other-collections/types", data, {
    headers: getHeaders(),
  });

export const updateOtherCollectionType = (typeUUID, data) =>
  api.patch(`/other-collections/types/${typeUUID}`, data, {
    headers: getHeaders(),
  });

// ================================
// Other Collection Payment APIs
// ================================

export const getOtherCollections = (params = {}) =>
  api.get("/other-collections", {
    headers: getHeaders(),
    params,
  });

export const getOtherCollectionByUuid = (collectionUUID) =>
  api.get(`/other-collections/${collectionUUID}`, {
    headers: getHeaders(),
  });

export const getOtherCollectionReceipt = (collectionUUID) =>
  api.get(`/other-collections/${collectionUUID}/receipt`, {
    headers: getHeaders(),
  });

export const getOtherCollectionReceiptPdf = (collectionUUID) =>
  api.get(`/other-collections/${collectionUUID}/receipt/pdf`, {
    headers: getHeaders(),
    responseType: "blob",
  });

export const createOtherCollection = (data) =>
  api.post("/other-collections", data, {
    headers: getHeaders(),
  });

export const createOtherCollectionRazorpayOrder = (data) =>
  api.post("/other-collections/razorpay/create-order", data, {
    headers: getHeaders(),
  });

export const verifyOtherCollectionRazorpayPayment = (data) =>
  api.post("/other-collections/razorpay/verify", data, {
    headers: getHeaders(),
  });

export const cancelOtherCollection = (collectionUUID) =>
  api.patch(
    `/other-collections/${collectionUUID}/cancel`,
    {},
    {
      headers: getHeaders(),
    }
  );

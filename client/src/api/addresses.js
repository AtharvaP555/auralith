import api from "./axios";

export const fetchAddresses = async () => {
  const response = await api.get("/addresses");
  return response.data;
};

export const createAddress = async (data) => {
  const response = await api.post("/addresses", data);
  return response.data;
};

export const updateAddress = async ({ id, ...data }) => {
  const response = await api.put(`/addresses/${id}`, data);
  return response.data;
};

export const deleteAddress = async (id) => {
  const response = await api.delete(`/addresses/${id}`);
  return response.data;
};

export const setDefaultAddress = async (id) => {
  const response = await api.patch(`/addresses/${id}/default`);
  return response.data;
};

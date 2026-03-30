import api from "./axios";

export const createOrder = async (data) => {
  const response = await api.post("/orders", data);
  return response.data;
};

export const verifyPayment = async (data) => {
  const response = await api.post("/orders/verify-payment", data);
  return response.data;
};

export const fetchOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

export const fetchOrder = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

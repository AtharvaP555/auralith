import api from "./axios";

export const adminGetProducts = async () => {
  const response = await api.get("/products?limit=100");
  return response.data;
};

export const adminCreateProduct = async (data) => {
  const response = await api.post("/products", data);
  return response.data;
};

export const adminUpdateProduct = async ({ id, ...data }) => {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
};

export const adminDeleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const adminGetOrders = async () => {
  const response = await api.get("/admin/orders");
  return response.data;
};

export const adminUpdateOrderStatus = async ({ id, status }) => {
  const response = await api.put(`/admin/orders/${id}`, { status });
  return response.data;
};

export const adminGetCategories = async () => {
  const response = await api.get("/products/categories");
  return response.data;
};

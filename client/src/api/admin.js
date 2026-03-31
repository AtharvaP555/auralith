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

export const adminGetCoupons = async () => {
  const response = await api.get("/coupons/admin");
  return response.data;
};

export const adminCreateCoupon = async (data) => {
  const response = await api.post("/coupons/admin", data);
  return response.data;
};

export const adminDeleteCoupon = async (id) => {
  const response = await api.delete(`/coupons/admin/${id}`);
  return response.data;
};

export const uploadProductImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await api.post("/upload/product-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

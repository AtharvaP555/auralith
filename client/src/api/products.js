import api from "./axios";

export const fetchProducts = async (params = {}) => {
  const response = await api.get("/products", { params });
  return response.data;
};

export const fetchProduct = async (slug) => {
  const response = await api.get(`/products/${slug}`);
  return response.data;
};

export const fetchCategories = async () => {
  const response = await api.get("/products/categories");
  return response.data;
};

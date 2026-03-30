import api from "./axios";

export const fetchWishlist = async () => {
  const response = await api.get("/wishlist");
  return response.data;
};

export const toggleWishlist = async (productId) => {
  const response = await api.post("/wishlist/toggle", { productId });
  return response.data;
};

export const checkWishlist = async (productId) => {
  const response = await api.get(`/wishlist/check/${productId}`);
  return response.data;
};

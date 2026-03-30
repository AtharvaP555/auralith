import api from "./axios";

export const fetchReviews = async (slug) => {
  const response = await api.get(`/products/${slug}/reviews`);
  return response.data;
};

export const submitReview = async ({ slug, rating, comment }) => {
  const response = await api.post(`/products/${slug}/reviews`, {
    rating,
    comment,
  });
  return response.data;
};

export const deleteReview = async ({ slug, id }) => {
  const response = await api.delete(`/products/${slug}/reviews/${id}`);
  return response.data;
};

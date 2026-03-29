import api from "./axios";

export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const logoutUser = async (refreshToken) => {
  const response = await api.post("/auth/logout", { refreshToken });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

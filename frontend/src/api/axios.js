import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach the JWT to every request once the user is logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("faceattend_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

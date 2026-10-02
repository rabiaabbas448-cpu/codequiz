import axios from "axios";

const API = axios.create({
  baseURL: "https://steadfast-generosity-production-0b70.up.railway.app/api",
});

// Attach the JWT token (if present) to every outgoing request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
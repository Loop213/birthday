import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: apiBaseUrl
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("birthday-glow-token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function extractErrorMessage(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.code === "ERR_NETWORK" || (error?.request && !error?.response)) {
    return `Network error: backend unreachable or blocked by CORS. Verify VITE_API_URL (${apiBaseUrl}) and the backend CLIENT_ORIGIN setting.`;
  }

  return (
    error?.message ||
    "Something went wrong. Please try again."
  );
}

export default api;

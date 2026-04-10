import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
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
    return "Unable to connect to the server right now. Please try again.";
  }

  return (
    error?.message ||
    "Something went wrong. Please try again."
  );
}

export default api;

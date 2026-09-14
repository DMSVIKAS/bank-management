import axios from "axios";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://bank-backend-sx1g.onrender.com"
    : process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.response.use(
  r => r,
  err => {
    const detail =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message;
    console.error("API error:", detail, err.response?.data);
    return Promise.reject(err);
  }
);

export default api;

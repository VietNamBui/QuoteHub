import axios from "axios";

export const API_BASE_URL = "http://localhost:5454";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Thêm interceptor để tự động gắn token vào mọi request trừ signup/signin
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");

  // Không gắn token cho các request signup/signin
  if (
    token &&
    !config.url.includes("/auth/signup") &&
    !config.url.includes("/auth/signin")
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

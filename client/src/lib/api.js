import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

// Attach the access token to every outgoing request.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On a 401, log the user out client-side if it's an authenticated route failure.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isAuthRoute = error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/register");
    if (error.response?.status === 401 && !isAuthRoute) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

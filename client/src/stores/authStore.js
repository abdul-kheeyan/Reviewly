import { create } from "zustand";
import { api } from "@/lib/api";

const getSavedAuth = () => {
  try {
    const raw = localStorage.getItem("reviewly_auth");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const savedAuth = getSavedAuth();

export const useAuthStore = create((set, get) => ({
  user: savedAuth?.user || null,
  accessToken: savedAuth?.accessToken || null,
  refreshToken: savedAuth?.refreshToken || null,
  isAuthenticated: !!savedAuth?.accessToken,
  loading: false,
  error: null,
  
  login: ({ user, accessToken, refreshToken }) => {
    localStorage.setItem(
      "reviewly_auth",
      JSON.stringify({ user, accessToken, refreshToken })
    );
    set({ user, accessToken, refreshToken, isAuthenticated: true, error: null });
  },
    
  logout: () => {
    localStorage.removeItem("reviewly_auth");
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, error: null });
  },
  
  clearError: () => set({ error: null }),
  
  registerUser: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/register", { name, email, password });
      if (res.data?.success && res.data?.data) {
        get().login(res.data.data);
      }
      set({ loading: false });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Registration failed";
      set({ error: msg, loading: false });
      throw err;
    }
  },
  
  loginUser: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data?.success && res.data?.data) {
        get().login(res.data.data);
      }
      set({ loading: false });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Invalid email or password";
      set({ error: msg, loading: false });
      throw err;
    }
  }
}));

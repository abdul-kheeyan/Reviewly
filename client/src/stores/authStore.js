import { create } from "zustand";

// In-memory only — do not swap this for localStorage without weighing the XSS
// tradeoffs; refreshToken in particular is more safely kept in an httpOnly cookie.
export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  login: ({ user, accessToken, refreshToken }) =>
    set({ user, accessToken, refreshToken, isAuthenticated: true }),
  logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
}));

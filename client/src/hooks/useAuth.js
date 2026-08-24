import { useAuthStore } from "@/stores/authStore";

// Thin, readable wrapper over the auth store for components that just need
// to know "who is signed in" without touching store internals directly.
export function useAuth() {
  const { 
    user, isAuthenticated, login, logout, 
    loading, error, registerUser, loginUser, clearError 
  } = useAuthStore();
  
  return { 
    user, isAuthenticated, login, logout,
    loading, error, registerUser, loginUser, clearError
  };
}

import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/context/AuthModalContext";

/**
 * Guards routes that need an account (e.g. /dashboard). Unlike a typical
 * "redirect to /login" pattern, this sends the visitor back to the public
 * landing page ("/") and opens the sign-in modal there — so nobody ever
 * lands on a bare login screen with no context for what they were doing.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const { openModal } = useAuthModal();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      openModal("Sign in required", "Please sign in to access your dashboard.");
    }
  }, [isAuthenticated, openModal]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}

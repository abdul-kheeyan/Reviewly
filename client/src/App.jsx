import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthModalProvider } from "@/context/AuthModalContext";
import { LoginModal } from "@/components/LoginModal";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LandingPage from "@/pages/LandingPage";
import DashboardPage from "@/pages/DashboardPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthModalProvider>
        <Routes>
          {/* Public — nobody is redirected to a login screen just for visiting the site. */}
          <Route path="/" element={<LandingPage />} />

          {/* Protected — ProtectedRoute bounces unauthenticated visitors back to "/"
              and opens the sign-in modal there instead of showing a bare login page. */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>

        {/* Rendered once, globally, so any component can open it via useAuthModal(). */}
        <LoginModal />
      </AuthModalProvider>
    </BrowserRouter>
  );
}

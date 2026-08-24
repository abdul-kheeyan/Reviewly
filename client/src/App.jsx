import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthModalProvider } from "@/context/AuthModalContext";
import { LoginModal } from "@/components/LoginModal";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LandingPage from "@/pages/LandingPage";
import DashboardPage from "@/pages/DashboardPage";
import RepoDetailPage from "@/pages/RepoDetailPage";

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
          
          <Route
            path="/dashboard/repo/:repoId"
            element={
              <ProtectedRoute>
                <RepoDetailPage />
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

import { createContext, useContext, useState, useCallback } from "react";

const AuthModalContext = createContext(undefined);

const DEFAULT_TITLE = "Sign in";
const DEFAULT_DESCRIPTION =
  "Sign in with GitHub to continue — everything else on this page stays open to browse.";

/**
 * Wraps the app so any component can trigger the sign-in modal without the
 * landing page ever being forced behind a login wall. Only actions that
 * actually need an account (ProtectedRoute, "Connect a repository", etc.)
 * call openModal().
 */
export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION);

  const openModal = useCallback((newTitle = DEFAULT_TITLE, newDescription = DEFAULT_DESCRIPTION) => {
    setTitle(newTitle);
    setDescription(newDescription);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <AuthModalContext.Provider value={{ isOpen, title, description, openModal, closeModal }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}

import { useAuthModal } from "@/context/AuthModalContext";
import { useAuth } from "@/hooks/useAuth";
import { Github, X } from "lucide-react";

// TODO: swap this stub for a real redirect to GitHub's OAuth authorize URL,
// e.g. `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo`.
export function LoginModal() {
  const { isOpen, title, description, closeModal } = useAuthModal();
  const { login } = useAuth();

  if (!isOpen) return null;

  async function handleGithubSignIn() {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/github/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "demo-code" }),
    });
    const json = await res.json();
    if (json.success) {
      login(json.data);
      closeModal();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-800/75 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div className="w-full max-w-sm rounded-2xl border border-gray-700 bg-[#292d31] p-8 shadow-2xl">
        <button onClick={closeModal} className="float-right text-gray-400 hover:text-white" aria-label="Close">
          <X size={18} />
        </button>
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        <p className="mb-6 mt-1.5 text-sm text-gray-400">{description}</p>

        <button
          onClick={handleGithubSignIn}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
        >
          <Github size={16} /> Continue with GitHub
        </button>

        <p className="mt-4 text-center text-xs text-gray-400">
          You can keep browsing the page without an account.
        </p>
      </div>
    </div>
  );
}

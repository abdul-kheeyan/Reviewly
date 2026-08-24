import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link as LinkIcon, Github, Plus, X, Loader2, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";

export function AddRepoModal({ isOpen, onClose, onRepoAdded }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!repoUrl.includes("github.com/")) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/repos", { repoUrl });
      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setRepoUrl("");
          if (onRepoAdded) onRepoAdded(res.data.data.repo);
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add repository.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-2xl relative shadow-emerald-900/20"
          >
            {success ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex flex-col items-center justify-center p-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white">Repository Added!</h3>
              </motion.div>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>

                <div className="p-8">
                  <div className="mb-8 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                      <Github className="h-6 w-6 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-display font-semibold text-white">
                      Add Repository
                    </h2>
                    <p className="text-sm text-gray-400 mt-2">
                      Connect a public GitHub repository to analyze.
                    </p>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="url"
                        placeholder="https://github.com/owner/repo"
                        required
                        className="w-full rounded-xl border border-gray-600 bg-gray-700/50 py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !repoUrl}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:opacity-90 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> Add Repository</>}
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

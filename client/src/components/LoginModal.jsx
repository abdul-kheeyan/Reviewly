import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, X, Loader2, CheckCircle } from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function LoginModal() {
  const { isOpen, closeModal } = useAuthModal();
  const { loginUser, registerUser, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      setValidationError("");
      setSuccess(false);
      clearError();
    }
  }, [isOpen, clearError]);

  if (!isOpen) return null;

  const getPasswordStrength = (pass) => {
    if (!pass) return { strength: "", color: "bg-gray-600", width: "w-0" };
    if (pass.length < 6) return { strength: "Weak", color: "bg-red-500", width: "w-1/3" };
    if (pass.length < 10) return { strength: "Medium", color: "bg-yellow-500", width: "w-2/3" };
    return { strength: "Strong", color: "bg-emerald-500", width: "w-full" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");
    clearError();

    if (!formData.email.includes("@")) {
      return setValidationError("Please enter a valid email address.");
    }
    if (formData.password.length < 6) {
      return setValidationError("Password must be at least 6 characters.");
    }

    try {
      if (isLogin) {
        await loginUser(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          return setValidationError("Passwords do not match.");
        }
        await registerUser(formData.name, formData.email, formData.password);
      }
      setSuccess(true);
      setTimeout(() => {
        closeModal();
        navigate("/dashboard");
      }, 800);
    } catch (err) {
      // Error is stored in authStore.error and displayed
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
                <h3 className="text-xl font-semibold text-white">Success!</h3>
                <p className="text-gray-400 mt-2">Welcome {isLogin ? "back" : "aboard"}.</p>
              </motion.div>
            ) : (
              <>
                <button
                  onClick={closeModal}
                  className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>

                <div className="p-8">
                  <div className="mb-8 flex flex-col items-center text-center">
                    <h2 className="text-2xl font-display font-semibold text-white">
                      {isLogin ? "Welcome back" : "Create an account"}
                    </h2>
                    <p className="text-sm text-gray-400 mt-2">
                      {isLogin ? "Sign in to access your dashboard" : "Join Reviewly to start analyzing repositories"}
                    </p>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                      {error}
                    </motion.div>
                  )}
                  {validationError && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                      {validationError}
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {!isLogin && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="text"
                              placeholder="Full Name"
                              required={!isLogin}
                              className="w-full rounded-xl border border-gray-600 bg-gray-700/50 py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        placeholder="Email Address"
                        required
                        className="w-full rounded-xl border border-gray-600 bg-gray-700/50 py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        required
                        className="w-full rounded-xl border border-gray-600 bg-gray-700/50 py-3 pl-10 pr-10 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {!isLogin && formData.password.length > 0 && (
                      <div className="space-y-1">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
                          <div className={cn("h-full transition-all duration-300", passwordStrength.width, passwordStrength.color)} />
                        </div>
                        <p className={cn("text-xs text-right", formData.password.length < 6 ? "text-red-400" : "text-gray-400")}>
                          {passwordStrength.strength}
                        </p>
                      </div>
                    )}

                    <AnimatePresence mode="popLayout">
                      {!isLogin && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="relative mt-4">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Confirm Password"
                              required={!isLogin}
                              className="w-full rounded-xl border border-gray-600 bg-gray-700/50 py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:opacity-90 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : isLogin ? "Sign In" : "Create Account"}
                    </button>
                  </form>
                </div>

                <div className="border-t border-gray-700 bg-gray-800/50 p-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setValidationError("");
                      clearError();
                    }}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

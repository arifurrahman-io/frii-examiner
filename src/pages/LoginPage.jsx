import React, { useState, useEffect } from "react";
import { FaUserTie, FaLock, FaArrowRight, FaFingerprint } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";

import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    teacherIdOrEmail: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("rememberedUser");
    if (savedUser) {
      setCredentials((prev) => ({ ...prev, teacherIdOrEmail: savedUser }));
      setRememberMe(true);
    }
  }, []);

  if (isAuthenticated) return <Navigate to="/" />;

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await login({
        username: credentials.teacherIdOrEmail,
        password: credentials.password,
      });
      if (success) {
        rememberMe
          ? localStorage.setItem("rememberedUser", credentials.teacherIdOrEmail)
          : localStorage.removeItem("rememberedUser");
        toast.success("Identity Verified");
        navigate("/");
      }
    } catch (error) {
      toast.error("Access Denied");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center text-slate-900 p-6 selection:bg-indigo-100">
      <div className="w-full max-w-[400px] space-y-8">
        {/* Minimal Header */}
        <header className="space-y-2">
          <div className="w-12 h-12 bg-slate-900 flex items-center justify-center rounded-xl mb-6">
            <FaFingerprint className="text-white text-xl" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            System Access
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Institutional Governance
          </p>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <InputField
              label="Identifier"
              type="text"
              name="teacherIdOrEmail"
              icon={FaUserTie}
              placeholder="Teacher ID or Email"
              value={credentials.teacherIdOrEmail}
              onChange={handleChange}
              required
              className="border-slate-200 focus:ring-1 focus:ring-slate-900 rounded-lg transition-all"
            />
            <InputField
              label="Security Key"
              type="password"
              name="password"
              icon={FaLock}
              placeholder="••••••••"
              value={credentials.password}
              onChange={handleChange}
              required
              className="border-slate-200 focus:ring-1 focus:ring-slate-900 rounded-lg transition-all"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="text-[13px] font-medium text-slate-500 group-hover:text-slate-900 transition-colors">
                Remember device
              </span>
            </label>
            <button
              type="button"
              className="text-[13px] font-semibold text-slate-900 hover:underline underline-offset-4"
              onClick={() =>
                toast("Contact Admin for recovery", { icon: "🛡️" })
              }
            >
              Reset Key
            </button>
          </div>

          <Button
            type="submit"
            fullWidth
            loading={loading}
            className="h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              "Verifying..."
            ) : (
              <>
                Continue <FaArrowRight className="text-[10px]" />
              </>
            )}
          </Button>
        </form>

        {/* Support Footer */}
        <footer className="pt-8 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-[0.15em]">
            Secured Terminal &copy; 2026
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;

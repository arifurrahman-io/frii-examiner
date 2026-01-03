import React, { useState, useEffect } from "react";
import {
  FaSignInAlt,
  FaUserTie,
  FaLock,
  FaShieldAlt,
  FaFingerprint,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";

// Reusable UI Components
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

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { teacherIdOrEmail, password } = credentials;

    if (!teacherIdOrEmail || !password) {
      toast.error("Credentials required for authentication.");
      setLoading(false);
      return;
    }

    try {
      const success = await login({
        username: teacherIdOrEmail,
        password,
      });

      if (success) {
        if (rememberMe) {
          localStorage.setItem("rememberedUser", teacherIdOrEmail);
        } else {
          localStorage.removeItem("rememberedUser");
        }
        toast.success("Identity Verified. Welcome.");
        navigate("/");
      }
    } catch (error) {
      toast.error("Authentication Failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(79,70,229,0.05)] border border-indigo-50 group">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex p-4 bg-indigo-50 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
              <FaShieldAlt className="text-4xl sm:text-5xl text-indigo-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight uppercase">
              Access Node
            </h2>
            <p className="text-slate-400 mt-2 text-xs sm:text-sm font-bold uppercase tracking-widest">
              Institutional Governance Matrix
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="space-y-1">
              <InputField
                label="Teacher ID / Email"
                type="text"
                name="teacherIdOrEmail"
                icon={FaUserTie}
                placeholder="Enter ID or Email"
                value={credentials.teacherIdOrEmail}
                onChange={handleChange}
                required
                className="rounded-2xl border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"
              />
            </div>

            <div className="space-y-1">
              <InputField
                label="Security Password"
                type="password"
                name="password"
                icon={FaLock}
                placeholder="••••••••"
                value={credentials.password}
                onChange={handleChange}
                required
                className="rounded-2xl border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"
              />
            </div>

            {/* Options Row */}
            <div className="flex flex-col sm:row sm:items-center justify-between gap-4 px-1">
              <label className="flex items-center cursor-pointer group w-fit">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 border-slate-300 rounded-lg focus:ring-indigo-500 cursor-pointer transition-all"
                  />
                </div>
                <span className="ml-3 text-xs sm:text-sm font-bold text-slate-500 group-hover:text-indigo-600 transition-colors uppercase tracking-tighter">
                  Save Login Data
                </span>
              </label>

              <button
                type="button"
                className="text-xs sm:text-sm font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-tighter self-end sm:self-auto"
                onClick={() =>
                  toast.loading("Connecting to Admin Uplink...", {
                    duration: 2000,
                  })
                }
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              loading={loading}
              variant="primary"
              className="mt-4 text-sm sm:text-base font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:shadow-indigo-200 active:scale-95 transition-all uppercase tracking-[0.2em]"
            >
              {!loading && <FaSignInAlt className="text-lg" />}
              {loading ? "Verifying..." : "Initialize Session"}
            </Button>
          </form>

          {/* Footer Text */}
          <div className="mt-8 sm:mt-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-px w-8 bg-slate-100"></div>
              <FaFingerprint className="text-slate-300" />
              <div className="h-px w-8 bg-slate-100"></div>
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              Contact administration for <br className="sm:hidden" /> credential
              recovery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

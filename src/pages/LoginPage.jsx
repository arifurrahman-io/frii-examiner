import React, { useState, useEffect } from "react";
import {
  FaUserTie,
  FaLock,
  FaArrowRight,
  FaRocket,
  FaGlobe,
} from "react-icons/fa";
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
        toast.success("Welcome Back");
        navigate("/");
      }
    } catch (error) {
      toast.error("Authentication Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex bg-white font-sans selection:bg-blue-100">
      {/* Left: Branding & Visuals (Hidden on Mobile) */}
      <div className="hidden lg:flex w-[45%] bg-[#0A58CA] relative flex-col justify-between p-16 overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px]" />

        {/* Cloud/Wave Mask (SVG) */}
        <div className="absolute right-0 top-0 bottom-0 w-24 overflow-hidden pointer-events-none">
          <svg
            viewBox="0 0 100 1000"
            preserveAspectRatio="none"
            className="h-full w-full fill-white"
          >
            <path d="M0,0 C40,150 100,350 100,500 C100,650 40,850 0,1000 L100,1000 L100,0 Z" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-12">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <FaRocket className="text-2xl" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              FRII Exam Manager
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-extrabold text-white leading-tight">
              Manage your <br />
              <span className="text-blue-200">Governance Matrix</span>
            </h1>
            <p className="text-blue-100 text-lg font-medium opacity-80 max-w-sm leading-relaxed">
              Experience the next-gen institutional portal designed for
              high-performance educational environments.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-blue-100/60 text-sm font-medium">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-[#0A58CA] bg-blue-300"
              />
            ))}
          </div>
          <span>Trusted by 500+ Institutions</span>
        </div>
      </div>

      {/* Right: Form Section */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-8 sm:p-20 relative">
        <div className="w-full max-w-[440px]">
          {/* Mobile Header Only */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-100">
              <FaRocket className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold text-slate-900">
              FRII Exam Manager
            </span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign In</h2>
            <p className="text-slate-500 font-medium">
              Please enter your institutional details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              {/* Identifier Field */}
              <div className="group relative">
                <InputField
                  label="Teacher ID / Email"
                  name="teacherIdOrEmail"
                  icon={FaUserTie}
                  placeholder="e.g. T-10293"
                  value={credentials.teacherIdOrEmail}
                  onChange={handleChange}
                  required
                  className="h-13 border-slate-200 bg-slate-50/30 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 rounded-xl transition-all duration-300"
                />
              </div>

              {/* Password Field with Header Action */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-end px-1 pt-4">
                  <label className="text-[13px] font-bold text-slate-700 tracking-wide">
                    Security Key
                  </label>
                  <button
                    type="button"
                    tabIndex="-1"
                    className="text-[12px] font-bold text-blue-600 hover:text-blue-700 transition-colors underline-offset-4 hover:underline"
                  >
                    Recovery?
                  </button>
                </div>
                <InputField
                  type="password"
                  name="password"
                  icon={FaLock}
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  className="h-13 border-slate-200 bg-slate-50/30 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 rounded-xl transition-all duration-300"
                />
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 cursor-pointer group select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded-lg bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all duration-200 shadow-sm" />
                  <svg
                    className="absolute top-1 left-1 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-500 group-hover:text-slate-800 transition-colors">
                  Trust this device
                </span>
              </label>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                loading={loading}
                className="group h-14 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold text-[15px] flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-slate-200 hover:shadow-blue-200 active:scale-[0.97]"
              >
                {loading ? (
                  "Securing Connection..."
                ) : (
                  <>
                    <span>Authorize Access</span>
                    <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between text-slate-400">
            <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <FaGlobe className="text-xs" /> FRII Exam Manager
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

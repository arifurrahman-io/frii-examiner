import React, { useEffect, useState } from "react";
import {
  FaArrowRight,
  FaCheckCircle,
  FaFingerprint,
  FaLock,
  FaShieldAlt,
  FaUserTie,
} from "react-icons/fa";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";

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
        if (rememberMe) {
          localStorage.setItem("rememberedUser", credentials.teacherIdOrEmail);
        } else {
          localStorage.removeItem("rememberedUser");
        }
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
    <div className="min-h-screen bg-[#f4f5f7] px-4 py-6 font-sans text-slate-900 selection:bg-emerald-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-48px)] max-w-6xl items-center gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="hidden h-full min-h-[640px] rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:flex lg:flex-col">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-700 text-white">
              <FaFingerprint className="text-xl" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-emerald-950">
                FRII
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Teacher Platform
              </p>
            </div>
          </div>

          <div className="my-auto max-w-md">
            <div className="mb-8 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              <FaShieldAlt />
              Secure institutional access
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-950">
              Manage teachers, duties, and routines from one calm workspace.
            </h1>
            <p className="mt-5 text-base font-medium leading-7 text-slate-500">
              Built for focused academic administration with clean navigation,
              reliable access control, and fast daily operations.
            </p>

            <div className="mt-10 grid gap-3">
              {[
                "Teacher routine management",
                "Campus-based responsibility control",
                "Protected reporting workflow",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <FaCheckCircle className="text-emerald-600" />
                  <span className="text-sm font-semibold text-slate-600">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <p className="text-xs font-semibold text-slate-400">
              Faizur Rahman Ideal Institute
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-[460px] rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-9 flex items-center gap-3 lg:hidden">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-700 text-white">
                <FaFingerprint className="text-lg" />
              </div>
              <div>
                <p className="text-base font-bold text-emerald-950">FRII</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Teacher Platform
                </p>
              </div>
            </div>

            <div className="mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Welcome back
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                Sign in
              </h2>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Enter your teacher ID or email to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <InputField
                  label="Teacher ID / Email"
                  name="teacherIdOrEmail"
                  icon={FaUserTie}
                  placeholder="e.g. T-10293"
                  value={credentials.teacherIdOrEmail}
                  onChange={handleChange}
                  required
                />

                <div className="space-y-1.5">
                  <div className="flex items-end justify-between px-1 pt-2">
                    <label className="text-[13px] font-bold text-slate-700">
                      Security Key
                    </label>
                    <button
                      type="button"
                      tabIndex="-1"
                      className="text-[12px] font-bold text-emerald-700 underline-offset-4 transition-colors hover:underline"
                    >
                      Recovery?
                    </button>
                  </div>
                  <InputField
                    type="password"
                    name="password"
                    icon={FaLock}
                    placeholder="Password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="group flex cursor-pointer select-none items-center gap-3">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="h-5 w-5 rounded-lg border-2 border-slate-300 bg-white shadow-sm transition-all duration-200 peer-checked:border-emerald-700 peer-checked:bg-emerald-700" />
                    <svg
                      className="pointer-events-none absolute left-1 top-1 h-3 w-3 text-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
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
                  <span className="text-sm font-semibold text-slate-500 transition-colors group-hover:text-slate-800">
                    Trust this device
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                fullWidth
                loading={loading}
                className="group h-14 rounded-xl bg-emerald-700 text-[15px] font-bold shadow-sm hover:bg-emerald-800 active:scale-[0.98]"
              >
                {loading ? (
                  "Securing Connection..."
                ) : (
                  <>
                    <span>Authorize Access</span>
                    <FaArrowRight className="text-[10px] transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-10 border-t border-slate-100 pt-6">
              <p className="text-[11px] font-semibold text-slate-400">
                FRII Teacher Management Platform
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;

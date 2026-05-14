import React, { useEffect, useState } from "react";
import {
  FaBookOpen,
  FaCalendarCheck,
  FaChartLine,
  FaClipboardCheck,
  FaFingerprint,
  FaLock,
  FaRegBookmark,
  FaShieldAlt,
  FaUserTie,
} from "react-icons/fa";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const metricCards = [
  { label: "Teacher records", value: "Live", icon: FaUserTie },
  { label: "Duty routines", value: "Synced", icon: FaCalendarCheck },
  { label: "Reports", value: "Ready", icon: FaChartLine },
];

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

  const handleChange = (event) => {
    setCredentials({ ...credentials, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const success = await login({
        username: credentials.teacherIdOrEmail.trim(),
        password: credentials.password,
      });

      if (success) {
        if (rememberMe) {
          localStorage.setItem(
            "rememberedUser",
            credentials.teacherIdOrEmail.trim()
          );
        } else {
          localStorage.removeItem("rememberedUser");
        }
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen min-h-screen px-3 py-3 text-slate-950 sm:px-4 sm:py-5">
      <div className="login-shell mx-auto grid min-h-[calc(100vh-24px-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-full max-w-[1180px] overflow-hidden rounded-lg border border-white bg-white shadow-[0_18px_50px_rgba(7,63,60,0.12)] lg:min-h-[calc(100vh-40px)] lg:grid-cols-[1.02fr_0.98fr]">
        <section className="login-visual relative hidden overflow-hidden lg:block">
          <div className="relative z-20 flex h-full flex-col justify-between p-10 text-white">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/95 text-[#0d746f] shadow-lg">
                <FaRegBookmark />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">FRII</p>
                <p className="text-sm font-medium text-white/72">
                  Teacher Management
                </p>
              </div>
            </div>

            <div className="max-w-[440px]">
              <div className="mb-5 inline-flex items-center gap-2 rounded-lg bg-white/12 px-3 py-2 text-sm font-semibold text-white">
                <FaShieldAlt />
                Secure academic workspace
              </div>
              <h1 className="text-4xl font-semibold leading-tight text-white">
                Manage teachers, routines, duties, and reports in one calm app.
              </h1>
              <p className="mt-5 text-base font-medium leading-7 text-white/76">
                Built for school administrators and incharges who need fast
                access, clear records, and reliable shift-level oversight.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {metricCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="rounded-lg border border-white/14 bg-white/10 p-4"
                  >
                    <Icon className="mb-3 text-white/86" />
                    <p className="text-sm font-semibold text-white">
                      {card.value}
                    </p>
                    <p className="mt-1 text-xs font-medium text-white/64">
                      {card.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="flex min-h-[620px] items-center justify-center px-5 py-9 sm:px-10 lg:px-14">
          <div className="w-full max-w-[430px]">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-900 text-white">
                <FaFingerprint />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-950">FRII</p>
                <p className="text-xs font-medium text-slate-500">
                  Teacher Management
                </p>
              </div>
            </div>

            <div className="mb-9">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-teal-50 text-teal-700">
                <FaClipboardCheck />
              </div>
              <h2 className="text-3xl font-semibold leading-tight text-slate-950">
                Welcome back
              </h2>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
                Sign in with your assigned teacher ID, username, or email to
                continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="teacherIdOrEmail"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Teacher ID, username, or email
                </label>
                <div className="relative">
                  <FaUserTie className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                  <input
                    id="teacherIdOrEmail"
                    name="teacherIdOrEmail"
                    type="text"
                    value={credentials.teacherIdOrEmail}
                    onChange={handleChange}
                    placeholder="admin@frii.edu"
                    autoComplete="username"
                    required
                    className="login-input h-12 w-full rounded-lg border border-slate-300 bg-white px-4 pl-11 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Password
                </label>
                <div className="relative">
                  <FaLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                    className="login-input h-12 w-full rounded-lg border border-slate-300 bg-white px-4 pl-11 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
                  />
                </div>
              </div>

              <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="login-check h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-100"
                />
                Remember this account
              </label>

              <button
                type="submit"
                disabled={loading}
                className="login-primary flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(7,63,60,0.14)] transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <FaBookOpen className="mt-0.5 flex-none text-teal-700" />
                <p className="text-sm font-medium leading-6 text-slate-600">
                  Account access is managed by the school admin. Contact your
                  administrator if your login is not active.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useEffect, useState } from "react";
import {
  FaBookOpen,
  FaFolder,
  FaGoogle,
  FaGripLines,
  FaPlay,
  FaRegBookmark,
  FaSearch,
  FaSlidersH,
  FaSyncAlt,
  FaUser,
} from "react-icons/fa";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

const mockRows = Array.from({ length: 8 }, (_, index) => index + 1);

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
    <div className="login-screen min-h-screen px-3 py-3 text-slate-950 sm:px-4 sm:py-5">
      <div className="login-shell mx-auto grid min-h-[calc(100vh-24px)] w-full max-w-[1320px] overflow-hidden rounded-lg bg-white shadow-[0_18px_50px_rgba(32,43,77,0.16)] lg:min-h-[calc(100vh-40px)] lg:grid-cols-[1.05fr_1fr]">
        <section className="login-visual relative hidden overflow-hidden lg:block">
          <div className="absolute left-9 top-8 z-20 grid h-7 w-7 place-items-center rounded-md bg-white/95 text-[#3157e8] shadow-[0_10px_24px_rgba(20,35,117,0.18)]">
            <FaRegBookmark className="text-sm" />
          </div>

          <div className="absolute left-[14%] top-[20%] z-20 max-w-[330px] text-white">
            <h1 className="text-[25px] font-normal leading-tight text-white">
              Designed for Individuals
            </h1>
            <p className="mt-4 text-sm leading-6 text-white/72">
              See the analytics and grow your data remotely, from anywhere!
            </p>
            <div className="mt-16 flex items-center gap-1.5">
              <span className="h-1.5 w-5 rounded-full bg-white/50" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/35" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/35" />
            </div>
          </div>

          <div className="login-file absolute bottom-0 left-[26%] z-30 h-[53%] w-[78%] overflow-hidden rounded-t-xl bg-white shadow-[0_22px_50px_rgba(19,39,129,0.22)]">
            <div className="absolute left-0 top-0 h-full w-[72px] bg-[#234ee6]">
              <div className="flex h-full flex-col items-center py-8 text-white">
                <FaRegBookmark className="mb-12 text-xl" />
                <div className="mb-7 grid h-12 w-12 place-items-center rounded-lg bg-white/22">
                  <FaFolder />
                </div>
                <FaPlay className="mb-7 text-sm opacity-70" />
                <FaGripLines className="mb-7 opacity-70" />
                <FaSlidersH className="opacity-70" />
                <div className="mt-auto grid h-12 w-12 place-items-center rounded-full border-4 border-white/30 bg-[#f4f2eb] text-[#23315c]">
                  <FaUser />
                </div>
              </div>
            </div>

            <div className="ml-[72px] h-full">
              <div className="flex h-[72px] items-center gap-4 border-b border-[#edf0f7] px-8">
                <FaBookOpen className="text-[#3157e8]" />
                <h2 className="text-xl font-normal text-[#1f2633]">
                  Example File
                </h2>
                <div className="ml-auto grid h-11 w-11 place-items-center rounded-full border-4 border-white bg-[#ffe8da] text-[#222] shadow-[0_8px_20px_rgba(24,32,62,0.18)]">
                  <FaUser />
                </div>
              </div>

              <div className="border-b border-[#edf0f7] px-8 py-4">
                <div className="flex items-center gap-8 text-[#566179]">
                  <FaRegBookmark />
                  <FaFolder />
                  <FaBookOpen />
                  <FaSearch />
                  <FaSyncAlt />
                  <FaSlidersH />
                </div>
              </div>

              <div className="px-8 py-4">
                <div className="mb-4 grid grid-cols-[42px_1fr_38px] items-center gap-4">
                  <button className="grid h-9 w-9 place-items-center rounded-md border border-[#e2e6ef] text-[#7a8396]">
                    x
                  </button>
                  <div className="h-7 rounded-md bg-[#eef0f4]" />
                  <div className="h-5 rounded-full bg-[#d9dde7]" />
                </div>

                <div className="grid grid-cols-[34px_1.3fr_1fr_1fr] border-t border-l border-[#edf0f7] text-xs text-[#5d6678]">
                  <div className="border-b border-r border-[#edf0f7] p-2 font-semibold">
                    #
                  </div>
                  <div className="border-b border-r border-[#edf0f7] p-2 font-semibold">
                    Tt
                  </div>
                  <div className="border-b border-r border-[#edf0f7] p-2 font-semibold">
                    AZ
                  </div>
                  <div className="border-b border-r border-[#edf0f7] p-2 font-semibold">
                    AZ
                  </div>
                  {mockRows.map((row) => (
                    <React.Fragment key={row}>
                      <div className="border-b border-r border-[#edf0f7] px-2 py-2">
                        {row}
                      </div>
                      <div className="border-b border-r border-[#edf0f7] px-3 py-2">
                        <div className="h-4 w-[72%] rounded bg-[#edf0f4]" />
                      </div>
                      <div className="border-b border-r border-[#edf0f7] px-3 py-2">
                        <div className="h-4 w-[64%] rounded bg-[#edf0f4]" />
                      </div>
                      <div className="border-b border-r border-[#edf0f7] px-3 py-2">
                        <div className="h-4 w-[82%] rounded bg-[#edf0f4]" />
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-[620px] items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-[430px]">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-[#3157e8] text-white">
                <FaRegBookmark className="text-sm" />
              </div>
              <div>
                <p className="text-base font-semibold text-[#171b26]">FRII</p>
                <p className="text-xs font-medium text-[#7a8291]">
                  Teacher Platform
                </p>
              </div>
            </div>

            <h2 className="mb-11 text-[27px] font-normal leading-none text-[#151922]">
              Login
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="teacherIdOrEmail"
                  className="mb-3 block text-sm font-medium text-[#252a36]"
                >
                  Email address
                </label>
                <input
                  id="teacherIdOrEmail"
                  name="teacherIdOrEmail"
                  type="text"
                  value={credentials.teacherIdOrEmail}
                  onChange={handleChange}
                  placeholder="name@mail.com"
                  required
                  className="login-input h-12 w-full rounded-lg border border-[#e1e5ef] bg-white px-4 text-sm text-[#1e2533] outline-none placeholder:text-[#7a8291] focus:border-[#3157e8] focus:ring-4 focus:ring-[#3157e8]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-3 block text-sm font-medium text-[#252a36]"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="**********"
                    required
                    className="login-input h-12 w-full rounded-lg border border-[#e1e5ef] bg-white px-4 pr-36 text-sm text-[#1e2533] outline-none placeholder:text-[#7a8291] focus:border-[#3157e8] focus:ring-4 focus:ring-[#3157e8]/10"
                  />
                  <button
                    type="button"
                    tabIndex="-1"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#3157e8] hover:text-[#2444c7]"
                  >
                    Reset Password
                  </button>
                </div>
              </div>

              <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-[#737b8b]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="login-check h-3.5 w-3.5 rounded border-[#cdd3df] text-[#3157e8] focus:ring-[#3157e8]/20"
                />
                Remember Password
              </label>

              <button
                type="submit"
                disabled={loading}
                className="login-primary mt-5 flex h-12 w-full items-center justify-center rounded-lg bg-[#3157e8] text-sm font-medium text-white shadow-[0_9px_20px_rgba(49,87,232,0.22)] transition hover:bg-[#2449d9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="mt-6 text-sm font-medium text-[#252a36]">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="font-medium text-[#3157e8] hover:text-[#2444c7]"
              >
                Sign up
              </button>
            </p>

            <div className="my-10 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <span className="h-px bg-[#eaedf4]" />
              <span className="text-xs text-[#9aa1af]">or</span>
              <span className="h-px bg-[#eaedf4]" />
            </div>

            <button
              type="button"
              className="login-google flex h-12 w-full items-center justify-center gap-4 rounded-lg border border-[#e3e7f0] bg-white text-sm font-medium text-[#252a36] transition hover:border-[#cbd3e2] hover:bg-[#fbfcff]"
            >
              <FaGoogle className="text-base text-[#4285f4]" />
              Authorize with Google
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;

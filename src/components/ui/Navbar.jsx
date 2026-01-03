import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUserCircle,
  FaShieldAlt,
  FaThLarge,
  FaCogs,
  FaUserTie,
  FaCalendarAlt,
  FaClipboardList,
  FaChartBar,
  FaUsersCog,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext.jsx";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // নেভিগেশন আইটেমস উইথ আইকনস
  const NavItems = [
    { name: "Dashboard", path: "/", icon: <FaThLarge /> },
    { name: "Teachers", path: "/teachers", icon: <FaUserTie /> },
    { name: "Routine", path: "/routine", icon: <FaCalendarAlt /> },
  ];

  // অ্যাডমিন এবং ইনচার্জদের জন্য ডায়নামিক রুটিন ফিল্টারিং
  if (user?.role === "admin") {
    NavItems.splice(1, 0, {
      name: "Master Setup",
      path: "/setup/branch",
      icon: <FaCogs />,
    });
    NavItems.push({
      name: "Assign Duty",
      path: "/assign",
      icon: <FaClipboardList />,
    });
    NavItems.push({
      name: "Intelligence",
      path: "/report",
      icon: <FaChartBar />,
    });
    NavItems.push({ name: "User Nodes", path: "/users", icon: <FaUsersCog /> });
  }

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate("/login");
  };

  if (!isAuthenticated) return null;

  return (
    <nav
      className={`fixed top-0 w-full z-[100] transition-all duration-500 px-4 md:px-8 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div
        className={`max-w-[1600px] mx-auto transition-all duration-500 rounded-[2rem] border border-white/40 shadow-2xl ${
          scrolled
            ? "bg-white/70 backdrop-blur-2xl py-3 px-6"
            : "bg-white/40 backdrop-blur-md py-4 px-8"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* --- LOGO SECTION --- */}
          <Link to="/" className="group flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-slate-900 p-2.5 rounded-2xl group-hover:rotate-[10deg] transition-transform duration-500">
                <FaShieldAlt className="text-white text-xl" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-slate-900 leading-none uppercase">
                Frii <span className="text-indigo-600"> Exam Manager</span>
              </span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">
                Academic Exam management
              </span>
            </div>
          </Link>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden xl:flex items-center bg-slate-900/5 p-1.5 rounded-2xl border border-slate-200/50">
            {NavItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/" && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                    isActive
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {item.icon}
                  {item.name}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* --- USER ACTIONS --- */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center gap-3 pl-4 pr-2 py-1.5 bg-white/50 border border-white rounded-2xl shadow-sm">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-900 leading-none uppercase">
                  {user?.name}
                </p>
                <p
                  className={`text-[8px] font-bold uppercase tracking-tighter mt-1 ${
                    user?.role === "admin" ? "text-rose-500" : "text-indigo-600"
                  }`}
                >
                  {user?.role} Access
                </p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                <FaUserCircle size={24} />
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="h-11 w-11 flex items-center justify-center bg-slate-900 text-white rounded-2xl hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-200 transition-all duration-300 group"
              title="Terminate Session"
            >
              <FaSignOutAlt className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <div className="flex xl:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-3 rounded-2xl transition-all duration-300 ${
                isOpen
                  ? "bg-rose-50 text-rose-600"
                  : "bg-slate-900 text-white shadow-lg shadow-slate-200"
              }`}
            >
              {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE OVERLAY MENU --- */}
      <div
        className={`xl:hidden fixed inset-x-4 top-24 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isOpen
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-10 invisible"
        }`}
      >
        <div className="bg-white/90 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.15)] border border-white p-6 space-y-2 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>

          {NavItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200"
                    : "text-slate-600 hover:bg-indigo-50"
                }`}
              >
                <span className={isActive ? "text-white" : "text-indigo-500"}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}

          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-4 px-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                <FaUserCircle size={32} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">
                  {user?.name}
                </p>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em]">
                  {user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-rose-50 text-rose-600 font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100"
            >
              <FaSignOutAlt /> Signout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

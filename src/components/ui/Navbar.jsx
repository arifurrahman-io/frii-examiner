import React, { useState, useEffect, useMemo } from "react";
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
  FaFingerprint,
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

  // --- 🛡️ ডায়নামিক নেভিগেশন ইঞ্জিন ---
  const NavItems = useMemo(() => {
    // সবার জন্য কমন আইটেম (Dashboard, Teacher, Routine)
    const items = [
      { name: "Dashboard", path: "/", icon: <FaThLarge /> },
      { name: "Teachers", path: "/teachers", icon: <FaUserTie /> },
      { name: "Routine", path: "/routine", icon: <FaCalendarAlt /> },
    ];

    /**
     * 🔐 ROLE SPECIFIC LOGIC:
     * ১. 'Infrastructure' (Master Setup) শুধুমাত্র Admin এর জন্য।
     * ২. 'Allocation' (Assign Duty) Admin এবং Incharge উভয়ের জন্য।
     */
    if (user?.role === "admin") {
      // এডমিনের জন্যInfrastructure ২য় পজিশনে ইনসার্ট করা হয়েছে
      items.splice(1, 0, {
        name: "Infrastructure",
        path: "/setup/branch",
        icon: <FaCogs />,
      });

      items.push({
        name: "Allocation",
        path: "/assign",
        icon: <FaClipboardList />,
      });

      items.push({
        name: "Audit",
        path: "/report",
        icon: <FaChartBar />,
      });

      items.push({
        name: "Governance",
        path: "/users",
        icon: <FaUsersCog />,
      });
    } else if (user?.role === "incharge") {
      // ইনচার্জের জন্য শুধুমাত্র Allocation যোগ করা হয়েছে (Infrastructure বাদ)
      items.push({
        name: "Assign Duty",
        path: "/assign",
        icon: <FaClipboardList />,
      });
    }

    return items;
  }, [user]);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate("/login");
  };

  if (!isAuthenticated) return null;

  return (
    <nav
      className={`fixed top-0 w-full z-[100] transition-all duration-500 px-4 md:px-8 ${
        scrolled ? "py-2 sm:py-3" : "py-4 sm:py-5"
      }`}
    >
      <div
        className={`max-w-[1600px] mx-auto transition-all duration-500 rounded-[1.5rem] sm:rounded-[2.5rem] border border-white/40 shadow-2xl ${
          scrolled
            ? "bg-white/80 backdrop-blur-2xl py-2 px-4 sm:py-3 sm:px-6"
            : "bg-white/40 backdrop-blur-md py-3 px-5 sm:py-4 sm:px-8"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* --- BRANDING --- */}
          <Link to="/" className="group flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-slate-900 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl group-hover:rotate-[10deg] transition-transform duration-500">
                <FaShieldAlt className="text-white text-lg sm:text-xl" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-xl font-black tracking-tighter text-slate-900 leading-none uppercase">
                Neural <span className="text-indigo-600">Matrix</span>
              </span>
              <span className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1">
                Governance System v2.5
              </span>
            </div>
          </Link>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden xl:flex items-center bg-slate-900/5 p-1 rounded-2xl border border-slate-200/50">
            {NavItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/" && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    isActive
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span className="text-xs">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* --- USER PROFILE & LOGOUT --- */}
          <div className="hidden lg:flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center gap-3 pl-4 pr-2 py-1.5 bg-white/50 border border-white rounded-2xl shadow-sm">
              <div className="text-right min-w-[80px]">
                <p className="text-[10px] font-black text-slate-900 leading-none uppercase truncate max-w-[120px]">
                  {user?.name}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <FaFingerprint
                    className={`text-[8px] ${
                      user?.role === "admin"
                        ? "text-rose-500"
                        : "text-indigo-600"
                    }`}
                  />
                  <p
                    className={`text-[8px] font-black uppercase tracking-tighter ${
                      user?.role === "admin"
                        ? "text-rose-500"
                        : "text-indigo-600"
                    }`}
                  >
                    {user?.role} NODE
                  </p>
                </div>
              </div>
              <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                <FaUserCircle size={24} />
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="h-11 w-11 flex items-center justify-center bg-slate-900 text-white rounded-2xl hover:bg-rose-600 hover:shadow-lg transition-all duration-300 group"
              title="Terminate Session"
            >
              <FaSignOutAlt className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <div className="flex xl:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-300 ${
                isOpen
                  ? "bg-rose-50 text-rose-600 shadow-inner"
                  : "bg-slate-900 text-white shadow-lg"
              }`}
            >
              {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE OVERLAY --- */}
      <div
        className={`xl:hidden fixed inset-x-4 top-[85px] sm:top-[95px] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isOpen
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-10 invisible"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-3xl rounded-[2rem] sm:rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.15)] border border-white p-4 sm:p-6 space-y-1 overflow-hidden relative">
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
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xl"
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

          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-rose-50 text-rose-600 font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100"
            >
              <FaSignOutAlt /> Terminate Session
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUserCircle,
  FaShieldAlt,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext.jsx";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  // স্ক্রল করলে নেভিগেশন বার কিছুটা স্বচ্ছ (blur) হবে
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // নেভিগেশন আইটেমস
  const NavItems = [
    { name: "Dashboard", path: "/" },
    { name: "Setup", path: "/setup/branch" },
    { name: "Teachers", path: "/teachers" },
    { name: "Routine", path: "/routine" },
    { name: "Assign Duty", path: "/assign" },
    { name: "Reports", path: "/report" },
  ];

  // অ্যাডমিন হলে "Users" অপশনটি যুক্ত হবে
  if (user?.role === "admin") {
    NavItems.push({ name: "Users", path: "/users" });
  }

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate("/login");
  };

  if (!isAuthenticated) return null;

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-lg border-b border-indigo-50 py-2"
          : "bg-white py-4 border-b border-transparent"
      }`}
    >
      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* লোগো সেকশন */}
          <div className="flex items-center">
            <Link to="/" className="group flex items-center space-x-2">
              <div className="bg-indigo-600 p-2 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                <FaShieldAlt className="text-white text-lg" />
              </div>
              <span className="text-xl font-black tracking-tighter text-gray-900 uppercase">
                Exam<span className="text-indigo-600">Manager</span>
              </span>
            </Link>

            {/* ডেস্কটপ মেনু */}
            <div className="hidden md:ml-12 md:flex items-center space-x-1">
              {NavItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/" &&
                    location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100"
                        : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ইউজার সেকশন */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-3 pr-4 border-r border-gray-200">
              <div className="text-right">
                <p className="text-xs font-black text-gray-900 leading-tight">
                  {user?.name || "User Name"}
                </p>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                  {user?.role}
                </p>
              </div>
              <FaUserCircle className="text-2xl text-gray-400" />
            </div>

            <button
              onClick={handleLogout}
              className="group flex items-center px-4 py-2 bg-gray-900 rounded-xl font-black text-white text-xs hover:bg-indigo-600 transition-all duration-300 shadow-md hover:shadow-indigo-200"
            >
              <FaSignOutAlt className="mr-2 group-hover:translate-x-1 transition-transform" />
              LOGOUT
            </button>
          </div>

          {/* মোবাইল মেনু বাটন */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* মোবাইল ড্রপডাউন মেনু */}
      <div
        className={`md:hidden absolute w-full transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-10 pointer-events-none"
        }`}
      >
        <div className="mx-4 mt-2 p-4 bg-white rounded-3xl shadow-2xl border border-gray-100 space-y-2">
          {NavItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-2xl text-base font-bold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-indigo-50"
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-gray-100">
            <div className="flex items-center px-4 mb-4">
              <div className="flex-1">
                <p className="text-sm font-black text-gray-900">{user?.name}</p>
                <p className="text-xs font-bold text-indigo-600 uppercase">
                  {user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-4 rounded-2xl bg-red-50 text-red-600 font-black hover:bg-red-100 transition-all"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

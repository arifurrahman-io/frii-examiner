import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaRegCalendarAlt,
  FaUserTie,
  FaTasks,
  FaChartBar,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext.jsx";
import toast from "react-hot-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const NavItems = [
    { name: "Dashboard", path: "/", icon: FaRegCalendarAlt },
    { name: "Setup", path: "/setup/branch", icon: FaBars },
    { name: "Teachers", path: "/teachers", icon: FaUserTie },
    { name: "Routine", path: "/routine", icon: FaRegCalendarAlt },
    { name: "Assign Duty", path: "/assign", icon: FaTasks },
    { name: "Reports", path: "/report", icon: FaChartBar },
  ];

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  // --- নেভিগেশন লিঙ্ক কম্পোনেন্ট (Active State Logic) ---
  const NavLink = ({ item, onClick }) => {
    const isActive =
      location.pathname === item.path ||
      (item.path !== "/" && location.pathname.startsWith(item.path));

    // Active style: Solid color and red bottom border
    const activeStyle = isActive
      ? "text-white font-bold bg-indigo-700/80 border-b-2 border-red-400"
      : "text-indigo-200 hover:text-white hover:bg-indigo-700/50";

    return (
      <Link
        to={item.path}
        onClick={onClick}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition duration-150 ${activeStyle}`}
      >
        <item.icon className="text-lg" />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    // ✅ Solid, full-width background
    <nav className="bg-indigo-800 shadow-xl sticky top-0 z-40">
      {/* max-w-full ensures the container expands to the full screen width */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* বাম অংশ: লোগো/ব্র্যান্ডিং ও ডেস্কটপ মেনু */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <FaRegCalendarAlt className="text-2xl text-white" />
              <span className="text-xl font-bold tracking-wider text-white">
                Exam Manager
              </span>
            </Link>

            {/* ডেস্কটপ মেনু আইটেম (কম্প্যাক্ট স্পেসিং) */}
            <div className="hidden md:ml-4 md:flex md:space-x-1">
              {NavItems.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </div>
          </div>

          {/* ডান অংশ: ইউজার অ্যাকশন (ডেস্কটপ) */}
          <div className="hidden md:flex md:items-center space-x-4">
            {/* ইউজার নেম ও রোল */}
            <div className="flex flex-col items-end leading-none">
              <span className="text-sm font-semibold text-white">
                {user?.name || "Admin"}
              </span>
              <span className="text-xs text-indigo-300">
                ({user?.role?.toUpperCase() || "ADMIN"})
              </span>
            </div>

            {/* লগআউট বাটন */}
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 bg-red-600 rounded-lg font-semibold hover:bg-red-700 transition duration-200 text-white text-sm focus:ring-2 focus:ring-red-300"
              title="Logout"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>

          {/* মোবাইল মেনু টগল বাটন */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <FaTimes className="block h-6 w-6" />
              ) : (
                <FaBars className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- মোবাইল মেনু (রেসপনসিভ) --- */}
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } md:hidden bg-indigo-900 border-t border-indigo-700 shadow-2xl`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {NavItems.map((item) => (
            <NavLink
              key={item.name}
              item={item}
              onClick={() => setIsOpen(false)}
            />
          ))}

          {/* মোবাইল লগআউট বাটন */}
          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700 transition duration-150 mt-2"
          >
            <FaSignOutAlt className="mr-2" />
            Logout ({user?.name || "Admin"})
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

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

    // Active style: Dark text, Indigo bottom border on white background
    const activeStyle = isActive
      ? "text-indigo-700 font-semibold border-b-2 border-indigo-600"
      : "text-gray-700 hover:text-indigo-700 hover:bg-gray-100"; // Light hover accent

    return (
      <Link
        to={item.path}
        onClick={onClick}
        // Minimal padding for a horizontal menu bar
        className={`flex items-center space-x-2 px-3 py-1.5 text-sm transition duration-150 ${activeStyle}`}
      >
        <item.icon className="text-lg" />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    // ✅ Updated: White background, soft shadow, sticky
    <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* বাম অংশ: লোগো/ব্র্যান্ডিং ও ডেস্কটপ মেনু */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <FaRegCalendarAlt className="text-2xl text-indigo-700" />
              <span className="text-xl font-bold tracking-wider text-gray-800">
                Exam Manager
              </span>
            </Link>

            {/* ডেস্কটপ মেনু আইটেম (Centered/Left-aligned links) */}
            <div className="hidden md:ml-10 md:flex md:space-x-6">
              {NavItems.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </div>
          </div>

          {/* ডান অংশ: ইউজার অ্যাকশন (Text Link + Primary Button) */}
          <div className="hidden md:flex md:items-center space-x-6">
            {/* User Info / Text Link Style (Matches "Log In" text link) */}
            <div className="text-sm font-medium text-indigo-600">
              <FaUserTie className="inline mr-1 text-base" />
              {user?.name || "Admin"} ({user?.role?.toUpperCase()})
            </div>

            {/* Logout Button (Matches "Get Started" primary button) */}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 text-white text-sm shadow-md"
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
              // Text and background colors reversed for light mode
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600"
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

      {/* --- মোবাইল মেনু (রেসপনসিভ - Light Mode) --- */}
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } md:hidden bg-gray-50 border-t border-gray-200 shadow-lg`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {NavItems.map((item) => (
            <NavLink
              key={item.name}
              item={item}
              onClick={() => setIsOpen(false)}
            />
          ))}

          {/* User Info on mobile */}
          <div className="text-sm font-medium text-indigo-600 px-3 py-2 border-t border-gray-200 mt-2">
            <FaUserTie className="inline mr-1 text-base" />
            {user?.name || "Admin"} ({user?.role?.toUpperCase()})
          </div>

          {/* মোবাইল লগআউট বাটন (Primary Button Style) */}
          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 mt-2"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

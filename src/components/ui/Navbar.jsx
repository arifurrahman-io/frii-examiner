import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext.jsx";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  // Navigation items simplified (icons removed)
  const NavItems = [
    { name: "Dashboard", path: "/" },
    { name: "Setup", path: "/setup/branch" },
    { name: "Teachers", path: "/teachers" },
    { name: "Routine", path: "/routine" },
    { name: "Assign Duty", path: "/assign" },
    { name: "Reports", path: "/report" },
  ];

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  // --- DESKTOP নেভিগেশন লিঙ্ক কম্পোনেন্ট (Minimal Style) ---
  const NavLink = ({ item, onClick }) => {
    const isActive =
      location.pathname === item.path ||
      (item.path !== "/" && location.pathname.startsWith(item.path));

    // Active style: Dark text, Indigo bottom border on white background
    const activeStyle = isActive
      ? "text-indigo-700 font-semibold border-b-2 border-indigo-600"
      : "text-gray-700 hover:text-indigo-700 hover:bg-gray-100";

    return (
      <Link
        to={item.path}
        onClick={onClick}
        className={`px-3 py-1.5 text-sm transition duration-150 ${activeStyle}`}
      >
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    // Adjusted max-width for a sleeker look
    <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* বাম অংশ: লোগো/ব্র্যান্ডিং ও ডেস্কটপ মেনু */}
          <div className="flex items-center">
            {/* 💡 MODERN LOGO: Text-only for elegance */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <span className="text-xl font-bold tracking-wider text-gray-800">
                EXAM MANAGER
              </span>
            </Link>

            {/* ডেস্কটপ মেনু আইটেম (Compact links) */}
            <div className="hidden md:ml-10 md:flex md:space-x-4">
              {NavItems.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </div>
          </div>

          {/* ডান অংশ: ইউজার অ্যাকশন */}
          <div className="hidden md:flex md:items-center space-x-4">
            {/* User Info: Minimalist text-only display */}
            <div className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition">
              {user?.name || "Admin"} ({user?.role?.toUpperCase()})
            </div>

            {/* Logout Button: Clean button style with subtle icon */}
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-1.5 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 text-white text-sm shadow-md"
              title="Logout"
            >
              <FaSignOutAlt className="mr-1.5 text-xs" />
              LOGOUT
            </button>
          </div>

          {/* মোবাইল মেনু টগল বাটন */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
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

      {/* --- MOBILE MENU (ELEGANT & SPACIOUS) --- */}
      <div
        // 💡 ELEGANT FIX: Use soft shadow and consistent background
        className={`${
          isOpen ? "block" : "hidden"
        } md:hidden bg-white border-t border-gray-100 shadow-md`}
      >
        <div className="px-2 pt-3 pb-4 space-y-1 sm:px-3">
          {NavItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));

            const mobileLinkStyle = isActive
              ? "bg-indigo-50 text-indigo-700 font-semibold"
              : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700";

            return (
              // 💡 Block link with increased vertical padding
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-base transition duration-150 ${mobileLinkStyle}`}
              >
                {item.name}
              </Link>
            );
          })}

          {/* User Info on mobile: Clear separator and text treatment */}
          <div className="text-base font-medium text-gray-700 px-3 py-3 border-t border-gray-200 mt-3 pt-3">
            {user?.name || "Admin"} ({user?.role?.toUpperCase()})
          </div>

          {/* Mobile Logout Button (Clean, full-width) */}
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

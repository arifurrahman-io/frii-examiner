import React from "react";
import { FaTimes } from "react-icons/fa";

/**
 * Reusable Modal Component
 * * @param {boolean} isOpen - Determines if the modal is visible
 * @param {function} onClose - Function to call when the modal is closed (e.g., clicking outside/close button)
 * @param {string} title - Title displayed at the top of the modal
 * @param {ReactNode} children - Content to display inside the modal body
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    // 🚀 FIX: Updated the backdrop class to use backdrop-blur for a blurred effect
    //        instead of a solid black overlay.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300" // FIX APPLIED HERE: bg-black/30 backdrop-blur-sm
      onClick={onClose} // ব্যাকড্রপে ক্লিক করলে বন্ধ হয়
      aria-modal="true"
      role="dialog"
    >
      {/* ২. মডাল কন্টেইনার */}
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 transition-transform duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()} // মডাল কন্টেইনারে ক্লিক করলে যেন বন্ধ না হয়
      >
        {/* ৩. মডাল হেডার */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-indigo-50 rounded-t-xl">
          <h3 className="text-xl font-bold text-indigo-700">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
            aria-label="Close modal"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* ৪. মডাল বডি (Children Content) */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

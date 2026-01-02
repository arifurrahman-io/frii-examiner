import React from "react";
import { FaTimes, FaShieldAlt } from "react-icons/fa";

const ActionModal = ({
  isOpen,
  onClose,
  title,
  subtitle = "Secure Matrix Operation",
  icon: Icon,
  children,
  maxWidth = "max-w-2xl",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* 🌫️ Backdrop Blur */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-500"
        onClick={onClose}
      ></div>

      {/* 🚀 Modal Container */}
      <div
        className={`relative w-full ${maxWidth} bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_128px_rgba(0,0,0,0.18)] border border-white overflow-hidden animate-in zoom-in-95 fade-in duration-300`}
      >
        {/* Decorative Neural Line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        {/* --- Header Section --- */}
        <div className="px-8 pt-10 pb-6 flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-indigo-400 shadow-2xl transition-transform hover:rotate-12">
              {Icon ? <Icon size={24} /> : <FaShieldAlt size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">
                {title}
              </h2>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.25em] flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-10 w-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all duration-300"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* --- Body Section (Scrollable) --- */}
        <div className="px-10 pb-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* --- Footer Signature --- */}
        <div className="px-10 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center">
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em]">
            Neural Core Authorization Active
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;

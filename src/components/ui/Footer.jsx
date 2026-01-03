import React from "react";
import { FaShieldAlt, FaCircle } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100 py-10 no-print">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* ১. ব্র্যান্ডিং এবং কপিরাইট */}
          <div className="flex items-center gap-4">
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
              <FaShieldAlt className="text-indigo-600 text-lg" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                Exam <span className="text-indigo-600"> Manager</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                &copy; {currentYear} FRII All Rights Reserved.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
              <FaCircle className="text-[6px] text-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-700 uppercase tracking-tighter">
                Developed By:{" "}
                <a href="https://www.arifurrahman.com.bd">Arifur Rahman</a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

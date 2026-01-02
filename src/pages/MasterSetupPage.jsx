import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MasterEntryForm from "../components/forms/MasterEntryForm";
import MasterList from "../components/lists/MasterList";
import {
  FaCog,
  FaLink,
  FaLayerGroup,
  FaBook,
  FaTasks,
  FaChevronLeft,
  FaShieldAlt,
  FaDatabase,
} from "react-icons/fa";
import Button from "../components/ui/Button";

const MasterSetupPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const getPageConfig = (t) => {
    switch (t) {
      case "branch":
        return {
          title: "Branch Architecture",
          subtitle: "Campus infrastructure nodes",
          icon: FaLink,
          color: "from-blue-600 to-indigo-700",
        };
      case "class":
        return {
          title: "Academic Cohorts",
          subtitle: "Define student levels",
          icon: FaLayerGroup,
          color: "from-emerald-600 to-teal-700",
        };
      case "subject":
        return {
          title: "Curriculum Matrix",
          subtitle: "Knowledge area management",
          icon: FaBook,
          color: "from-amber-500 to-orange-600",
        };
      case "responsibility":
        return {
          title: "Duty Protocols",
          subtitle: "Role definition master",
          icon: FaTasks,
          color: "from-violet-600 to-fuchsia-700",
        };
      default:
        return {
          title: "System Metadata",
          subtitle: "Core configuration",
          icon: FaCog,
          color: "from-slate-600 to-slate-800",
        };
    }
  };

  const pageConfig = getPageConfig(type);

  const handleSaveSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const validTypes = ["branch", "class", "subject", "responsibility"];

  if (!validTypes.includes(type)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="bg-white/80 backdrop-blur-xl p-12 rounded-[3rem] shadow-2xl border border-rose-100 max-w-lg text-center animate-in zoom-in-95 duration-500">
          <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6 shadow-inner">
            <FaShieldAlt size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">
            Access Restricted
          </h2>
          <Button
            onClick={() => navigate("/dashboard")}
            variant="primary"
            className="rounded-2xl px-10 py-4 shadow-xl shadow-indigo-100 uppercase tracking-widest"
          >
            Return to Base
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 mt-10 px-4 sm:px-8 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* --- HEADER --- */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div
              className={`h-16 w-16 bg-gradient-to-br ${pageConfig.color} rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200 transition-transform hover:rotate-6 duration-500`}
            >
              <pageConfig.icon size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none mb-2 uppercase">
                {pageConfig.title}
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                {pageConfig.subtitle}
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate("/dashboard")}
            variant="secondary"
            className="rounded-2xl p-4 bg-white border-slate-100 text-slate-400 hover:text-indigo-600 shadow-sm transition-all"
          >
            <FaChevronLeft className="mr-2" />{" "}
            <span className="text-[10px] font-black tracking-widest uppercase">
              Go Back
            </span>
          </Button>
        </div>

        {/* --- ONE AFTER ONE LAYOUT --- */}
        <div className="flex flex-col gap-10">
          {/* 1. ENTRY CONSOLE (Top Section) */}
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(79,70,229,0.05)] border border-white relative group overflow-hidden">
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

              <MasterEntryForm type={type} onSaveSuccess={handleSaveSuccess} />
            </div>
          </div>

          {/* 2. ARCHIVED RECORDS (Bottom Section) */}
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="bg-white p-8 md:p-12 rounded-[4rem] shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-slate-100 min-h-[400px] relative overflow-hidden">
              {/* Background Accent */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-100 to-transparent"></div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 border-b border-slate-50 pb-8">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner group-hover:scale-110 transition-transform">
                    <FaDatabase size={22} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                      Archived Records
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">
                      Active inventory synchronization
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <MasterList type={type} refreshTrigger={refreshTrigger} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-20 text-center opacity-20 group">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[1em] group-hover:tracking-[1.2em] transition-all duration-1000">
          Authorized Governance Matrix
        </p>
      </div>
    </div>
  );
};

export default MasterSetupPage;

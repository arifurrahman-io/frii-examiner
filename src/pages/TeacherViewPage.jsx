import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaUserPlus,
  FaSearch,
  FaUsers,
  FaTerminal,
  FaChevronLeft,
  FaCloudUploadAlt,
  FaShieldAlt,
} from "react-icons/fa";

// Core Components
import TeacherSearchList from "../components/lists/TeacherSearchList";
import AddTeacherForm from "../components/forms/AddTeacherForm";
import TeacherProfile from "../components/views/TeacherProfile";
import BulkUploadSection from "../components/sections/BulkUploadSection";
import Button from "../components/ui/Button";

const TeacherViewPage = () => {
  const { id } = useParams();
  const isProfileView = !!id;
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState("list"); // 'list' or 'add'
  const [refreshList, setRefreshList] = useState(0);

  useEffect(() => {
    if (!isProfileView) {
      setViewMode("list");
    }
  }, [isProfileView]);

  const handleSaveSuccess = () => {
    toast.success("Staff profile synchronized successfully.");
    setViewMode("list");
    setRefreshList((prev) => prev + 1);
  };

  // --- 🛡️ PROFILE VIEW CASE ---
  if (isProfileView) {
    return (
      <div className="animate-in fade-in duration-700">
        <TeacherProfile teacherId={id} />
      </div>
    );
  }

  // --- 🏢 LIST / ADD VIEW CASE ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 px-4 sm:px-8 relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* --- DYNAMIC HEADER --- */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200 transition-transform hover:scale-105 duration-500">
              <FaUsers size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none mb-2 uppercase">
                Faculty Matrix <span className="text-indigo-600">.</span>
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                Governance & Human Resource Index
              </p>
            </div>
          </div>

          {/* --- MODERN PILL TABS --- */}
          <div className="flex bg-white p-1.5 rounded-[1.5rem] shadow-xl shadow-indigo-100/20 border border-slate-100">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-3 px-8 py-3 rounded-xl text-xs font-black transition-all duration-500 uppercase tracking-widest ${
                viewMode === "list"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105"
                  : "text-slate-400 hover:text-indigo-500"
              }`}
            >
              <FaSearch size={14} /> Directory
            </button>
            <button
              onClick={() => setViewMode("add")}
              className={`flex items-center gap-3 px-8 py-3 rounded-xl text-xs font-black transition-all duration-500 uppercase tracking-widest ${
                viewMode === "add"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105"
                  : "text-slate-400 hover:text-indigo-500"
              }`}
            >
              <FaUserPlus size={14} /> Induction
            </button>
          </div>
        </div>

        {/* --- CONTENT ENGINE --- */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
          {viewMode === "list" ? (
            <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-4 shadow-sm border border-white transition-all hover:shadow-indigo-50">
              <TeacherSearchList key={refreshList} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column: Manual Entry (lg: 7/12) */}
              <div className="lg:col-span-7">
                <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(79,70,229,0.05)] border border-white group overflow-hidden relative transition-all hover:shadow-indigo-100">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                  <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6 relative z-10">
                    <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <FaTerminal size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                        Manual Induction
                      </h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                        Direct Record Initialization
                      </p>
                    </div>
                  </div>

                  <AddTeacherForm onSaveSuccess={handleSaveSuccess} />
                </div>
              </div>

              {/* Right Column: Bulk Engine (lg: 5/12) */}
              <div className="lg:col-span-5 flex flex-col gap-8">
                <div className="bg-slate-900 p-8 md:p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden group h-full">
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-600/10 to-transparent"></div>

                  <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner">
                        <FaCloudUploadAlt size={22} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black tracking-tighter uppercase leading-none">
                          Bulk Sync
                        </h3>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-2">
                          Matrix Aggregation
                        </p>
                      </div>
                    </div>
                    <FaShieldAlt className="text-white/5 text-5xl absolute right-0 -top-2 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                  </div>

                  <BulkUploadSection onSaveSuccess={handleSaveSuccess} />
                </div>

                {/* System Stats / Note */}
                <div className="px-10 py-6 bg-white/40 border border-slate-100 rounded-[2rem] flex items-center gap-5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                    All Faculty entries are encrypted and cross-indexed with the{" "}
                    <span className="text-indigo-600 underline">
                      Central Governance Matrix
                    </span>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding Overlay */}
      <div className="mt-20 text-center opacity-20 pointer-events-none">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[1em]">
          Faculty Management Subsystem
        </p>
      </div>
    </div>
  );
};

export default TeacherViewPage;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaUserPlus,
  FaSearch,
  FaUsers,
  FaTerminal,
  FaCloudUploadAlt,
  FaShieldAlt,
  FaLock,
} from "react-icons/fa";

// Core Components
import TeacherSearchList from "../components/lists/TeacherSearchList";
import AddTeacherForm from "../components/forms/AddTeacherForm";
import TeacherProfile from "../components/views/TeacherProfile";
import BulkUploadSection from "../components/sections/BulkUploadSection";
import { useAuth } from "../context/AuthContext";

const TeacherViewPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isProfileView = !!id;
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState("list");
  const [refreshList, setRefreshList] = useState(0);

  const isAdmin = user?.role === "admin";
  const isIncharge = user?.role === "incharge";

  // --- Success Handler ---
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 pt-10 px-4 sm:px-8 relative overflow-hidden">
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
                Teachers' List <span className="text-indigo-600">.</span>
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                {isAdmin
                  ? "Global Human Resource Index"
                  : `${user?.campus?.name || "Campus"} Teachers' Directory`}
              </p>
            </div>
          </div>

          {/* --- PILL TABS --- */}
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
              <FaUserPlus size={14} /> Add
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
            /* --- ADD MODE: ADMIN vs INCHARGE LAYOUT --- */
            <div
              className={`grid grid-cols-1 ${
                isAdmin ? "lg:grid-cols-12" : "max-w-3xl mx-auto"
              } gap-10`}
            >
              {/* 1. Manual Entry Column (Always visible, layout dynamic) */}
              <div className={isAdmin ? "lg:col-span-7" : "w-full"}>
                <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(79,70,229,0.05)] border border-white group overflow-hidden relative transition-all hover:shadow-indigo-100">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                  <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6 relative z-10">
                    <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <FaTerminal size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                        {isIncharge
                          ? "Campus Node Registration"
                          : "Global Staff Entry"}
                      </h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                        Matrix Initialization:{" "}
                        {isAdmin ? "Global Protocol" : user?.campus?.name}
                      </p>
                    </div>
                  </div>
                  <AddTeacherForm onSaveSuccess={handleSaveSuccess} />
                </div>
              </div>

              {/* --- ⚙️ MINIMAL BULK SYNC ENGINE (ADMIN ONLY) --- */}
              {isAdmin && (
                <div className="lg:col-span-5 flex flex-col gap-6 animate-in slide-in-from-right-8 duration-1000">
                  {/* Main Aggregator Card */}
                  <div className="bg-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-indigo-900/10 relative overflow-hidden group transition-all duration-500 hover:shadow-indigo-500/10">
                    {/* Subtle Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-[80px]"></div>

                    {/* Header Area */}
                    <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                          <FaCloudUploadAlt size={18} />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-blue-600 uppercase tracking-tighter leading-none">
                            Bulk Add
                          </h3>
                          <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-[0.3em] mt-1.5 opacity-80">
                            Matrix Aggregator
                          </p>
                        </div>
                      </div>

                      {/* Decorative ID Badge */}
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                        <FaShieldAlt className="text-indigo-500" size={10} />
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          Global Protocol
                        </span>
                      </div>
                    </div>

                    {/* Upload Zone Component */}
                    <div className="relative z-10">
                      <BulkUploadSection onSaveSuccess={handleSaveSuccess} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherViewPage;

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
    <div className="min-h-screen bg-[#F8FAFC] pb-10 pt-20 sm:pt-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* --- DYNAMIC HEADER --- */}
        <div className="mb-8 sm:mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl flex-shrink-0 transition-transform hover:scale-105 duration-500">
              <FaUsers className="text-xl sm:text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                Teachers' List <span className="text-indigo-600">.</span>
              </h1>
              <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.4em]">
                {isAdmin
                  ? "Global Human Resource Index"
                  : `${user?.campus?.name || "Campus"} Teachers' Directory`}
              </p>
            </div>
          </div>

          {/* --- PILL TABS --- */}
          <div className="flex bg-white p-1 sm:p-1.5 rounded-2xl sm:rounded-[1.5rem] shadow-xl shadow-indigo-100/20 border border-slate-100 self-start lg:self-auto w-full sm:w-auto">
            <button
              onClick={() => setViewMode("list")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-black transition-all duration-500 uppercase tracking-widest ${
                viewMode === "list"
                  ? "bg-indigo-600 text-white shadow-lg scale-100 sm:scale-105"
                  : "text-slate-400 hover:text-indigo-500"
              }`}
            >
              <FaSearch size={12} /> Directory
            </button>

            <button
              onClick={() => setViewMode("add")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-black transition-all duration-500 uppercase tracking-widest ${
                viewMode === "add"
                  ? "bg-indigo-600 text-white shadow-lg scale-100 sm:scale-105"
                  : "text-slate-400 hover:text-indigo-500"
              }`}
            >
              <FaUserPlus size={12} /> Add
            </button>
          </div>
        </div>

        {/* --- CONTENT ENGINE --- */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
          {viewMode === "list" ? (
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] sm:rounded-[3rem] p-3 sm:p-4 shadow-sm border border-white overflow-x-auto">
              <TeacherSearchList key={refreshList} />
            </div>
          ) : (
            /* --- ADD MODE: ADMIN vs INCHARGE LAYOUT --- */
            <div
              className={`grid grid-cols-1 ${
                isAdmin ? "lg:grid-cols-12" : "max-w-4xl mx-auto"
              } gap-6 sm:gap-10`}
            >
              {/* 1. Manual Entry Column */}
              <div className={isAdmin ? "lg:col-span-7" : "w-full"}>
                <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-white relative overflow-hidden transition-all hover:shadow-indigo-100">
                  <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-indigo-500/5 rounded-full -mr-24 -mt-24 sm:-mr-32 -mt-32 blur-3xl"></div>

                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10 border-b border-slate-50 pb-4 sm:pb-6 relative z-10">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-indigo-50 rounded-lg sm:rounded-xl flex items-center justify-center text-indigo-600">
                      <FaTerminal size={14} />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest leading-none">
                        {isIncharge
                          ? "Campus Node Registration"
                          : "Global Staff Entry"}
                      </h3>
                      <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                        Matrix Initialization:{" "}
                        {isAdmin ? "Global Protocol" : user?.campus?.name}
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <AddTeacherForm onSaveSuccess={handleSaveSuccess} />
                  </div>
                </div>
              </div>

              {/* 2. BULK SYNC ENGINE (ADMIN ONLY) */}
              {isAdmin && (
                <div className="lg:col-span-5 flex flex-col gap-6 animate-in slide-in-from-bottom-4 lg:slide-in-from-right-8 duration-1000">
                  <div className="bg-slate-200 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full -mr-24 -mt-24 blur-[60px]"></div>

                    <div className="flex items-center justify-between mb-8 sm:mb-10 border-b border-white/5 pb-4 sm:pb-6 relative z-10">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-indigo-500/10 rounded-lg sm:rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                          <FaCloudUploadAlt size={16} />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-black text-blue-600 uppercase tracking-tighter leading-none">
                            Bulk Add
                          </h3>
                          <p className="text-[8px] sm:text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1">
                            Matrix Aggregator
                          </p>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                        <FaShieldAlt className="text-indigo-500 text-[8px]" />
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          Global Protocol
                        </span>
                      </div>
                    </div>

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

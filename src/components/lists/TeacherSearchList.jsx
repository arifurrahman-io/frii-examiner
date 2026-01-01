import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FaSearch,
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaTerminal,
  FaFilter,
} from "react-icons/fa";
import TeacherCard from "../cards/TeacherCard";
import Button from "../ui/Button";
import {
  getTeachers,
  getTeacherProfile,
  getTeacherRoutines,
} from "../../api/apiService";
import useDebounce from "../../hooks/useDebounce";

const TeacherSearchList = () => {
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTeachers, setTotalTeachers] = useState(0);

  const fetchTeachers = useCallback(
    async (search = "", pageNum = 1) => {
      setLoading(true);
      try {
        const { data } = await getTeachers(search, pageNum, limit);
        const teacherList = data.teachers;

        const teachersWithFullData = await Promise.all(
          teacherList.map(async (teacher) => {
            const [profileRes, routinesRes] = await Promise.all([
              getTeacherProfile(teacher._id),
              getTeacherRoutines(teacher._id),
            ]);

            return {
              ...teacher,
              assignmentsByYear: profileRes.data.assignmentsByYear || [],
              routineSchedule: routinesRes.data || [],
            };
          })
        );

        setTeachers(teachersWithFullData);
        setTotalPages(data.totalPages);
        setTotalTeachers(data.totalTeachers);
        setPage(data.page);
      } catch (error) {
        toast.error("Protocol error: Failed to sync detailed faculty records.");
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    setPage(1);
    fetchTeachers(debouncedSearchTerm, 1);
  }, [debouncedSearchTerm, fetchTeachers]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      fetchTeachers(searchTerm, newPage);
    }
  };

  const PaginationControls = () => (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-10 p-5 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Indexed Records: {totalTeachers} | Vector: {page} / {totalPages}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1 || loading}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-50 transition-all duration-300 shadow-sm"
        >
          <FaChevronLeft size={12} />
        </button>
        <div className="flex gap-1 px-2">
          {[...Array(totalPages)].map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                page === i + 1 ? "w-6 bg-indigo-600" : "w-1.5 bg-slate-200"
              }`}
            ></div>
          ))}
        </div>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages || loading}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-50 transition-all duration-300 shadow-sm"
        >
          <FaChevronRight size={12} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* --- PREMIUM SEARCH BAR --- */}
      <div className="sticky top-24 z-30 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-[2rem] blur opacity-10 group-focus-within:opacity-25 transition duration-1000"></div>
        <div className="relative flex items-center space-x-4 p-4 bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-xl border border-white">
          <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <FaSearch size={18} />
          </div>
          <input
            type="text"
            placeholder="Search Faculty ID, Name or Intelligence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium tracking-tight"
          />
          <div className="h-8 w-[1px] bg-slate-100 hidden sm:block"></div>
          <button
            onClick={() => fetchTeachers(searchTerm, 1)}
            disabled={loading}
            className={`h-12 w-12 flex items-center justify-center rounded-2xl transition-all duration-500 ${
              loading
                ? "bg-slate-50 text-slate-300"
                : "bg-slate-900 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-100"
            }`}
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} size={14} />
          </button>
        </div>
      </div>

      {/* --- STATUS HEADER --- */}
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <FaTerminal className="text-indigo-600 text-xs" />
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
            Neural Faculty Directory
          </h3>
        </div>
        {totalTeachers > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">
              Live Sync
            </span>
          </div>
        )}
      </div>

      {/* --- TEACHER LIST ENGINE --- */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white/40 backdrop-blur-md rounded-[3rem] border border-dashed border-slate-200">
            <FaSyncAlt className="animate-spin text-6xl text-indigo-500/20 mb-6" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">
              Decrypting Faculty Matrix
            </p>
          </div>
        ) : teachers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            {teachers.map((teacher) => (
              <TeacherCard
                key={teacher._id}
                teacher={teacher}
                assignmentsByYear={teacher.assignmentsByYear}
                routineSchedule={teacher.routineSchedule}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] shadow-sm border border-slate-100 grayscale opacity-40">
            <FaUsers size={60} className="text-slate-200 mb-6" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Zero Intelligence Found
            </p>
            <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase">
              Try adjusting your neural search parameters
            </p>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      {totalTeachers > limit && <PaginationControls />}
    </div>
  );
};

export default TeacherSearchList;

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FaSearch,
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaTerminal,
} from "react-icons/fa";
import TeacherCard from "../cards/TeacherCard";
import {
  getTeachers,
  getTeacherProfile,
  getTeacherRoutines,
} from "../../api/apiService";
import { useAuth } from "../../context/AuthContext";
import useDebounce from "../../hooks/useDebounce";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const TeacherSearchList = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTeachers, setTotalTeachers] = useState(0);

  const isAdmin = user?.role === "admin";
  const inchargeCampusId = user?.campus?._id || user?.campus; // ইনচার্জের ক্যাম্পাস আইডি

  const fetchTeachers = useCallback(
    async (search = "", pageNum = 1) => {
      setLoading(true);
      try {
        // --- ইনচার্জের জন্য ক্যাম্পাস আইডি ফিল্টার সেট করা ---
        const campusIdFilter = !isAdmin ? inchargeCampusId : "";

        const { data } = await getTeachers(
          search,
          pageNum,
          limit,
          campusIdFilter
        );

        let teacherList = data.teachers || [];

        // --- ফ্রন্টএন্ড লেভেলে অতিরিক্ত সিকিউরিটি ফিল্টারিং ---
        if (!isAdmin && inchargeCampusId) {
          teacherList = teacherList.filter((t) => {
            const teacherCampusId = t.campus?._id || t.campus;
            return teacherCampusId === inchargeCampusId;
          });
        }

        // Parallel Fetch for Details
        const teachersWithFullData = await Promise.all(
          teacherList.map(async (teacher) => {
            try {
              const [profileRes, routinesRes] = await Promise.all([
                getTeacherProfile(teacher._id),
                getTeacherRoutines(teacher._id),
              ]);

              return {
                ...teacher,
                assignmentsByYear: profileRes.data.assignmentsByYear || [],
                routineSchedule: routinesRes.data || [],
              };
            } catch (err) {
              return { ...teacher, assignmentsByYear: [], routineSchedule: [] };
            }
          })
        );

        setTeachers(teachersWithFullData);
        setTotalPages(data.totalPages || 1);
        setTotalTeachers(data.totalTeachers || 0);
        setPage(data.page || 1);
      } catch (error) {
        toast.error("Failed to load teachers.");
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    },
    [limit, isAdmin, inchargeCampusId]
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
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
        <p className="text-xs font-semibold text-slate-500">
          {totalTeachers} teachers | Page {page} of {totalPages}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1 || loading}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-emerald-700 hover:text-white disabled:opacity-30 transition-colors"
        >
          <FaChevronLeft size={12} />
        </button>
        <div className="flex gap-1 px-2">
          {[...Array(Math.min(totalPages, 5))].map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                page === i + 1 ? "w-6 bg-emerald-700" : "w-1.5 bg-slate-200"
              }`}
            ></div>
          ))}
        </div>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages || loading}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-emerald-700 hover:text-white disabled:opacity-30 transition-colors"
        >
          <FaChevronRight size={12} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* --- SEARCH INTERFACE --- */}
      <div className="relative group">
        <div className="relative flex items-center space-x-4 p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="h-11 w-11 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700">
            <FaSearch size={18} />
          </div>
          <input
            type="text"
            placeholder={
              !isAdmin
                ? `Filter personnel in ${
                    user?.campus?.name || "assigned campus"
                  }...`
                : "Search teachers..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-300"
          />
          <button
            onClick={() => fetchTeachers(searchTerm, 1)}
            disabled={loading}
            className={`h-12 w-12 flex items-center justify-center rounded-2xl transition-all duration-500 ${
              loading
                ? "bg-slate-50 text-slate-300"
                : "bg-emerald-700 text-white hover:bg-emerald-800"
            }`}
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} size={14} />
          </button>
        </div>
      </div>

      {/* --- SUB-HEADER --- */}
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <FaTerminal className="text-emerald-700 text-xs" />
          <h3 className="text-xs font-semibold text-slate-500">
            {!isAdmin
              ? `${user?.campus?.name || "Campus"} Teachers' Directory`
              : "Complete teacher directory"}
          </h3>
        </div>
      </div>

      {/* --- LIST ENGINE --- */}
      <div className="space-y-6">
        {loading ? (
          <LoadingSpinner />
        ) : teachers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            {teachers.map((teacher) => (
              <TeacherCard
                key={teacher._id}
                teacher={teacher}
                assignmentsByYear={teacher.assignmentsByYear}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl shadow-sm border border-slate-200">
            <FaUsers size={48} className="text-slate-200 mb-5" />
            <p className="text-sm font-semibold text-slate-400 text-center">
              No matching teachers found <br /> in{" "}
              {user?.campus?.name || "this campus"}
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

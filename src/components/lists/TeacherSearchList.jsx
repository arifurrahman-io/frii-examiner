// src/components/lists/TeacherSearchList.jsx

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FaSearch,
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import TeacherCard from "../cards/TeacherCard";
import Button from "../ui/Button";
import {
  getTeachers,
  // 🚀 রিকুয়েস্ট অনুযায়ী বিস্তারিত ডেটার জন্য প্রয়োজনীয় API Call আমদানি করা হলো
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
  const [limit] = useState(20); // Items per page
  const [totalPages, setTotalPages] = useState(1);
  const [totalTeachers, setTotalTeachers] = useState(0);

  // --- 🚀 আপডেট: Full Data Fetch রিকুয়েস্ট অনুযায়ী পুনরায় যুক্ত করা হলো ---
  const fetchTeachers = useCallback(
    async (search = "", pageNum = 1) => {
      setLoading(true);
      try {
        // 1. Get initial paginated teacher list (basic data)
        const { data } = await getTeachers(search, pageNum, limit);
        const teacherList = data.teachers;

        // 2. ⚠️ N+2 QUERY RE-INTRODUCED: Fetching detailed data for all 20 teachers concurrently
        const teachersWithFullData = await Promise.all(
          teacherList.map(async (teacher) => {
            // Promise.all ensures both calls happen in parallel for each teacher
            const [profileRes, routinesRes] = await Promise.all([
              getTeacherProfile(teacher._id),
              getTeacherRoutines(teacher._id),
            ]);

            return {
              ...teacher,
              // 🚀 অ্যাসাইনমেন্ট হিস্টরি যুক্ত করা
              assignmentsByYear: profileRes.data.assignmentsByYear || [],
              // 🚀 রুটিন শিডিউল যুক্ত করা
              routineSchedule: routinesRes.data || [],
            };
          })
        );

        // Update states with the fully decorated teachers
        setTeachers(teachersWithFullData);
        setTotalPages(data.totalPages);
        setTotalTeachers(data.totalTeachers);
        setPage(data.page);
      } catch (error) {
        console.error("Error fetching teachers:", error);
        toast.error(
          "Failed to load detailed teacher data. Displaying basic list only."
        );
        // Fallback: Show basic list and pagination info even if detailed fetch fails
        setTeachers([]);
        setTotalPages(1);
        setTotalTeachers(0);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  // --- Fetch data on search change or page change ---
  useEffect(() => {
    setPage(1);
    fetchTeachers(debouncedSearchTerm, 1);
  }, [debouncedSearchTerm]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchTeachers(searchTerm, newPage);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Pagination Control Component
  const PaginationControls = () => (
    <div className="flex justify-between items-center mt-6 p-3 bg-white rounded-xl shadow-md border border-gray-100">
      <p className="text-sm text-gray-600">
        মোট শিক্ষক: {totalTeachers} | পৃষ্ঠা {page} এর {totalPages}
      </p>
      <div className="flex space-x-2">
        <Button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1 || loading}
          variant="secondary"
          className="p-2 text-sm"
        >
          <FaChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages || loading}
          variant="secondary"
          className="p-2 text-sm"
        >
          <FaChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-0 space-y-6">
      {/* Search Bar */}
      <div className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-md border">
        <FaSearch className="text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, phone, or ID..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="flex-1 p-1 outline-none text-lg"
        />

        <button
          onClick={() => fetchTeachers(searchTerm, 1)}
          className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition"
          title="Refresh List"
          disabled={loading}
        >
          <FaSyncAlt className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Show controls if there is more than one page */}
      {totalTeachers > limit && <PaginationControls />}

      {/* List Display */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center p-10">
            <FaSyncAlt className="animate-spin text-4xl text-indigo-500 mx-auto" />
            <p className="mt-4 text-lg text-gray-600">
              Loading {searchTerm ? "search results" : "teachers"}... (Fetching
              detailed data...)
            </p>
          </div>
        ) : teachers.length > 0 ? (
          // Teachers now contain full data again
          teachers.map((teacher) => (
            <TeacherCard
              key={teacher._id}
              teacher={teacher}
              // 🚀Fetched data passed to the card
              assignmentsByYear={teacher.assignmentsByYear}
              routineSchedule={teacher.routineSchedule}
            />
          ))
        ) : (
          <div className="text-center p-10 bg-white rounded-xl shadow-md">
            <p className="text-xl text-gray-500 italic">
              No teachers found matching your criteria.
            </p>
          </div>
        )}
      </div>

      {/* Show controls again at the bottom if applicable */}
      {totalTeachers > limit && <PaginationControls />}
    </div>
  );
};

export default TeacherSearchList;

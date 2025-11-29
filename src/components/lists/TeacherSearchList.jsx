import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import TeacherCard from "../cards/TeacherCard";
// ✅ getTeacherRoutines ইমপোর্ট করা হলো
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
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // --- শিক্ষক ডেটা আনার ফাংশন ---

  const fetchTeachers = useCallback(async (search = "") => {
    setLoading(true);
    try {
      // 1. সকল শিক্ষকের প্রাথমিক তালিকা আনা
      const { data: teacherList } = await getTeachers(search); // 2. ✅ Promise.all ব্যবহার করে প্রতিটি শিক্ষকের জন্য অ্যাসাইনমেন্ট ও রুটিন আনা

      const teachersWithFullData = await Promise.all(
        teacherList.map(async (teacher) => {
          // API Call to get profile and assignments
          const profileRes = await getTeacherProfile(teacher._id);

          // API Call to get ROUTINE data
          const { data: routines } = await getTeacherRoutines(teacher._id);

          return {
            ...teacher,
            assignmentsByYear: profileRes.data.assignmentsByYear,
            routineSchedule: routines, // ✅ রুটিন ডেটা যুক্ত করা হলো
          };
        })
      );

      setTeachers(teachersWithFullData);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to load teacher list or associated data.");
    } finally {
      setLoading(false);
    }
  }, []); // --- সার্চ বা লোডের সময় ডেটা ফেচ করা ---

  useEffect(() => {
    fetchTeachers(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchTeachers]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* সার্চ বার */}     {" "}
      <div className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-md border">
                <FaSearch className="text-gray-400" />       {" "}
        <input
          type="text"
          placeholder="Search by name, phone, or ID..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="flex-1 p-1 outline-none text-lg"
        />
               {" "}
        <button
          onClick={() => fetchTeachers(searchTerm)}
          className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition"
          title="Refresh List"
          disabled={loading}
        >
                    <FaSyncAlt className={loading ? "animate-spin" : ""} />     
           {" "}
        </button>
             {" "}
      </div>
            {/* তালিকা প্রদর্শন */}     {" "}
      <div className="space-y-4">
               {" "}
        {loading ? (
          <div className="text-center p-10">
                       {" "}
            <FaSyncAlt className="animate-spin text-4xl text-indigo-500 mx-auto" />
                       {" "}
            <p className="mt-4 text-lg text-gray-600">
                            Loading{" "}
              {searchTerm ? "search results" : "all teachers"}...            {" "}
            </p>
                     {" "}
          </div>
        ) : teachers.length > 0 ? (
          teachers.map((teacher) => (
            <TeacherCard
              key={teacher._id}
              teacher={teacher}
              assignmentsByYear={teacher.assignmentsByYear}
              routineSchedule={teacher.routineSchedule} // ✅ রুটিন শিডিউল পাস করা
            />
          ))
        ) : (
          <div className="text-center p-10 bg-white rounded-xl shadow-md">
                       {" "}
            <p className="text-xl text-gray-500 italic">
                            No teachers found matching your criteria.          
               {" "}
            </p>
                     {" "}
          </div>
        )}
             {" "}
      </div>
         {" "}
    </div>
  );
};

export default TeacherSearchList;

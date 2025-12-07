import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FaTasks,
  FaFilter,
  FaSyncAlt,
  FaChevronDown,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa"; // Added icons for flair
import AssignmentCard from "../components/cards/AssignmentCard";
import SelectDropdown from "../components/ui/SelectDropdown";
import Button from "../components/ui/Button"; // Assuming a Button component is available

import {
  getClasses,
  getSubjects,
  getResponsibilityTypes,
  getEligibleTeachers,
  getTeacherProfile,
  getTeacherRoutines,
} from "../api/apiService";

// প্রাথমিক ফিল্টার স্টেট
const initialFilters = {
  year: new Date().getFullYear(),
  responsibilityType: "",
  classId: "",
  subjectId: "",
};

const AssignDutyPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [eligibleTeachers, setEligibleTeachers] = useState([]);
  const [masterData, setMasterData] = useState({
    classes: [],
    subjects: [],
    types: [],
  });
  const [loading, setLoading] = useState(false);
  const [triggerRefresh, setTriggerRefresh] = useState(0);

  // বর্তমান বছর এবং কিছু বিগত/ভবিষ্যৎ বছর
  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { _id: currentYear + 1, name: `${currentYear + 1}` },
    { _id: currentYear, name: `${currentYear}` },
    { _id: currentYear - 1, name: `${currentYear - 1}` },
  ];

  // --- ১. মাস্টার ডেটা লোড করা ---
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [classesRes, subjectsRes, typesRes] = await Promise.all([
          getClasses(),
          getSubjects(),
          getResponsibilityTypes(),
        ]);

        setMasterData({
          classes: Array.isArray(classesRes.data) ? classesRes.data : [],
          subjects: Array.isArray(subjectsRes.data) ? subjectsRes.data : [],
          types: Array.isArray(typesRes.data) ? typesRes.data : [],
        });
      } catch (error) {
        toast.error("Failed to load setup lists.");
      }
    };
    fetchMasterData();
  }, []);

  // --- ২. যোগ্য শিক্ষক ফেচ করা (কোর ফিল্টার লজিক + রুটিন ও অ্যাসাইনমেন্ট ইতিহাস) ---
  const fetchEligibleTeachers = useCallback(async () => {
    const { year, classId, subjectId, responsibilityType } = filters;

    if (!year || !classId || !subjectId || !responsibilityType) {
      setEligibleTeachers([]);
      return;
    }

    setLoading(true);
    try {
      // 1. যোগ্য শিক্ষকদের প্রাথমিক তালিকা আনা
      const { data: eligibleList } = await getEligibleTeachers({
        year,
        classId,
        subjectId,
      });

      if (eligibleList.length === 0) {
        setEligibleTeachers([]);
        toast.info(
          "No teachers found teaching the selected Class/Subject combination."
        );
        return;
      }

      // 2. প্রতি শিক্ষকের জন্য অ্যাসাইনমেন্ট ইতিহাস ও রুটিন শিডিউল আনা
      const teachersWithFullDataPromises = eligibleList.map(async (teacher) => {
        const profileRes = await getTeacherProfile(teacher._id);
        const { data: routines } = await getTeacherRoutines(teacher._id);

        return {
          ...teacher,
          assignmentsByYear: profileRes.data.assignmentsByYear,
          routineSchedule: routines,
        };
      });

      // 3. সব Promise সম্পূর্ণ হওয়ার জন্য অপেক্ষা করা
      const finalTeachersList = await Promise.all(teachersWithFullDataPromises);

      setEligibleTeachers(finalTeachersList);
    } catch (error) {
      console.error("Error fetching eligible teachers:", error);
      toast.error("Error fetching eligible teachers or their routines.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // ফিল্টার পরিবর্তন হলে অটোমেটিক শিক্ষক তালিকা আনা
  useEffect(() => {
    fetchEligibleTeachers();
  }, [filters, fetchEligibleTeachers, triggerRefresh]);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // অ্যাসাইনমেন্ট সফল হলে তালিকা রিফ্রেশ করার জন্য
  const handleAssignSuccess = () => {
    setTriggerRefresh((prev) => prev + 1);
  };

  // নির্বাচিত দায়িত্বের অবজেক্ট তৈরি করা (সুরক্ষিত লজিক)
  const selectedType = Array.isArray(masterData.types)
    ? masterData.types.find((t) => t._id === filters.responsibilityType)
    : undefined;

  const selectedClass = Array.isArray(masterData.classes)
    ? masterData.classes.find((c) => c._id === filters.classId)
    : undefined;

  const selectedSubject = Array.isArray(masterData.subjects)
    ? masterData.subjects.find((s) => s._id === filters.subjectId)
    : undefined;

  // শিক্ষক তালিকা দেখানোর আগে সমস্ত ফিল্টার পূরণ হয়েছে কিনা তা যাচাই করা
  const allFiltersSelected =
    filters.year &&
    filters.responsibilityType &&
    filters.classId &&
    filters.subjectId;

  return (
    <div className="p-4">
      {/* 📐 MODERNIZE HEADER */}
      <h2 className="text-xl font-extrabold text-indigo-800 mb-8 flex items-center border-b-4 border-indigo-200 pb-2">
        <FaTasks className="mr-3 text-xl text-indigo-600" />
        Responsibility Assignment
      </h2>

      {/* --- ১. ফিল্টার এরিয়া --- */}
      <div className="bg-white p-6 rounded-xl mb-8 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-700 mb-6 flex items-center">
          <FaFilter className="mr-2 text-indigo-500" /> Select Assignment
          Criteria
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {" "}
          {/* Increased gap */}
          {/* Year */}
          <SelectDropdown
            label="Academic Year"
            name="year"
            value={filters.year}
            onChange={handleChange}
            options={yearOptions}
            required
          />
          {/* Responsibility Type */}
          <SelectDropdown
            label="Responsibility Type"
            name="responsibilityType"
            value={filters.responsibilityType}
            onChange={handleChange}
            options={masterData.types}
            placeholder="Select Responsibility (Required)"
            required
          />
          {/* Class */}
          <SelectDropdown
            label="Target Class"
            name="classId"
            value={filters.classId}
            onChange={handleChange}
            options={masterData.classes}
            placeholder="Select Class (Required)"
            required
          />
          {/* Subject */}
          <SelectDropdown
            label="Target Subject"
            name="subjectId"
            value={filters.subjectId}
            onChange={handleChange}
            options={masterData.subjects}
            placeholder="Select Subject (Required)"
            required
          />
        </div>
      </div>

      {/* --- ২. যোগ্য শিক্ষক তালিকা প্রদর্শন --- */}
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        {/* Conditional Header based on selection */}
        {allFiltersSelected && (
          <FaChevronDown className="mr-2 text-indigo-600 text-xl" />
        )}
        {allFiltersSelected
          ? `Eligible Teachers List (${eligibleTeachers.length})`
          : "Please select all criteria to proceed."}
      </h3>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center p-10 bg-white rounded-xl shadow-md">
            <FaSyncAlt className="animate-spin text-4xl text-indigo-500 mx-auto" />
            <p className="mt-4 text-lg text-gray-600 font-semibold">
              Searching for eligible teachers based on routine match...
            </p>
          </div>
        ) : allFiltersSelected && eligibleTeachers.length > 0 ? (
          // RENDER TEACHER CARDS
          eligibleTeachers.map((teacher) => (
            <AssignmentCard
              key={teacher._id}
              teacher={teacher}
              year={filters.year}
              assignmentsByYear={teacher.assignmentsByYear}
              responsibilityType={selectedType}
              targetClass={selectedClass}
              targetSubject={selectedSubject}
              routineSchedule={teacher.routineSchedule}
              onAssignSuccess={handleAssignSuccess}
            />
          ))
        ) : allFiltersSelected && eligibleTeachers.length === 0 ? (
          // NO TEACHERS FOUND MESSAGE
          <div className="text-center p-10 bg-white rounded-xl shadow-md border border-red-300">
            <FaExclamationCircle className="text-5xl text-red-500 mx-auto" />
            <p className="text-xl text-red-600 font-semibold mt-4">
              No Eligible Teachers Found
            </p>
            <p className="text-gray-600 mt-2">
              No teacher is currently assigned this Class/Subject combination in
              their routine for the selected year.
            </p>
          </div>
        ) : (
          // INCOMPLETE FILTERS MESSAGE
          <div className="text-center p-10 bg-white rounded-xl shadow-md border border-gray-300">
            <FaFilter className="text-5xl text-gray-500 mx-auto" />
            <p className="text-xl text-gray-600 font-semibold mt-4">
              Complete all 4 filter selections above to find eligible teachers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignDutyPage;

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FaTasks,
  FaFilter,
  FaSyncAlt,
  FaChevronDown,
  FaExclamationCircle,
  FaUserCheck,
  FaLayerGroup,
} from "react-icons/fa";
import AssignmentCard from "../components/cards/AssignmentCard";
import SelectDropdown from "../components/ui/SelectDropdown";
import Button from "../components/ui/Button";

import {
  getClasses,
  getSubjects,
  getResponsibilityTypes,
  getEligibleTeachers,
  getTeacherProfile,
  getTeacherRoutines,
} from "../api/apiService";

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

  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { _id: currentYear + 1, name: `${currentYear + 1}` },
    { _id: currentYear, name: `${currentYear}` },
    { _id: currentYear - 1, name: `${currentYear - 1}` },
  ];

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

  const fetchEligibleTeachers = useCallback(async () => {
    const { year, classId, subjectId, responsibilityType } = filters;
    if (!year || !classId || !subjectId || !responsibilityType) {
      setEligibleTeachers([]);
      return;
    }

    setLoading(true);
    try {
      const { data: eligibleList } = await getEligibleTeachers({
        year,
        classId,
        subjectId,
      });

      if (eligibleList.length === 0) {
        setEligibleTeachers([]);
        return;
      }

      const teachersWithFullDataPromises = eligibleList.map(async (teacher) => {
        const profileRes = await getTeacherProfile(teacher._id);
        const { data: routines } = await getTeacherRoutines(teacher._id);
        return {
          ...teacher,
          assignmentsByYear: profileRes.data.assignmentsByYear,
          routineSchedule: routines,
        };
      });

      const finalTeachersList = await Promise.all(teachersWithFullDataPromises);
      setEligibleTeachers(finalTeachersList);
    } catch (error) {
      toast.error("Error fetching eligible teachers.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEligibleTeachers();
  }, [filters, fetchEligibleTeachers, triggerRefresh]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleAssignSuccess = () => {
    setTriggerRefresh((prev) => prev + 1);
    toast.success("Duty assigned successfully!");
  };

  const selectedType = masterData.types.find(
    (t) => t._id === filters.responsibilityType
  );
  const selectedClass = masterData.classes.find(
    (c) => c._id === filters.classId
  );
  const selectedSubject = masterData.subjects.find(
    (s) => s._id === filters.subjectId
  );

  const allFiltersSelected =
    filters.year &&
    filters.responsibilityType &&
    filters.classId &&
    filters.subjectId;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 px-4 sm:px-8 relative overflow-hidden">
      {/* Background Subtle Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* --- HEADER --- */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
              <FaTasks size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2 uppercase">
                Duty Engine <span className="text-indigo-600">.</span>
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                Initialize Academic Responsibilities
              </p>
            </div>
          </div>

          {/* Quick Stats/Badge */}
          <div className="px-6 py-3 bg-white rounded-2xl border border-indigo-50 shadow-sm flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              System Ready
            </span>
          </div>
        </div>

        {/* --- 1. FILTER AREA (Modern Card) --- */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(79,70,229,0.05)] border border-white mb-10 group overflow-hidden relative transition-all hover:shadow-indigo-100">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110 duration-1000"></div>

          <div className="flex items-center gap-3 mb-8 relative z-10">
            <FaFilter className="text-indigo-600" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              Target Selection Matrix
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            <SelectDropdown
              label="Academic Cycle"
              name="year"
              value={filters.year}
              onChange={handleChange}
              options={yearOptions}
              required
            />
            <SelectDropdown
              label="Duty Prototype"
              name="responsibilityType"
              value={filters.responsibilityType}
              onChange={handleChange}
              options={masterData.types}
              placeholder="Assign Type..."
              required
            />
            <SelectDropdown
              label="Class Cohort"
              name="classId"
              value={filters.classId}
              onChange={handleChange}
              options={masterData.classes}
              placeholder="Select Class..."
              required
            />
            <SelectDropdown
              label="Knowledge Area"
              name="subjectId"
              value={filters.subjectId}
              onChange={handleChange}
              options={masterData.subjects}
              placeholder="Select Subject..."
              required
            />
          </div>
        </div>

        {/* --- 2. ELIGIBLE TEACHERS LIST --- */}
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-4">
            <h3
              className={`text-xl font-black transition-all duration-500 ${
                allFiltersSelected ? "text-slate-900" : "text-slate-300"
              }`}
            >
              {allFiltersSelected
                ? `Eligible Neural Candidates (${eligibleTeachers.length})`
                : "Configure Matrix Filters"}
            </h3>
            {allFiltersSelected && (
              <div className="h-1 w-12 bg-indigo-600 rounded-full"></div>
            )}
          </div>

          {allFiltersSelected && (
            <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl">
              <FaUserCheck /> Routine Verified
            </div>
          )}
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="bg-white p-20 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center">
              <FaSyncAlt className="animate-spin text-6xl text-indigo-500/20 mb-6" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.5em]">
                Synchronizing Eligible Staff
              </p>
            </div>
          ) : allFiltersSelected && eligibleTeachers.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
              {eligibleTeachers.map((teacher) => (
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
              ))}
            </div>
          ) : allFiltersSelected && eligibleTeachers.length === 0 ? (
            <div className="bg-white p-20 rounded-[3rem] shadow-sm border border-rose-100 flex flex-col items-center justify-center text-center">
              <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6 shadow-inner">
                <FaExclamationCircle size={40} />
              </div>
              <p className="text-lg font-black text-slate-800 uppercase tracking-tighter">
                Zero Candidates Found
              </p>
              <p className="text-xs font-medium text-slate-400 mt-2 max-w-sm mx-auto">
                No staff members match this routine configuration for the{" "}
                {filters.year} session. Please adjust your criteria.
              </p>
            </div>
          ) : (
            <div className="bg-white/40 border-2 border-dashed border-slate-200 p-20 rounded-[3rem] flex flex-col items-center justify-center text-center group">
              <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6 transition-all group-hover:bg-indigo-50 group-hover:text-indigo-300">
                <FaLayerGroup size={45} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">
                Awaiting Selection Matrix Completion
              </p>
              <div className="mt-6 flex gap-2">
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    filters.year ? "bg-indigo-500" : "bg-slate-200"
                  }`}
                ></div>
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    filters.responsibilityType
                      ? "bg-indigo-500"
                      : "bg-slate-200"
                  }`}
                ></div>
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    filters.classId ? "bg-indigo-500" : "bg-slate-200"
                  }`}
                ></div>
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    filters.subjectId ? "bg-indigo-500" : "bg-slate-200"
                  }`}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignDutyPage;

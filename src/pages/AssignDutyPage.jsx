import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaTasks,
  FaFilter,
  FaSyncAlt,
  FaExclamationCircle,
  FaLayerGroup,
  FaTerminal,
  FaShieldAlt,
} from "react-icons/fa";
import AssignmentCard from "../components/cards/AssignmentCard";
import SelectDropdown from "../components/ui/SelectDropdown";
import { useAuth } from "../context/AuthContext";
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initialFilters);
  const [eligibleTeachers, setEligibleTeachers] = useState([]);
  const [masterData, setMasterData] = useState({
    classes: [],
    subjects: [],
    types: [],
  });
  const [loading, setLoading] = useState(false);
  const [triggerRefresh, setTriggerRefresh] = useState(0);

  // --- 🛡️ ROLE PROTECTION (Updated for Incharge Access) ---
  useEffect(() => {
    const allowedRoles = ["admin", "incharge"];
    if (user && !allowedRoles.includes(user.role)) {
      toast.error(
        "Protocol Violation: Restricted access to Allocation Matrix."
      );
      navigate("/dashboard");
    }
  }, [user, navigate]);

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
        toast.error("Buffer Sync Failure: Master records unreachable.");
      }
    };
    fetchMasterData();
  }, []);

  // --- 🔍 DYNAMIC CLASS FILTERING FOR INCHARGE ---
  const filteredClasses = useMemo(() => {
    if (user?.role === "incharge") {
      const allowedNames = ["ONE", "TWO", "THREE"];
      return masterData.classes.filter((c) => allowedNames.includes(c.name));
    }
    return masterData.classes;
  }, [masterData.classes, user]);

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
      const finalTeachersList = await Promise.all(
        eligibleList.map(async (teacher) => {
          const [profileRes, routinesRes] = await Promise.all([
            getTeacherProfile(teacher._id),
            getTeacherRoutines(teacher._id, year),
          ]);
          return {
            ...teacher,
            assignmentsByYear: profileRes.data.assignmentsByYear || [],
            routineSchedule: routinesRes.data || [],
          };
        })
      );
      setEligibleTeachers(finalTeachersList);
    } catch (error) {
      toast.error("Matrix Calculation Error: Eligible node fetch failed.");
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

  // Basic guard
  if (!user || (user.role !== "admin" && user.role !== "incharge")) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 pt-20 sm:pt-10 px-4 sm:px-8 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="max-w-[1500px] mx-auto relative z-10">
        {/* --- HEADER --- */}
        <div className="mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="h-12 w-12 sm:h-16 sm:w-16 bg-slate-900 rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center text-indigo-400 shadow-2xl">
              <FaTasks className="text-xl sm:text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase leading-none mb-1 sm:mb-2">
                Duty Engine <span className="text-indigo-600">.</span>
              </h1>
              <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.4em] flex items-center gap-2">
                <FaTerminal className="text-indigo-500" /> SYNCING ALLOCATION
                MATRIX
              </p>
            </div>
          </div>

          <div className="self-start md:self-auto px-4 sm:px-6 py-2 sm:py-3 bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl border border-indigo-50 shadow-xl flex items-center gap-3 sm:gap-4">
            <FaShieldAlt className="text-indigo-600 text-xs sm:text-base" />
            <span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {user.role === "admin" ? "ADMIN" : "INCHARGE"} PROTOCOL ACTIVE
            </span>
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </div>

        {/* --- FILTER INTERFACE --- */}
        <div className="bg-white/90 backdrop-blur-2xl p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-white mb-8 sm:mb-12 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6 sm:mb-10">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FaFilter size={12} />
            </div>
            <h3 className="text-[10px] sm:text-sm font-black text-slate-800 uppercase tracking-widest">
              Target Selection Node
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 relative z-10">
            <SelectDropdown
              label="Academic Cycle"
              name="year"
              value={filters.year}
              onChange={handleChange}
              options={yearOptions}
              required
            />
            <SelectDropdown
              label="Protocol Type"
              name="responsibilityType"
              value={filters.responsibilityType}
              onChange={handleChange}
              options={masterData.types}
              placeholder="Assign Prototype..."
              required
            />
            <SelectDropdown
              label="Class Cohort"
              name="classId"
              value={filters.classId}
              onChange={handleChange}
              options={filteredClasses} // Updated to use filtered list
              placeholder="Select Node..."
              required
            />
            <SelectDropdown
              label="Knowledge Area"
              name="subjectId"
              value={filters.subjectId}
              onChange={handleChange}
              options={masterData.subjects}
              placeholder="Select Vector..."
              required
            />
          </div>
        </div>

        {/* --- ELIGIBLE CANDIDATES LIST --- */}
        <div className="flex flex-col sm:row sm:items-center justify-between mb-8 px-2 sm:px-6 gap-4">
          <div className="flex items-center gap-3 sm:gap-5">
            <h3
              className={`text-lg sm:text-xl font-black transition-all duration-700 ${
                allFiltersSelected ? "text-slate-900" : "text-slate-200"
              }`}
            >
              {allFiltersSelected
                ? `Verified Candidates (${eligibleTeachers.length})`
                : "Configure Filter Matrix"}
            </h3>
            {allFiltersSelected && (
              <div className="h-1 w-8 sm:w-12 bg-indigo-600 rounded-full"></div>
            )}
          </div>

          {allFiltersSelected && (
            <button
              onClick={() => setTriggerRefresh((p) => p + 1)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-[8px] sm:text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} /> Force
              Resync
            </button>
          )}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
          {loading ? (
            <div className="bg-white/40 backdrop-blur-md p-16 sm:p-32 rounded-[2rem] sm:rounded-[4rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
              <FaSyncAlt className="animate-spin text-4xl sm:text-7xl text-indigo-500/20 mb-4 sm:mb-8" />
              <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] sm:tracking-[0.5em] animate-pulse">
                Computing Matrix Eligibility
              </p>
            </div>
          ) : allFiltersSelected && eligibleTeachers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-8">
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
            <div className="bg-white p-12 sm:p-24 rounded-[2rem] sm:rounded-[4rem] shadow-sm border border-rose-100 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 sm:h-24 sm:w-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6 sm:mb-8">
                <FaExclamationCircle size={32} className="sm:text-5xl" />
              </div>
              <p className="text-base sm:text-xl font-black text-slate-800 uppercase tracking-tight">
                Zero Compatible Nodes
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-2 sm:mt-3 max-w-sm uppercase tracking-widest leading-relaxed">
                No staff member matches the selected routine vector for the
                current academic session.
              </p>
            </div>
          ) : (
            <div className="bg-white/40 border-2 border-dashed border-slate-200 p-16 sm:p-32 rounded-[2rem] sm:rounded-[4rem] flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 sm:h-28 sm:w-28 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6 sm:mb-8 transition-all">
                <FaLayerGroup size={40} className="sm:text-5xl" />
              </div>
              <p className="text-[8px] sm:text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] sm:tracking-[0.5em]">
                Input Sequence Required to Initiate Search
              </p>
              <div className="mt-6 sm:mt-8 flex gap-2 sm:gap-3">
                {[
                  filters.year,
                  filters.responsibilityType,
                  filters.classId,
                  filters.subjectId,
                ].map((f, i) => (
                  <div
                    key={i}
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${
                      f
                        ? "bg-indigo-500 w-6 sm:w-8"
                        : "bg-slate-200 w-1.5 sm:w-2"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-20 text-center opacity-10 select-none pointer-events-none hidden sm:block">
        <p className="text-[8px] sm:text-[10px] font-black text-slate-900 uppercase tracking-[1.5em]">
          Duty Allocation Matrix Subsystem
        </p>
      </div>
    </div>
  );
};

export default AssignDutyPage;

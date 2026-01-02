import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaTasks,
  FaFilter,
  FaSyncAlt,
  FaExclamationCircle,
  FaUserCheck,
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

  // --- 🛡️ ROLE PROTECTION ENGINE ---
  useEffect(() => {
    if (user && user.role !== "admin") {
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

  // Prevent flicker for unauthorized users
  if (user?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 pt-10 px-4 sm:px-8 relative overflow-hidden">
      {/* Background Cube Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="max-w-[1500px] mx-auto relative z-10">
        {/* --- HEADER --- */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-indigo-400 shadow-2xl shadow-indigo-100 transition-transform hover:scale-105 duration-500">
              <FaTasks size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none mb-2 uppercase">
                Duty Engine <span className="text-indigo-600">.</span>
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
                <FaTerminal className="text-indigo-500" /> SYNCING ALLOCATION
                MATRIX
              </p>
            </div>
          </div>

          <div className="px-6 py-3 bg-white/80 backdrop-blur-md rounded-2xl border border-indigo-50 shadow-xl shadow-indigo-100/20 flex items-center gap-4">
            <FaShieldAlt className="text-indigo-600" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              ADMIN PROTOCOL ACTIVE
            </span>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </div>

        {/* --- FILTER INTERFACE --- */}
        <div className="bg-white/90 backdrop-blur-2xl p-8 md:p-10 rounded-[3rem] shadow-[0_30px_60px_rgba(79,70,229,0.06)] border border-white mb-12 relative group overflow-hidden transition-all duration-500 hover:shadow-indigo-100">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full -mr-40 -mt-40 blur-3xl group-hover:scale-110 duration-1000"></div>

          <div className="flex items-center gap-3 mb-10">
            <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FaFilter size={14} />
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              Target Selection Node
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
              options={masterData.classes}
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
        <div className="flex items-center justify-between mb-8 px-6">
          <div className="flex items-center gap-5">
            <h3
              className={`text-xl font-black transition-all duration-700 ${
                allFiltersSelected ? "text-slate-900" : "text-slate-200"
              }`}
            >
              {allFiltersSelected
                ? `Verified Candidates (${eligibleTeachers.length})`
                : "Configure Filter Matrix"}
            </h3>
            {allFiltersSelected && (
              <div className="h-1 w-12 bg-indigo-600 rounded-full animate-in zoom-in duration-500"></div>
            )}
          </div>

          {allFiltersSelected && (
            <button
              onClick={() => setTriggerRefresh((p) => p + 1)}
              className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} /> Force
              Resync
            </button>
          )}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
          {loading ? (
            <div className="bg-white/40 backdrop-blur-md p-32 rounded-[4rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
              <FaSyncAlt className="animate-spin text-7xl text-indigo-500/20 mb-8" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">
                Computing Matrix Eligibility
              </p>
            </div>
          ) : allFiltersSelected && eligibleTeachers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
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
            <div className="bg-white p-24 rounded-[4rem] shadow-sm border border-rose-100 flex flex-col items-center justify-center text-center">
              <div className="h-24 w-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-8 shadow-inner">
                <FaExclamationCircle size={48} />
              </div>
              <p className="text-xl font-black text-slate-800 uppercase tracking-tight">
                Zero Compatible Nodes
              </p>
              <p className="text-xs font-bold text-slate-400 mt-3 max-w-sm uppercase tracking-widest leading-relaxed">
                No staff member matches the selected routine vector for the
                current academic session.
              </p>
            </div>
          ) : (
            <div className="bg-white/40 border-2 border-dashed border-slate-200 p-32 rounded-[4rem] flex flex-col items-center justify-center text-center group">
              <div className="h-28 w-28 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8 transition-all group-hover:bg-indigo-50 group-hover:text-indigo-200">
                <FaLayerGroup size={55} />
              </div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
                Input Sequence Required to Initiate Search
              </p>
              <div className="mt-8 flex gap-3">
                {[
                  filters.year,
                  filters.responsibilityType,
                  filters.classId,
                  filters.subjectId,
                ].map((f, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full transition-all duration-500 ${
                      f ? "bg-indigo-500 w-8" : "bg-slate-200"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-20 text-center opacity-10 select-none pointer-events-none">
        <p className="text-[10px] font-black text-slate-900 uppercase tracking-[1.5em]">
          Duty Allocation Matrix Subsystem
        </p>
      </div>
    </div>
  );
};

export default AssignDutyPage;

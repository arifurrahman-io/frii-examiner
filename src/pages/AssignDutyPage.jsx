import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaTasks,
  FaFilter,
  FaSyncAlt,
  FaExclamationCircle,
  FaLayerGroup,
  FaShieldAlt,
  FaCalendarAlt,
  FaBook,
  FaGraduationCap,
  FaUsers,
} from "react-icons/fa";
import AssignmentCard from "../components/cards/AssignmentCard";
import SelectDropdown from "../components/ui/SelectDropdown";
import { useAuth } from "../context/AuthContext";
import {
  getClasses,
  getSubjects,
  getResponsibilityTypes,
  getEligibleTeachers,
} from "../api/apiService";

const initialFilters = {
  year: new Date().getFullYear(),
  responsibilityType: "",
  classId: "",
  subjectId: "",
};

const StatPanel = ({ icon: Icon, label, value }) => (
  <div className="border border-slate-200 bg-white p-4">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-teal-700">
        <Icon />
      </div>
    </div>
  </div>
);

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
        "Restricted access to duty allocation."
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
      setEligibleTeachers(Array.isArray(eligibleList) ? eligibleList : []);
    } catch (error) {
      toast.error("Eligible teacher lookup failed.");
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
    <div className="min-h-screen bg-transparent px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 flex-none place-items-center rounded-lg bg-slate-900 text-white">
              <FaTasks />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Assign Duty
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Find eligible teachers and assign exam responsibilities
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600">
            <FaShieldAlt className="text-teal-700" />
            <span>
              {user.role === "admin" ? "Admin" : "Incharge"} Access
            </span>
            <span className="h-2 w-2 rounded-full bg-teal-600" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <StatPanel icon={FaCalendarAlt} label="Year" value={filters.year} />
          <StatPanel
            icon={FaTasks}
            label="Duty type"
            value={selectedType?.name || "-"}
          />
          <StatPanel
            icon={FaGraduationCap}
            label="Class"
            value={selectedClass?.name || "-"}
          />
          <StatPanel
            icon={FaUsers}
            label="Eligible"
            value={allFiltersSelected ? eligibleTeachers.length : "-"}
          />
        </div>

        <section className="border border-slate-200 bg-white p-5">
          <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-teal-700">
                <FaFilter />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Assignment Filters
                </h2>
                <p className="text-sm text-slate-500">
                  Select all filters to load eligible teachers
                </p>
              </div>
            </div>

            {allFiltersSelected && (
              <button
                onClick={() => setTriggerRefresh((prev) => prev + 1)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <FaSyncAlt className={loading ? "animate-spin" : ""} size={12} />
                Refresh
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SelectDropdown
              label="Academic Year"
              name="year"
              value={filters.year}
              onChange={handleChange}
              options={yearOptions}
              required
            />
            <SelectDropdown
              label="Duty Type"
              name="responsibilityType"
              value={filters.responsibilityType}
              onChange={handleChange}
              options={masterData.types}
              placeholder="Select duty type"
              required
            />
            <SelectDropdown
              label="Class"
              name="classId"
              value={filters.classId}
              onChange={handleChange}
              options={filteredClasses}
              placeholder="Select class"
              required
            />
            <SelectDropdown
              label="Subject"
              name="subjectId"
              value={filters.subjectId}
              onChange={handleChange}
              options={masterData.subjects}
              placeholder="Select subject"
              required
            />
          </div>
        </section>

        <section className="border border-slate-200 bg-white">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {allFiltersSelected
                  ? "Eligible Teachers"
                  : "Candidate Search"}
              </h2>
              <p className="text-sm text-slate-500">
                {allFiltersSelected
                  ? `${eligibleTeachers.length} teachers match the selected routine`
                  : "Choose year, duty type, class, and subject to begin"}
              </p>
            </div>
            {selectedSubject && (
              <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
                <FaBook className="text-teal-700" />
                {selectedSubject.name}
              </div>
            )}
          </div>

          <div className="p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 bg-slate-50 p-16 text-center">
              <FaSyncAlt className="mb-5 animate-spin text-4xl text-teal-700/40" />
              <p className="text-sm font-semibold text-slate-500">
                Finding eligible teachers
              </p>
            </div>
          ) : allFiltersSelected && eligibleTeachers.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
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
            <div className="flex flex-col items-center justify-center border border-rose-100 bg-rose-50 p-16 text-center">
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-lg bg-white text-rose-500">
                <FaExclamationCircle size={28} />
              </div>
              <p className="text-lg font-bold text-slate-900">
                No eligible teachers
              </p>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                No staff member matches the selected routine vector for the
                current academic session.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 bg-slate-50 p-16 text-center">
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-lg bg-white text-slate-300">
                <FaLayerGroup size={28} />
              </div>
              <p className="text-sm font-semibold text-slate-500">
                Select filters to load eligible teachers
              </p>
              <div className="mt-5 flex gap-2">
                {[
                  filters.year,
                  filters.responsibilityType,
                  filters.classId,
                  filters.subjectId,
                ].map((f, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      f ? "w-8 bg-teal-700" : "w-2 bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AssignDutyPage;

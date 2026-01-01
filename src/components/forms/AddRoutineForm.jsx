import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FaCalendarAlt,
  FaSave,
  FaSearch,
  FaSyncAlt,
  FaTerminal,
  FaInfoCircle,
} from "react-icons/fa";
import SelectDropdown from "../ui/SelectDropdown";
import {
  addRoutine,
  updateRoutine,
  getTeachers,
  getClasses,
  getSubjects,
} from "../../api/apiService";
import useDebounce from "../../hooks/useDebounce";

const getInitialState = (initialData, defaultTeacherId) => ({
  _id: initialData?._id || "",
  teacher:
    initialData?.teacher || initialData?.teacherId || defaultTeacherId || "",
  year: initialData?.year || new Date().getFullYear(),
  className: initialData?.classNameId || "",
  subject: initialData?.subjectId || "",
});

const AddRoutineForm = ({ onSaveSuccess, initialData, defaultTeacherId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [formData, setFormData] = useState(
    getInitialState(initialData, defaultTeacherId)
  );
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setFormData(getInitialState(initialData, defaultTeacherId));
  }, [initialData, defaultTeacherId]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [teachersRes, classesRes, subjectsRes] = await Promise.all([
          getTeachers(debouncedSearchTerm, 1, 999),
          getClasses(),
          getSubjects(),
        ]);
        const teacherList = teachersRes.data.teachers || [];
        const formattedTeachers = teacherList.map((t) => ({
          ...t,
          name: `${t.name} | ${t.campus?.name || "N/A"}`,
        }));
        setTeachers(formattedTeachers);
        setClasses(classesRes.data);
        setSubjects(subjectsRes.data);
      } catch (error) {
        toast.error("Failed to load configuration buffers.");
      }
    };
    fetchMasterData();
  }, [debouncedSearchTerm]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const requiredFields = ["teacher", "year", "className", "subject"];
    if (requiredFields.some((field) => !formData[field])) {
      toast.error("Complete all neural parameters before saving.");
      setLoading(false);
      return;
    }

    const isUpdating = !!formData._id;
    const action = isUpdating
      ? updateRoutine(formData._id, formData)
      : addRoutine(formData);

    try {
      await action;
      toast.success(isUpdating ? "Protocol updated." : "Record indexed.");
      if (onSaveSuccess) onSaveSuccess();
      if (!isUpdating) setFormData(getInitialState(null, defaultTeacherId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-1 shadow-sm border border-slate-100 group transition-all duration-500 hover:shadow-indigo-100/50">
      <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 rotate-3 transition-transform group-hover:rotate-0">
              <FaCalendarAlt size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
                {initialData ? "Modify Protocol" : "Initialize Routine"}
              </h2>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                <FaTerminal className="text-indigo-500" /> Command Console
              </p>
            </div>
          </div>
        </div>

        {/* --- ROW 1: YEAR & SEARCH --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-4">
            <SelectDropdown
              label="Academic Cycle"
              name="year"
              value={formData.year}
              onChange={handleChange}
              options={[
                { _id: currentYear + 1, name: `${currentYear + 1}` },
                { _id: currentYear, name: `${currentYear}` },
                { _id: currentYear - 1, name: `${currentYear - 1}` },
              ]}
              disabled={!!initialData}
              required
            />
          </div>
          <div className="md:col-span-8">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
              Staff Search Filter
            </label>
            <div className="relative group/search">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/search:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Query Name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all font-bold text-sm outline-none shadow-inner"
              />
              <FaSyncAlt
                className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-200 ${
                  loading ? "animate-spin text-indigo-400" : ""
                }`}
              />
            </div>
          </div>
        </div>

        {/* --- ROW 2: TEACHER SELECT --- */}
        <div className="relative">
          <SelectDropdown
            label="Staff Identification"
            name="teacher"
            value={formData.teacher}
            onChange={handleChange}
            options={teachers}
            placeholder={
              debouncedSearchTerm
                ? `Matching "${debouncedSearchTerm}"...`
                : "Select Identified Personnel"
            }
            disabled={!!initialData || !!defaultTeacherId}
            required
          />
        </div>

        {/* --- ROW 3: CLASS & SUBJECT --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectDropdown
            label="Class Cohort"
            name="className"
            value={formData.className}
            onChange={handleChange}
            options={classes}
            placeholder="Select Level"
            required
          />
          <SelectDropdown
            label="Knowledge Area"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            options={subjects}
            placeholder="Select Domain"
            required
          />
        </div>

        {/* --- ACTION AREA --- */}
        <div className="pt-4 flex flex-col md:flex-row items-center gap-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-2/3 py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:shadow-indigo-200 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <FaSyncAlt className="animate-spin" />
            ) : (
              <>
                <FaSave className="text-xs" />{" "}
                {initialData ? "Update Registry" : "Index Routine"}
              </>
            )}
          </button>

          <div className="flex items-center gap-3 text-slate-400">
            <FaInfoCircle size={14} />
            <p className="text-[9px] font-bold uppercase tracking-widest leading-tight">
              Changes are cross-indexed <br /> with central matrix.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddRoutineForm;

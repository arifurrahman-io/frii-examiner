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
import { useAuth } from "../../context/AuthContext"; // Auth Context যোগ করা হয়েছে

const getInitialState = (initialData, defaultTeacherId) => ({
  _id: initialData?._id || "",
  teacher:
    initialData?.teacher || initialData?.teacherId || defaultTeacherId || "",
  year: initialData?.year || new Date().getFullYear(),
  className: initialData?.classNameId || "",
  subject: initialData?.subjectId || "",
});

const AddRoutineForm = ({ onSaveSuccess, initialData, defaultTeacherId }) => {
  const { user } = useAuth(); // ইউজারের রোল এবং ক্যাম্পাস ডাটা নেওয়া হচ্ছে
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
        // ইনচার্জ হলে শুধু তাঁর ক্যাম্পাসের শিক্ষকদের কুয়েরি করা হবে
        const effectiveSearch =
          user?.role === "incharge"
            ? `${debouncedSearchTerm} ${user.campus?.name || ""}`.trim()
            : debouncedSearchTerm;

        const [teachersRes, classesRes, subjectsRes] = await Promise.all([
          getTeachers(effectiveSearch, 1, 999),
          getClasses(),
          getSubjects(),
        ]);

        let teacherList = teachersRes.data.teachers || [];

        // ফ্রন্টএন্ডে অতিরিক্ত সিকিউরিটি ফিল্টারিং (ইনচার্জের জন্য)
        if (user?.role === "incharge" && user.campus) {
          teacherList = teacherList.filter(
            (t) =>
              t.campus?._id === user.campus._id || t.campus === user.campus._id
          );
        }

        const formattedTeachers = teacherList.map((t) => ({
          ...t,
          name: `${t.name} | ${t.campus?.name || "N/A"}`,
        }));

        setTeachers(formattedTeachers);
        setClasses(classesRes.data);
        setSubjects(subjectsRes.data);
      } catch (error) {
        toast.error("Failed to load routine options.");
      }
    };
    fetchMasterData();
  }, [debouncedSearchTerm, user]); // user অবজেক্ট পরিবর্তন হলে ডেটা রি-ফেচ হবে

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const requiredFields = ["teacher", "year", "className", "subject"];
    if (requiredFields.some((field) => !formData[field])) {
      toast.error("Complete all required fields before saving.");
      setLoading(false);
      return;
    }

    const isUpdating = !!formData._id;
    const action = isUpdating
      ? updateRoutine(formData._id, formData)
      : addRoutine(formData);

    try {
      await action;
      toast.success(isUpdating ? "Routine updated." : "Routine added.");
      if (onSaveSuccess) onSaveSuccess();
      if (!isUpdating) setFormData(getInitialState(null, defaultTeacherId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-1 shadow-sm border border-slate-200 group transition-all duration-200 hover:shadow-md">
      <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-700 rounded-xl flex items-center justify-center text-white">
              <FaCalendarAlt size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                {initialData ? "Update routine" : "Add routine"}
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-2 flex items-center gap-2">
                <FaTerminal className="text-emerald-700" />{" "}
                {user?.role === "incharge"
                  ? user.campus?.name
                  : "All campuses"}
              </p>
            </div>
          </div>
        </div>

        {/* --- ROW 1: YEAR & SEARCH --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-4">
            <SelectDropdown
              label="Academic Year"
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
            <label className="text-xs font-semibold text-slate-500 mb-2 block ml-1">
              Teacher search
            </label>
            <div className="relative group/search">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/search:text-emerald-700 transition-colors" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 transition-all font-semibold text-sm outline-none"
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
            label="Teacher's Identification"
            name="teacher"
            value={formData.teacher}
            onChange={handleChange}
            options={teachers}
            placeholder={
              debouncedSearchTerm
                ? `Matching "${debouncedSearchTerm}"...`
                : "Select Teacher"
            }
            disabled={!!initialData || !!defaultTeacherId}
            required
          />
        </div>

        {/* --- ROW 3: CLASS & SUBJECT --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectDropdown
            label="Class"
            name="className"
            value={formData.className}
            onChange={handleChange}
            options={classes}
            placeholder="Select Class"
            required
          />
          <SelectDropdown
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            options={subjects}
            placeholder="Select Subject"
            required
          />
        </div>

        {/* --- ACTION AREA --- */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <FaSyncAlt className="animate-spin" />
            ) : (
              <>
                <FaSave className="text-xs" />{" "}
                {initialData ? "Update routine" : "Add routine"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRoutineForm;

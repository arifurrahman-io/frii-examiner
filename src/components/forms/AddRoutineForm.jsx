import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaSave, FaSearch, FaSyncAlt } from "react-icons/fa";
import SelectDropdown from "../ui/SelectDropdown";
import {
  addRoutine,
  updateRoutine,
  getTeachers,
  getClasses,
  getSubjects,
} from "../../api/apiService";
import useDebounce from "../../hooks/useDebounce";
import { useAuth } from "../../context/AuthContext";

const getInitialState = (initialData, defaultTeacherId) => ({
  _id: initialData?._id || "",
  teacher:
    initialData?.teacher || initialData?.teacherId || defaultTeacherId || "",
  year: initialData?.year || new Date().getFullYear(),
  className: initialData?.classNameId || "",
  subject: initialData?.subjectId || "",
});

const AddRoutineForm = ({ onSaveSuccess, initialData, defaultTeacherId }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [formData, setFormData] = useState(
    getInitialState(initialData, defaultTeacherId)
  );
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setFormData(getInitialState(initialData, defaultTeacherId));
  }, [initialData, defaultTeacherId]);

  useEffect(() => {
    const fetchClassSubjectOptions = async () => {
      try {
        const [classesRes, subjectsRes] = await Promise.all([
          getClasses(),
          getSubjects(),
        ]);
        setClasses(classesRes.data || []);
        setSubjects(subjectsRes.data || []);
      } catch (error) {
        toast.error("Failed to load class and subject options.");
      }
    };

    fetchClassSubjectOptions();
  }, []);

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoadingTeachers(true);
      try {
        const effectiveSearch =
          user?.role === "incharge"
            ? `${debouncedSearchTerm} ${user.campus?.name || ""}`.trim()
            : debouncedSearchTerm;

        const teachersRes = await getTeachers(effectiveSearch, 1, 999);
        let teacherList = teachersRes.data.teachers || [];

        if (user?.role === "incharge" && user.campus) {
          teacherList = teacherList.filter(
            (teacher) =>
              teacher.campus?._id === user.campus._id ||
              teacher.campus === user.campus._id
          );
        }

        setTeachers(
          teacherList.map((teacher) => ({
            ...teacher,
            name: `${teacher.name} | ${teacher.teacherId} | ${
              teacher.campus?.name || "N/A"
            }`,
          }))
        );
      } catch (error) {
        toast.error("Failed to load teachers.");
      } finally {
        setLoadingTeachers(false);
      }
    };

    fetchTeachers();
  }, [debouncedSearchTerm, user]);

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const requiredFields = ["teacher", "year", "className", "subject"];
    if (requiredFields.some((field) => !formData[field])) {
      toast.error("Complete all required fields before saving.");
      return;
    }

    setLoading(true);
    const isUpdating = !!formData._id;
    try {
      if (isUpdating) {
        await updateRoutine(formData._id, formData);
      } else {
        await addRoutine(formData);
      }
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-slate-700">
            Teacher Search
          </span>
          <div className="relative">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or ID"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            />
            <FaSyncAlt
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-300 ${
                loadingTeachers ? "animate-spin text-teal-700" : ""
              }`}
            />
          </div>
        </label>
      </div>

      <SelectDropdown
        label="Teacher"
        name="teacher"
        value={formData.teacher}
        onChange={handleChange}
        options={teachers}
        placeholder={
          debouncedSearchTerm
            ? `Matching "${debouncedSearchTerm}"`
            : "Select Teacher"
        }
        disabled={!!initialData || !!defaultTeacherId}
        required
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60 sm:w-auto"
      >
        {loading ? <FaSyncAlt className="animate-spin" /> : <FaSave />}
        {initialData ? "Update Routine" : "Add Routine"}
      </button>
    </form>
  );
};

export default AddRoutineForm;

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaCalendarAlt, FaSave, FaSearch, FaSyncAlt } from "react-icons/fa";
// Reusable UI Components
import SelectDropdown from "../ui/SelectDropdown";

import {
  addRoutine,
  updateRoutine,
  getTeachers,
  getClasses,
  getSubjects,
} from "../../api/apiService";

// 🚀 NEW: Import useDebounce (Path relative to src/components/forms)
import useDebounce from "../../hooks/useDebounce";

const getInitialState = (initialData, defaultTeacherId) => ({
  _id: initialData?._id || "",
  teacher:
    initialData?.teacher || initialData?.teacherId || defaultTeacherId || "",
  year: initialData?.year || new Date().getFullYear(),
  className: initialData?.classNameId || "",
  subject: initialData?.subjectId || "",
});

// 🚀 UPDATED: Removed searchTerm prop as logic is now local
const AddRoutineForm = ({ onSaveSuccess, initialData, defaultTeacherId }) => {
  // 🚀 NEW: Local search state and debounce logic
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

  // CRITICAL FIX: Reset or initialize form state when initialData or defaultTeacherId changes
  useEffect(() => {
    setFormData(getInitialState(initialData, defaultTeacherId));
  }, [initialData, defaultTeacherId]);

  // Load master data (Teacher, Class, Subject)
  // 🚀 UPDATED: useEffect now listens to local debouncedSearchTerm
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        // 🚀 FIX: Use debouncedSearchTerm for filtering teachers
        const [teachersRes, classesRes, subjectsRes] = await Promise.all([
          getTeachers(debouncedSearchTerm),
          getClasses(),
          getSubjects(),
        ]);

        // Teacher data formatting for dropdown: ensuring it has _id, name, and teacherId
        const formattedTeachers = teachersRes.data.map((t) => ({
          ...t,
          name: `${t.name} (${t.teacherId})`,
        }));

        setTeachers(formattedTeachers);
        setClasses(classesRes.data);
        setSubjects(subjectsRes.data);
      } catch (error) {
        toast.error(
          "Failed to load necessary lists (Teachers/Classes/Subjects)."
        );
      }
    };
    // Run fetch on mount and whenever debouncedSearchTerm changes
    fetchMasterData();
  }, [debouncedSearchTerm]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const requiredFields = ["teacher", "year", "className", "subject"];
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(
          `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`
        );
        setLoading(false);
        return;
      }
    }

    // Payload for API
    const payload = {
      teacher: formData.teacher,
      year: formData.year,
      className: formData.className,
      subject: formData.subject,
    };

    // Determine if we are adding (POST) or updating (PUT)
    const isUpdating = !!formData._id;
    const action = isUpdating
      ? updateRoutine(formData._id, payload)
      : addRoutine(payload);
    const successMessage = isUpdating
      ? "Routine entry updated successfully!"
      : "Routine entry added successfully!";

    try {
      await action; // Execute the selected action

      toast.success(successMessage);

      // Successful save actions
      if (onSaveSuccess) {
        onSaveSuccess();
      }

      // Reset form if adding a new entry
      if (!isUpdating) {
        // Only reset fields that aren't pre-populated by defaultTeacherId
        setFormData(getInitialState(null, defaultTeacherId));
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        `An unknown error occurred while ${
          isUpdating ? "updating" : "adding"
        } the routine.`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Determine button text and title
  const formTitle = initialData
    ? "Edit Routine Entry"
    : "Set Academic Routine (Manual Entry)";
  const buttonText = initialData ? "SAVE CHANGES" : "SAVE ROUTINE";

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl border border-gray-200">
      <h2 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center border-b border-indigo-50 pb-3">
        <FaCalendarAlt className="mr-3 text-3xl text-indigo-600" />
        {formTitle}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Year Selector */}
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
          required
          // Disable year selector during edit to prevent moving the assignment to the wrong year
          disabled={!!initialData}
        />

        {/* 🚀 NEW: Stylized Search Bar UI injected inside the form */}
        <div className="space-y-1">
          <label
            htmlFor="teacher-search"
            className="block text-sm font-medium text-gray-700"
          >
            Search Teacher
          </label>
          <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-300 flex items-center">
            <FaSearch className="text-indigo-500 mr-3 text-lg" />
            <div className="h-6 w-px bg-gray-300 mr-3" aria-hidden="true" />
            <input
              type="text"
              id="teacher-search"
              placeholder="Search Teacher by Name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 text-base outline-none border-none p-0 focus:ring-0"
            />
            <FaSyncAlt className="text-gray-400 ml-3 text-lg cursor-pointer" />
          </div>
        </div>

        {/* Select Teacher (The dropdown displays the filtered results) */}
        <SelectDropdown
          label="Select Teacher (Filtered List)"
          name="teacher"
          value={formData.teacher}
          onChange={handleChange}
          options={teachers}
          placeholder={
            debouncedSearchTerm
              ? `Searching for "${debouncedSearchTerm}"...`
              : "Choose Teacher (Name & ID)"
          }
          required
          // Disable teacher selector during edit OR when defaultTeacherId is provided
          disabled={!!initialData || !!defaultTeacherId}
        />

        {/* Select Class */}
        <SelectDropdown
          label="Select Class"
          name="className"
          value={formData.className}
          onChange={handleChange}
          options={classes}
          placeholder="Choose a Class"
          required
        />

        {/* Select Subject */}
        <SelectDropdown
          label="Select Subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          options={subjects}
          placeholder="Choose a Subject"
          required
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 flex items-center justify-center disabled:opacity-50 focus:ring-4 focus:ring-indigo-300 focus:outline-none"
          disabled={loading}
        >
          {loading ? (
            "Saving Routine..."
          ) : (
            <>
              <FaSave className="mr-2" />
              {buttonText}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddRoutineForm;

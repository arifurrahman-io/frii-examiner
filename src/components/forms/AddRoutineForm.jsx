import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaCalendarAlt, FaSave } from "react-icons/fa";
// Reusable UI Components
import SelectDropdown from "../ui/SelectDropdown";

import {
  addRoutine,
  updateRoutine,
  getTeachers,
  getClasses,
  getSubjects,
} from "../../api/apiService";

const getInitialState = (initialData) => ({
  _id: initialData?._id || "",
  // Teacher is the MongoDB ObjectId, passed from the teacher profile view
  teacher: initialData?.teacher || initialData?.teacherId || "",
  year: initialData?.year || new Date().getFullYear(),
  // For editing, these fields come as IDs, correctly mapped from the Routine model's subdocument.
  className: initialData?.classNameId || "",
  subject: initialData?.subjectId || "",
});

const AddRoutineForm = ({ onSaveSuccess, initialData }) => {
  const [formData, setFormData] = useState(getInitialState(initialData));
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const currentYear = new Date().getFullYear();

  // CRITICAL FIX: Reset or initialize form state when initialData changes (for modal reuse/editing)
  useEffect(() => {
    setFormData(getInitialState(initialData));
  }, [initialData]);

  // Load master data (Teacher, Class, Subject)
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [teachersRes, classesRes, subjectsRes] = await Promise.all([
          getTeachers(),
          getClasses(),
          getSubjects(),
        ]);

        // Teacher data formatting for dropdown: ensuring it has _id, name, and teacherId
        const formattedTeachers = teachersRes.data.map((t) => ({
          ...t,
          name: `${t.name} (${t.teacherId})`, // Dropdown এ নাম ও আইডি একসাথে দেখানো
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
    fetchMasterData();
  }, []);

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
        setFormData(getInitialState(null));
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
    // ❌ REMOVED: shadow-2xl. Use clean border for flat design.
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl border border-gray-300">
      {/* 🚀 MODERNIZE: Consistent header styling */}
      <h2 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center border-b-2 border-indigo-100 pb-3">
        <FaCalendarAlt className="mr-3 text-3xl text-indigo-600" />
        {formTitle}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Year Selector (Standard select for simplicity as it's static) */}
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

        {/* Select Teacher (Using SelectDropdown) */}
        <SelectDropdown
          label="Select Teacher"
          name="teacher"
          value={formData.teacher}
          onChange={handleChange}
          options={teachers}
          placeholder="Choose Teacher (Name & ID)"
          required
          // Disable teacher selector during edit
          disabled={!!initialData}
        />

        {/* Select Class (Using SelectDropdown) */}
        <SelectDropdown
          label="Select Class"
          name="className"
          value={formData.className}
          onChange={handleChange}
          options={classes}
          placeholder="Choose a Class"
          required
        />

        {/* Select Subject (Using SelectDropdown) */}
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
          className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 flex items-center justify-center disabled:opacity-50"
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

      {/* ❌ REMOVED: Redundant Bulk Upload Section */}
    </div>
  );
};

export default AddRoutineForm;

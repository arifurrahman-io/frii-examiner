import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FaUserEdit,
  FaSyncAlt,
  FaUser,
  FaBuilding,
  FaPhone,
  FaIdCard,
  FaSave,
} from "react-icons/fa";

// Reusable UI Components
import InputField from "../ui/InputField";
import SelectDropdown from "../ui/SelectDropdown";
import Button from "../ui/Button";

import {
  getTeacherProfile,
  updateTeacher,
  getBranches,
} from "../../api/apiService";

const UpdateTeacherForm = ({ teacherId, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    teacherId: "",
    name: "",
    phone: "",
    campus: "",
    designation: "",
    isActive: true,
  });
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // --- ১. প্রাথমিক ডেটা লোড করা (শিক্ষকের বর্তমান তথ্য ও ব্রাঞ্চ তালিকা) ---
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!teacherId) return;

      try {
        const [teacherRes, branchesRes] = await Promise.all([
          getTeacherProfile(teacherId),
          getBranches(),
        ]);

        const teacherDetails = teacherRes.data.teacherDetails;

        // ফর্ম ডেটা সেট করা
        setFormData({
          teacherId: teacherDetails.teacherId,
          name: teacherDetails.name,
          phone: teacherDetails.phone,
          campus: teacherDetails.campus._id, // ObjectId
          designation: teacherDetails.designation || "",
          isActive: teacherDetails.isActive,
        });

        setBranches(branchesRes.data);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load initial data.");
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [teacherId]);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    setErrors({ ...errors, [e.target.name]: null }); // ত্রুটি পরিষ্কার করা
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Teacher Name is required.";
    if (!formData.phone) newErrors.phone = "Phone Number is required.";
    if (!formData.campus) newErrors.campus = "Campus selection is required.";
    if (formData.phone && !/^\d+$/.test(formData.phone))
      newErrors.phone = "Phone number must contain only digits.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please correct the validation errors.");
      return;
    }
    setSubmitting(true);

    try {
      const response = await updateTeacher(teacherId, formData);

      // ✅ সফল নোটিফিকেশন
      toast.success(
        `Profile for ${response.data.teacher.name} updated successfully!`
      );

      // প্যারেন্ট কম্পোনেন্টকে আপডেট নিশ্চিত করা
      if (onUpdateSuccess) {
        onUpdateSuccess(response.data.teacher);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "An unknown error occurred during update.";

      // ডুপ্লিকেট ত্রুটির জন্য
      if (errorMessage.includes("already in use by another teacher")) {
        setErrors({ phone: "This phone/ID is already in use." });
      }

      // ❌ ত্রুটির নোটিফিকেশন
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-10">
        <FaSyncAlt className="animate-spin text-3xl text-indigo-500 mx-auto" />
        <p className="mt-2 text-gray-600">Loading teacher data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-2xl border border-gray-100">
      <h2 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center">
        <FaUserEdit className="mr-3 text-indigo-600" />
        Update Teacher Profile ({formData.teacherId})
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Teacher Name (Using InputField) */}
        <InputField
          label="Teacher Name"
          type="text"
          name="name"
          icon={FaUser}
          placeholder="Teacher Name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        {/* Teacher ID (Read-only) */}
        <InputField
          label="Teacher ID"
          type="text"
          name="teacherId"
          icon={FaIdCard}
          value={formData.teacherId}
          placeholder="Teacher ID"
          disabled
          className="bg-gray-50"
        />

        {/* Select Branch (Using SelectDropdown) */}
        <SelectDropdown
          label="Select Campus/Branch"
          name="campus"
          placeholder="Select Branch"
          options={branches}
          value={formData.campus}
          onChange={handleChange}
          error={errors.campus}
          required
        />

        {/* Phone Number (Using InputField) */}
        <InputField
          label="Phone Number"
          type="text"
          name="phone"
          icon={FaPhone}
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          required
        />

        {/* Designation (Using InputField) */}
        <InputField
          label="Designation (Optional)"
          type="text"
          name="designation"
          placeholder="Designation"
          value={formData.designation}
          onChange={handleChange}
        />

        {/* isActive Status Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label
            htmlFor="isActive"
            className="ml-2 block text-sm text-gray-900"
          >
            Is Active (Can be assigned responsibilities)
          </label>
        </div>

        {/* Submit Button (Using Button Component) */}
        <Button type="submit" fullWidth loading={submitting} variant="success">
          <FaSave className="mr-2" />
          UPDATE PROFILE
        </Button>
      </form>
    </div>
  );
};

export default UpdateTeacherForm;

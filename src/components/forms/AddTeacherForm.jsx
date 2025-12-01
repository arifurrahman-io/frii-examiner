import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FaUserPlus,
  FaSave,
  FaUser,
  FaBuilding,
  FaPhone,
  FaIdCard,
  FaUserTie,
} from "react-icons/fa";

// Reusable UI Components
import InputField from "../ui/InputField";
import SelectDropdown from "../ui/SelectDropdown";
import Button from "../ui/Button";

import { addTeacher, getBranches } from "../../api/apiService";

const initialFormData = {
  teacherId: "",
  name: "",
  phone: "",
  campus: "", // Branch ID
  designation: "", // Optional
};

const AddTeacherForm = ({ onSaveSuccess }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // --- মাস্টার ডেটা লোড করা: ব্রাঞ্চের তালিকা ---
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data } = await getBranches();
        setBranches(data);
      } catch (error) {
        toast.error("Failed to load campus list.");
      }
    };
    fetchBranches();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({ ...errors, [name]: null });
  };

  // --- ক্লায়েন্ট-সাইড ভ্যালিডেশন ---
  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Teacher Name is required.";
    if (!formData.teacherId) newErrors.teacherId = "Teacher ID is required.";
    if (!formData.campus) newErrors.campus = "Campus selection is required.";
    if (!formData.phone) newErrors.phone = "Phone Number is required.";
    if (formData.phone && !/^\d+$/.test(formData.phone))
      newErrors.phone = "Phone number must contain only digits.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    setLoading(true);

    try {
      const response = await addTeacher(formData);

      toast.success(`Teacher ${response.data.name} added successfully!`);

      setFormData(initialFormData); // ফর্ম রিসেট

      if (onSaveSuccess) {
        onSaveSuccess(response.data); // প্যারেন্ট কম্পোনেন্টকে জানানো
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "An unknown error occurred while adding the teacher.";

      if (
        errorMessage.includes("Teacher ID or Phone number already registered.")
      ) {
        setErrors({ phone: "ID or Phone already registered." });
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 💡 ELEGANT FIX: Removed shadow-2xl and using a light gray border for a clean, flat design.
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl border border-gray-200">
      {/* 🚀 MODERNIZE: Clean header, reduced border contrast */}
      <h2 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center border-b border-indigo-50 pb-3">
        <FaUserPlus className="mr-3 text-3xl text-indigo-600" />
        Add New Teacher
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Teacher Name */}
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

        {/* Teacher ID */}
        <InputField
          label="Teacher ID"
          type="text"
          name="teacherId"
          icon={FaIdCard}
          placeholder="Teacher ID (e.g., T123456)"
          value={formData.teacherId}
          onChange={handleChange}
          error={errors.teacherId}
          required
        />

        {/* Select Branch */}
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

        {/* Phone Number */}
        <InputField
          label="Phone Number"
          type="text"
          name="phone"
          icon={FaPhone}
          placeholder="Phone Number (ID)"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          required
        />

        {/* Designation (Optional) */}
        <InputField
          label="Designation (Optional)"
          type="text"
          name="designation"
          icon={FaUserTie}
          placeholder="Designation (e.g., Senior Teacher)"
          value={formData.designation}
          onChange={handleChange}
        />

        {/* Submit Button (Using reusable Button component) */}
        <Button type="submit" fullWidth loading={loading} variant="primary">
          <FaSave className="mr-2" />
          ADD TEACHER
        </Button>
      </form>
    </div>
  );
};

export default AddTeacherForm;

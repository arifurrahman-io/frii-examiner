import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  FaPlus,
  FaSave,
  FaEdit,
  FaBuilding,
  FaList,
  FaBookOpen,
  FaTasks,
  FaTag,
} from "react-icons/fa";
import { addMasterData } from "../../api/apiService";

// Reusable UI Components
import InputField from "../ui/InputField";
import Button from "../ui/Button";
import SelectDropdown from "../ui/SelectDropdown";

const MasterEntryForm = ({ type, onSaveSuccess }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Additional fields for specific types
  const [level, setLevel] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Category Options (Mirroring the ResponsibilityTypeModel enum)
  const categoryOptions = [
    { _id: "Examination", name: "Examination" },
    { _id: "Administrative", name: "Administrative" },
    { _id: "Academic", name: "Academic" },
    { _id: "Co-curricular", name: "Co-curricular" },
    { _id: "Other", name: "Other" },
  ];

  // ফর্মের হেডিং এবং প্ল্যাসহোল্ডার সেট করার জন্য লজিক
  const titles = {
    branch: {
      title: "New Branch/Campus",
      placeholder: "Branch Name (e.g., Dhaka Campus)",
      icon: FaBuilding,
    },
    class: {
      title: "New Class/Level",
      placeholder: "Class Name (e.g., Class 9)",
      icon: FaList,
      extraFields: ["level"],
    },
    subject: {
      title: "New Subject",
      placeholder: "Subject Name (e.g., Mathematics)",
      icon: FaBookOpen,
      extraFields: ["code"],
    },
    responsibility: {
      title: "New Responsibility Type",
      placeholder: "Responsibility Name (e.g., Annual Exam Coordinator)",
      icon: FaTasks,
      extraFields: ["category"],
    },
  };

  const currentConfig = titles[type] || {
    title: "Master Entry",
    placeholder: "Name",
    icon: FaEdit,
  };

  const FormIcon = currentConfig.icon;

  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Name is required.";

    if (type === "class" && (!level || isNaN(level))) {
      errors.level = "Level (number) is required.";
    }
    if (type === "subject" && !code.trim()) {
      errors.code = "Subject Code is required.";
    }
    // Responsibility-র জন্য Category ভ্যালিডেশন
    if (type === "responsibility" && !category) {
      errors.category = "Category selection is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!validate()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      // API Payload তৈরি
      const payload = {
        name: name.trim(),
        description: description.trim(),

        // Add conditional fields
        ...(type === "class" && { level: parseInt(level) }),
        ...(type === "subject" && { code: code.trim() }),
        ...(type === "responsibility" && { category: category }),
      };

      await addMasterData(type, payload);

      toast.success(`${currentConfig.title} added successfully!`);

      // রিসেট করা
      setName("");
      setDescription("");
      setLevel("");
      setCode("");
      setCategory("");

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || `Failed to add ${type}.`;
      toast.error(errorMessage);

      if (errorMessage.includes("E11000 duplicate key")) {
        setError(
          `${currentConfig.title} already exists or the Code/Level is duplicated.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // ❌ REMOVED: shadow-2xl. Use clean border.
    <div className="p-6 bg-white rounded-xl border border-gray-300 max-w-lg mx-auto">
      {/* 🚀 Header retains clean styling */}
      <h2 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center border-b-2 border-indigo-100 pb-3">
        <FaPlus className="mr-3 text-3xl text-indigo-600" />
        {currentConfig.title}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <InputField
          label={currentConfig.title}
          type="text"
          name="name"
          icon={FormIcon}
          placeholder={currentConfig.placeholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name || error}
          required
        />

        {/* --- কন্ডিশনাল ফিল্ড --- */}
        {type === "class" && (
          <InputField
            label="Class Level (for sorting)"
            type="number"
            name="level"
            icon={FaList}
            placeholder="Enter numerical level (e.g., 9 for Class 9)"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            error={fieldErrors.level}
            required
          />
        )}

        {type === "subject" && (
          <InputField
            label="Subject Code"
            type="text"
            name="code"
            icon={FaBookOpen}
            placeholder="Enter subject code (e.g., PHY, MTH)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={fieldErrors.code}
            required
          />
        )}

        {/* Responsibility Type এর জন্য Category Dropdown */}
        {type === "responsibility" && (
          <SelectDropdown
            label="Responsibility Category"
            name="category"
            icon={FaTag}
            placeholder="Select Category (Required)"
            options={categoryOptions}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            error={fieldErrors.category}
            required
          />
        )}
        {/* --- কন্ডিশনাল ফিল্ড শেষ --- */}

        {/* Description/Note Input (Textarea) */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description / Note (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a brief description or note (Optional)"
            rows="3"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" fullWidth loading={loading} variant="primary">
          <FaSave className="mr-2" />
          SAVE {type.toUpperCase()}
        </Button>
      </form>
    </div>
  );
};

export default MasterEntryForm;

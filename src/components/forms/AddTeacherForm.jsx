import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaBuilding,
  FaCalendarAlt,
  FaIdCard,
  FaPhone,
  FaSave,
  FaSyncAlt,
  FaUser,
  FaUserTie,
} from "react-icons/fa";
import InputField from "../ui/InputField";
import SelectDropdown from "../ui/SelectDropdown";
import { addTeacher, getBranches } from "../../api/apiService";
import { useAuth } from "../../context/AuthContext";
import { houseRentFromBasic } from "../../utils/incrementUi";

const initialFormData = {
  teacherId: "",
  name: "",
  banglaName: "",
  phone: "",
  campus: "",
  designation: "",
  joiningDate: "",
  basicSalary: "",
  houseRent: "",
};

const AddTeacherForm = ({ onSaveSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialFormData);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isIncharge = user?.role === "incharge";

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data } = await getBranches();
        setBranches(data || []);

        if (isIncharge && user?.campus) {
          setFormData((prev) => ({
            ...prev,
            campus: user.campus._id || user.campus,
          }));
        }
      } catch (error) {
        toast.error("Failed to load branches.");
      }
    };
    fetchBranches();
  }, [isIncharge, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "basicSalary") {
        next.houseRent = houseRentFromBasic(value);
      }
      return next;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.teacherId.trim()) newErrors.teacherId = "Teacher ID is required";
    if (!formData.campus) newErrors.campus = "Branch/Shift is required";
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = "Digits only";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      toast.error("Check required teacher fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await addTeacher(formData);
      const savedTeacher = response.data.teacher || response.data.data;
      toast.success(`${savedTeacher?.name || formData.name} added.`);
      setFormData({
        ...initialFormData,
        campus: isIncharge ? user.campus._id || user.campus : "",
      });
      if (onSaveSuccess) onSaveSuccess(savedTeacher);
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InputField
          label="Teacher's Name"
          name="name"
          icon={FaUser}
          placeholder="Full name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <InputField
          label="Bangla Name"
          name="banglaName"
          icon={FaUser}
          placeholder="বাংলা নাম"
          value={formData.banglaName}
          onChange={handleChange}
        />

        <InputField
          label="Teacher's ID"
          name="teacherId"
          icon={FaIdCard}
          placeholder="T68115116"
          value={formData.teacherId}
          onChange={handleChange}
          error={errors.teacherId}
          required
        />

        {!isIncharge && (
          <SelectDropdown
            label="Branch/Shift"
            name="campus"
            icon={FaBuilding}
            options={branches}
            value={formData.campus}
            onChange={handleChange}
            error={errors.campus}
            required
          />
        )}

        <InputField
          label="Phone Number"
          name="phone"
          icon={FaPhone}
          placeholder="01680000000"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          required
        />

        <InputField
          label="Designation"
          name="designation"
          icon={FaUserTie}
          placeholder="Senior Teacher"
          value={formData.designation}
          onChange={handleChange}
        />

        <InputField
          label="Joining Date"
          name="joiningDate"
          type="date"
          icon={FaCalendarAlt}
          value={formData.joiningDate}
          onChange={handleChange}
        />

        <InputField
          label="Basic Salary"
          name="basicSalary"
          type="number"
          placeholder="0"
          value={formData.basicSalary}
          onChange={handleChange}
        />

        <InputField
          label="House Rent (50% of basic)"
          name="houseRent"
          type="number"
          placeholder="0"
          value={houseRentFromBasic(formData.basicSalary)}
          readOnly
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60 sm:w-auto"
      >
        {loading ? <FaSyncAlt className="animate-spin" /> : <FaSave />}
        Add Teacher
      </button>
    </form>
  );
};

export default AddTeacherForm;

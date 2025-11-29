// src/components/modals/GrantLeaveModal.jsx

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import {
  getResponsibilityTypes,
  grantLeaveRequest,
} from "../../api/apiService";

// --- A. Leave Granting Modal Component ---
const GrantLeaveModal = ({ teacher, isOpen, onClose, onLeaveGrant }) => {
  const [duties, setDuties] = useState([]);
  const [selectedDutyId, setSelectedDutyId] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [reason, setReason] = useState(""); // ✅ NEW: State for detail reason
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDuties = async () => {
      try {
        const { data } = await getResponsibilityTypes();
        setDuties(data);
      } catch (error) {
        toast.error("Failed to load responsibility types.");
      }
    };
    if (isOpen) fetchDuties();
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDutyId || !year) {
      toast.error("Please select a Responsibility Type and Year.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        teacher: teacher._id,
        responsibilityType: selectedDutyId,
        year: parseInt(year),
        reason: reason.trim(), // ✅ NEW: Include reason in payload
        status: "Granted",
      };

      await grantLeaveRequest(payload);

      toast.success(
        `Leave granted for ${
          duties.find((d) => d._id === selectedDutyId)?.name
        } in ${year}.`
      );

      // Reset reason field on success
      setReason("");

      onLeaveGrant(); // Refresh profile view and close modal
      onClose(); // Explicitly close the modal
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to grant leave.");
    } finally {
      setSubmitting(false);
    }
  };

  const yearOptions = [
    new Date().getFullYear() + 1,
    new Date().getFullYear(),
    new Date().getFullYear() - 1,
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Grant Leave for ${teacher.name}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        {/* 1. Responsibility Type Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Responsibility Type (Excused Duty)
          </label>
          <select
            value={selectedDutyId}
            onChange={(e) => setSelectedDutyId(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          >
            <option value="">Select Duty Type</option>
            {duties.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Year Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Year
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Detail Reason Text Area (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Detail Reason (Optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows="3"
            placeholder="E.g., Teacher is on maternity leave or high priority administrative task."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <Button type="submit" variant="primary" loading={submitting}>
            Grant Leave
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GrantLeaveModal;

// src/components/modals/GrantLeaveModal.jsx

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import MultiSelectDropdown from "../ui/MultiSelectDropdown";
import {
  getResponsibilityTypes,
  grantLeaveRequest,
} from "../../api/apiService";

const GrantLeaveModal = ({ teacher, isOpen, onClose, onLeaveGrant }) => {
  const [duties, setDuties] = useState([]);
  const [selectedDutyIds, setSelectedDutyIds] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [reason, setReason] = useState("");
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

    if (isOpen) {
      setSelectedDutyIds([]);
      setReason("");
      setYear(new Date().getFullYear());
      fetchDuties();
    }
  }, [isOpen]);

  const toggleDuty = (dutyId) => {
    setSelectedDutyIds((prev) =>
      prev.includes(dutyId)
        ? prev.filter((id) => id !== dutyId)
        : [...prev, dutyId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedDutyIds.length === 0 || !year) {
      toast.error("Please select at least one Responsibility Type and Year.");
      return;
    }

    setSubmitting(true);
    try {
      const results = await Promise.allSettled(
        selectedDutyIds.map((dutyId) =>
          grantLeaveRequest({
            teacher: teacher._id,
            responsibilityType: dutyId,
            year: parseInt(year),
            reason: reason.trim(),
            status: "Granted",
          })
        )
      );

      const succeeded = results.filter((result) => result.status === "fulfilled");
      const failed = results.filter((result) => result.status === "rejected");

      if (failed.length === 0) {
        const grantedNames = selectedDutyIds
          .map((id) => duties.find((d) => d._id === id)?.name)
          .filter(Boolean);

        toast.success(
          `Leave granted for ${grantedNames.join(", ")} in ${year}.`
        );
        onLeaveGrant();
        onClose();
        return;
      }

      if (succeeded.length > 0) {
        toast.error(
          `${succeeded.length} leave(s) granted, ${failed.length} failed.`
        );
        onLeaveGrant();
        onClose();
        return;
      }

      const firstError = failed[0]?.reason;
      toast.error(
        firstError?.response?.data?.message || "Failed to grant leave."
      );
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
        <MultiSelectDropdown
          label="Responsibility Type (Excused Duty)"
          items={duties}
          selectedIds={selectedDutyIds}
          onToggle={toggleDuty}
          onSelectAll={() => setSelectedDutyIds(duties.map((d) => d._id))}
          onClear={() => setSelectedDutyIds([])}
          placeholder="Select Duty Types"
          allLabel="All duty types"
          required
        />

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

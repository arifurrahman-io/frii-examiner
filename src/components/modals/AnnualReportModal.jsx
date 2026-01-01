import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import SelectDropdown from "../ui/SelectDropdown";
import { addAnnualReport, getResponsibilityTypes } from "../../api/apiService";
import { FaSyncAlt } from "react-icons/fa"; // 👈 এটি যোগ করা হয়নি

const AnnualReportModal = ({ isOpen, onClose, teacherId, onSuccess }) => {
  const [responsibilities, setResponsibilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    responsibility: "",
    performanceReport: "",
  });

  // 🚀 ডাটাবেস থেকে Responsibility Types ফেচ করা
  useEffect(() => {
    const fetchResponsibilities = async () => {
      try {
        const response = await getResponsibilityTypes();
        // নিশ্চিত করুন যে response.data একটি অ্যারে
        setResponsibilities(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching responsibilities:", error);
        toast.error("Failed to load responsibility types.");
      }
    };

    if (isOpen) {
      fetchResponsibilities();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!formData.responsibility || !formData.performanceReport) {
      return toast.error("Please fill all required fields.");
    }
    setLoading(true);
    try {
      await addAnnualReport(teacherId, formData);
      toast.success("Annual report submitted successfully.");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Annual Performance Report"
    >
      <div className="space-y-5 p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
              Session Year
            </label>
            <input
              type="number"
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm"
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
              Assign Responsibility
            </label>
            <SelectDropdown
              options={responsibilities} // 👈 এখন এটি ডাটাবেস থেকে আসা ডাটা ব্যবহার করবে
              value={formData.responsibility}
              onChange={(e) =>
                setFormData({ ...formData, responsibility: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
            Performance Summary
          </label>
          <textarea
            className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm min-h-[120px]"
            placeholder="Describe teacher's performance during this session..."
            value={formData.performanceReport}
            onChange={(e) =>
              setFormData({ ...formData, performanceReport: e.target.value })
            }
          />
        </div>

        <div className="pt-4">
          <Button
            onClick={handleSubmit}
            fullWidth
            variant="primary"
            disabled={loading}
          >
            {loading ? (
              <FaSyncAlt className="animate-spin mx-auto" />
            ) : (
              "SUBMIT ANNUAL REPORT"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AnnualReportModal;

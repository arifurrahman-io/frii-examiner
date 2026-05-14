import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaClipboardCheck,
  FaShieldAlt,
  FaSyncAlt,
} from "react-icons/fa";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import SelectDropdown from "../ui/SelectDropdown";
import { addAnnualReport, getResponsibilityTypes } from "../../api/apiService";
import { useAuth } from "../../context/AuthContext";

const createEmptyForm = () => ({
  year: new Date().getFullYear(),
  responsibility: "",
  performanceReport: "",
});

const getReviewScope = (user) => {
  if (user?.role === "head_teacher") {
    return {
      label: "Headmaster approval",
      detail: "School-wide access for all teachers",
    };
  }

  if (user?.role === "incharge") {
    return {
      label: "Branch incharge approval",
      detail: user?.campus?.name
        ? `Limited to ${user.campus.name}`
        : "Limited to assigned branch",
    };
  }

  return {
    label: "Admin approval",
    detail: "School-wide access for all teachers",
  };
};

const AnnualReportModal = ({
  isOpen,
  onClose,
  teacherId,
  teacher,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [responsibilities, setResponsibilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [formData, setFormData] = useState(createEmptyForm);

  const selectedResponsibility = useMemo(
    () =>
      responsibilities.find(
        (responsibility) => responsibility._id === formData.responsibility
      ),
    [responsibilities, formData.responsibility]
  );

  const reviewScope = useMemo(() => getReviewScope(user), [user]);

  useEffect(() => {
    const fetchResponsibilities = async () => {
      try {
        const response = await getResponsibilityTypes();
        setResponsibilities(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching responsibilities:", error);
        toast.error("Failed to load responsibility types.");
      }
    };

    if (isOpen) {
      setConfirming(false);
      fetchResponsibilities();
    }
  }, [isOpen]);

  const validate = () => {
    if (!formData.responsibility || !formData.performanceReport.trim()) {
      toast.error("Please fill all required fields.");
      return false;
    }

    if (!formData.year || Number(formData.year) < 2000) {
      toast.error("Enter a valid session year.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (!confirming) {
      setConfirming(true);
      return;
    }

    setLoading(true);
    try {
      await addAnnualReport(teacherId, {
        ...formData,
        year: Number(formData.year),
        performanceReport: formData.performanceReport.trim(),
      });
      toast.success("Annual report submitted successfully.");
      setFormData(createEmptyForm());
      setConfirming(false);
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save report.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setConfirming(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Performance Report">
      <div className="space-y-5 p-1">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-white text-teal-700">
              <FaShieldAlt />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-teal-700">
                {reviewScope.label}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {reviewScope.detail}
              </p>
              {teacher?.name && (
                <p className="mt-2 text-sm font-bold text-slate-900">
                  {teacher.name} | {teacher.campus?.name || "Campus"}
                </p>
              )}
            </div>
          </div>
        </div>

        {!confirming ? (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Session year
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
                  value={formData.year}
                  onChange={(event) =>
                    setFormData({ ...formData, year: event.target.value })
                  }
                />
              </div>

              <SelectDropdown
                label="Responsibility"
                options={responsibilities}
                value={formData.responsibility}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    responsibility: event.target.value,
                  })
                }
              />
            </div>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Performance summary
              </span>
              <textarea
                className="min-h-[128px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
                placeholder="Describe teacher performance during this session..."
                value={formData.performanceReport}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    performanceReport: event.target.value,
                  })
                }
              />
            </label>
          </>
        ) : (
          <div className="space-y-3 rounded-lg border border-teal-200 bg-teal-50 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-teal-900">
              <FaClipboardCheck />
              Confirm report before submission
            </div>
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-teal-700">Year</p>
                <p className="font-bold text-slate-900">{formData.year}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-teal-700">
                  Responsibility
                </p>
                <p className="font-bold text-slate-900">
                  {selectedResponsibility?.name || "Selected responsibility"}
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-white p-3 text-sm leading-6 text-slate-700">
              {formData.performanceReport}
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          {confirming ? (
            <Button
              variant="secondary"
              onClick={() => setConfirming(false)}
              disabled={loading}
            >
              <FaArrowLeft size={13} />
              Edit
            </Button>
          ) : (
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <FaSyncAlt className="animate-spin" />
            ) : (
              <FaClipboardCheck size={13} />
            )}
            {confirming ? "Confirm report" : "Review report"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AnnualReportModal;

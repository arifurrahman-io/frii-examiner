import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FaUserCheck,
  FaEdit,
  FaBook,
  FaChevronDown,
  FaChevronUp,
  FaTimesCircle, // Conflict/Delete Icon
  FaSyncAlt, // Loading Icon
  FaExclamationCircle,
} from "react-icons/fa";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import {
  assignDuty,
  getAssignmentsByTeacherAndYear,
  deleteAssignmentPermanently,
  checkLeaveConflict,
} from "../../api/apiService";

// নতুন কালার প্যালেট
const baseBg = "bg-blue-50";
const accentColor = "text-indigo-700";
const detailColor = "text-indigo-800";
const borderColor = "border-blue-200";
const dividerColor = "border-blue-200";
const routinePillBg = "bg-blue-100";
const routinePillText = "text-blue-800";

const AssignmentCard = ({
  teacher,
  assignmentsByYear,
  responsibilityType,
  targetClass,
  targetSubject,
  year,
  routineSchedule,
  onAssignSuccess,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  // Conflict Management States
  const [existingAssignments, setExistingAssignments] = useState([]);
  const [conflictLoading, setConflictLoading] = useState(false);
  const [isConflict, setIsConflict] = useState(false);
  const [isLeaveConflict, setIsLeaveConflict] = useState(false);

  // শুধুমাত্র বর্তমান বছরের রুটিন ফিল্টার করা
  // ✅ FIX: Filter routine data by the 'year' property, not endsWith()
  const routineDataCurrentYear = Array.isArray(routineSchedule)
    ? routineSchedule.filter((item) => item.year === currentYear)
    : [];

  // বছর অনুযায়ী অ্যাসাইনমেন্ট ডেটা বের করা (সুরক্ষিত)
  const assignmentsByYearArray = Array.isArray(assignmentsByYear)
    ? assignmentsByYear
    : [];
  const assignmentsCurrent =
    assignmentsByYearArray.find((a) => a._id === currentYear)
      ?.responsibilities || [];
  const assignmentsPrevious =
    assignmentsByYearArray.find((a) => a._id === previousYear)
      ?.responsibilities || [];

  // --- A. Leave Conflict Check Logic (NEW) ---
  const checkLeaveStatus = useCallback(async () => {
    if (!teacher._id || !year || !responsibilityType._id) return;

    setConflictLoading(true);
    try {
      const filters = {
        teacherId: teacher._id,
        responsibilityTypeId: responsibilityType._id,
        year: year,
      };
      const { data } = await checkLeaveConflict(filters);

      setIsLeaveConflict(data.hasConflict);
    } catch (error) {
      console.error("Error checking leave status:", error);
      setIsLeaveConflict(false);
    } finally {
      setConflictLoading(false);
    }
  }, [teacher._id, year, responsibilityType._id]);

  // দায়িত্বের তালিকা আইটেম রেন্ডার
  const AssignmentList = ({ list }) => (
    <ul className="text-xs text-gray-700 space-y-0.5">
      {list.map((assignment, index) => {
        const className = assignment.class?.name || assignment.class || "N/A";
        const subjectName =
          assignment.subject?.name || assignment.subject || "N/A";

        return (
          <li key={index} className="flex items-start">
            <span className="w-4">{index + 1}.</span>
            <span className="flex-1">
              {assignment.name}
              <span className="ml-1 text-gray-500">
                ({className} {subjectName})
              </span>
            </span>
          </li>
        );
      })}
      {list.length === 0 && (
        <li className="text-gray-500 italic">No data found!</li>
      )}
    </ul>
  );

  // --- ক. মডাল খোলার পর ডেটা লোড করার লজিক (Existing Assignments) ---
  const fetchExistingAssignments = useCallback(async () => {
    if (!teacher._id || !year || !responsibilityType._id) return;

    setConflictLoading(true);
    try {
      const { data } = await getAssignmentsByTeacherAndYear(teacher._id, year);

      // একই ডিউটি টাইপ চেক করা: যদি active assignments এর মধ্যে মেলে
      const hasConflict = data.some(
        (a) =>
          a.responsibilityType.name === responsibilityType.name &&
          a.status === "Assigned"
      );

      setExistingAssignments(data);
      setIsConflict(hasConflict);
    } catch (error) {
      toast.error("Failed to load existing assignments.");
      setExistingAssignments([]);
      setIsConflict(false);
    } finally {
      setConflictLoading(false);
    }
  }, [teacher._id, year, responsibilityType.name]);

  // মডাল খুললে ডেটা ফেচ করা
  useEffect(() => {
    if (isModalOpen) {
      fetchExistingAssignments();
      checkLeaveStatus();
    }
  }, [isModalOpen, fetchExistingAssignments]);

  // --- খ. বিদ্যমান অ্যাসাইনমেন্ট বাতিল করা (Delete Option) ---
  const handleCancelExisting = async (assignmentId) => {
    setLoading(true);
    try {
      // স্থায়ী ডিলিট API কল করা
      await deleteAssignmentPermanently(assignmentId);
      toast.success("Assignment permanently deleted from the database.");

      // স্থানীয় Modal ডেটা রিফ্রেশ করা
      await fetchExistingAssignments();

      // গ্লোবাল হিস্টোরি রিফ্রেশ ট্রিগার করা
      if (onAssignSuccess) onAssignSuccess();
    } catch (error) {
      toast.error(
        "Failed to permanently delete assignment. Check permissions."
      );
    } finally {
      setLoading(false);
    }
  };

  // --- গ. নতুন দায়িত্ব অ্যাসাইন করার লজিক ---
  const handleAssignDuty = async () => {
    setLoading(true);

    const assignmentData = {
      teacher: teacher._id,
      responsibilityType: responsibilityType._id,
      year: year,
      targetClass: targetClass._id,
      targetSubject: targetSubject._id,
    };

    try {
      await assignDuty(assignmentData);

      toast.success(
        `'${responsibilityType.name}' assigned to ${teacher.name}.`
      );

      if (onAssignSuccess) {
        onAssignSuccess();
      }

      setIsModalOpen(false);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Assignment failed. Check if already assigned or data integrity.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- ঘ. মডালের ভেতরের টেবিল রেন্ডার করা ---
  const ConflictTable = () => {
    if (conflictLoading)
      return (
        <p className="text-center text-indigo-500">
          <FaSyncAlt className="animate-spin mr-2 inline" /> Checking for
          conflicts...
        </p>
      );

    const filteredAssignments = existingAssignments.filter(
      (a) => a.status === "Assigned"
    );

    return (
      <div className="mt-4 border-t pt-3">
        <h5 className="font-semibold text-gray-700 mb-2">
          Existing Active Assignments in {year} ({filteredAssignments.length})
        </h5>

        <div className="max-h-40 overflow-y-auto space-y-2">
          {filteredAssignments.map((a) => (
            <div
              key={a._id}
              className={`flex justify-between items-center p-2 rounded-lg ${
                a.responsibilityType.name === responsibilityType.name
                  ? "bg-red-100 border border-red-300"
                  : "bg-gray-100"
              }`}
            >
              <span className="text-sm font-medium">
                {a.responsibilityType.name}
                {a.targetClass &&
                  ` (${a.targetClass.name} - ${a.targetSubject.name})`}
              </span>

              <button
                onClick={() => handleCancelExisting(a._id)}
                className="text-red-500 hover:text-red-700 text-xs flex items-center disabled:opacity-50"
                disabled={loading}
              >
                <FaTimesCircle className="mr-1" /> Delete
              </button>
            </div>
          ))}
          {filteredAssignments.length === 0 && (
            <p className="text-sm italic text-gray-500">
              No other active assignments found for {year}.
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className={`p-4 rounded-xl shadow-lg border ${borderColor} ${baseBg} space-y-3`}
      >
        {/* --- ১. টপ সেকশন: নাম, আইডি, ক্যাম্পাস, ASSIGN বাটন --- */}
        <div className="flex justify-between items-center pb-2 border-b border-indigo-200">
          <div className="flex items-center space-x-3">
            <FaUserCheck className={`text-xl ${accentColor}`} />
            <div className="flex flex-col">
              <h3
                className={`text-lg font-extrabold ${detailColor} leading-tight`}
              >
                {teacher.name}
              </h3>
              <p className="text-sm font-medium text-gray-600">
                ID: {teacher.teacherId} | Campus:{" "}
                {teacher.campus?.name || "N/A"}
              </p>
            </div>
          </div>

          {/* ASSIGN বাটন */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            variant="success"
            className="px-4 py-2"
          >
            <FaEdit className="mr-2" />
            ASSIGN
          </Button>
        </div>

        {/* --- ২. দায়িত্বের ইতিহাস টেবিল (ইতিহাস) --- */}
        <div
          className={`grid grid-cols-2 gap-4 mt-2 border-b ${dividerColor} pb-3`}
        >
          <div className={`border-r ${dividerColor} pr-2`}>
            <p className="text-sm font-bold text-gray-800 mb-1">
              {currentYear} Assignments
            </p>
            <AssignmentList list={assignmentsCurrent} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 mb-1">
              {previousYear} Assignments
            </p>
            <AssignmentList list={assignmentsPrevious} />
          </div>
        </div>

        {/* --- ৩. রুটিন ডিটেইলস টগল --- */}
        <div className="pt-2">
          <div
            onClick={() => setIsOpen(!isOpen)}
            className={`flex justify-between items-center cursor-pointer ${detailColor} font-bold`}
          >
            <h4 className={`text-md ${detailColor} flex items-center`}>
              <FaBook className="mr-2" /> Routine Schedule
            </h4>
            <span className={`text-xl ${accentColor}`}>
              {isOpen ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </div>

          {isOpen && (
            <div className="mt-3">
              {routineDataCurrentYear.length > 0 ? (
                <div className="flex flex-wrap gap-2 text-sm">
                  {routineDataCurrentYear.map((item) => (
                    <span
                      key={item._id}
                      className={`px-2 py-1 ${routinePillBg} ${routinePillText} rounded-full font-medium`}
                    >
                      {item.display} {/* ✅ Using the display property */}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 italic mt-1">
                  No detailed routine schedule found for this teacher.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- অ্যাসাইনমেন্ট কনফার্মেশন Modal (Conflict Management) --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Responsibility Assignment"
      >
        <div className="p-4">
          <p className="text-gray-700 text-lg mb-4">
            Are you sure you want to assign the following duty?
          </p>

          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 space-y-1 text-sm font-medium">
            <p>
              <strong>Duty Type:</strong>{" "}
              <span className="text-indigo-700 font-extrabold">
                {responsibilityType.name}
              </span>
            </p>
            <p>
              <strong>Target:</strong> {targetClass.name} - {targetSubject.name}
            </p>
            <p>
              <strong>Year:</strong> {year}
            </p>
          </div>

          {/* ✅ Conflict Table Section */}
          <ConflictTable />

          {/* ✅ NEW: Leave Conflict Warning Message (Yellow Warning) */}
          {isLeaveConflict && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm font-semibold text-yellow-800 flex items-center">
              <FaExclamationCircle className="mr-2 text-xl" />
              LEAVE CONFLICT: This teacher has been granted leave for this duty
              type in {year}. The assignment will be blocked by the server.
            </div>
          )}

          {/* ✅ Conflict Warning Message */}
          {isConflict && (
            <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg text-sm font-semibold text-red-800 flex items-center">
              <FaTimesCircle className="mr-2 text-xl" />
              CONFLICT: This exact duty type is already assigned for {year}.
              Please delete the existing entry first.
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => setIsModalOpen(false)}
              variant="secondary"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignDuty}
              variant="primary"
              loading={loading}
              disabled={loading || isConflict}
            >
              <FaUserCheck className="mr-2" />
              Confirm Assign
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AssignmentCard;

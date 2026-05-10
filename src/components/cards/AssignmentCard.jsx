import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FaUserCheck,
  FaEdit,
  FaBook,
  FaChevronDown,
  FaSyncAlt,
  FaTimesCircle,
  FaExclamationCircle,
  FaIdBadge,
  FaUniversity,
  FaLayerGroup,
  FaHistory,
} from "react-icons/fa";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import {
  assignDuty,
  getAssignmentsByTeacherAndYear,
  deleteAssignmentPermanently,
  checkLeaveConflict,
} from "../../api/apiService";

const getName = (value) => (typeof value === "object" ? value?.name : value);
const normalizeName = (value) =>
  getName(value)?.toString().trim().toLowerCase() || "";
const getAssignmentTypeName = (assignment) =>
  getName(assignment.responsibilityType) || getName(assignment.name);
const getAssignmentClassName = (assignment) =>
  getName(assignment.targetClass) || getName(assignment.class);
const getAssignmentSubjectName = (assignment) =>
  getName(assignment.targetSubject) || getName(assignment.subject);

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
  const selectedYear = Number(year);
  const previousYear = selectedYear - 1;

  const [existingAssignments, setExistingAssignments] = useState([]);
  const [conflictLoading, setConflictLoading] = useState(false);
  const [isConflict, setIsConflict] = useState(false);
  const [isLeaveConflict, setIsLeaveConflict] = useState(false);

  const matchesSelectedTarget = useCallback(
    (assignment) =>
      normalizeName(getAssignmentTypeName(assignment)) ===
        normalizeName(responsibilityType?.name) &&
      normalizeName(getAssignmentClassName(assignment)) ===
        normalizeName(targetClass?.name) &&
      normalizeName(getAssignmentSubjectName(assignment)) ===
        normalizeName(targetSubject?.name),
    [responsibilityType?.name, targetClass?.name, targetSubject?.name]
  );

  // --- Filter Routine Data ---
  const routineDataCurrentYear = Array.isArray(routineSchedule)
    ? routineSchedule.filter((item) => item.year === selectedYear)
    : [];

  const assignmentsByYearArray = Array.isArray(assignmentsByYear)
    ? assignmentsByYear
    : [];
  const assignmentsCurrent =
    assignmentsByYearArray
      .find((a) => a._id === selectedYear)
      ?.responsibilities || [];
  const assignmentsPrevious =
    assignmentsByYearArray.find((a) => a._id === previousYear)
      ?.responsibilities || [];

  const checkLeaveStatus = useCallback(async () => {
    if (!teacher._id || !year || !responsibilityType?._id) return;
    try {
      const { data } = await checkLeaveConflict({
        teacherId: teacher._id,
        responsibilityTypeId: responsibilityType._id,
        year,
      });
      setIsLeaveConflict(data.hasConflict);
    } catch (error) {
      setIsLeaveConflict(false);
    }
  }, [teacher._id, year, responsibilityType?._id]);

  const fetchExistingAssignments = useCallback(async () => {
    if (!teacher._id || !year || !responsibilityType?.name) return;
    setConflictLoading(true);
    try {
      const { data } = await getAssignmentsByTeacherAndYear(teacher._id, year);
      const hasConflict = data.some(
        (a) => a.status === "Assigned" && matchesSelectedTarget(a)
      );
      setExistingAssignments(data);
      setIsConflict(hasConflict);
    } catch (error) {
      setExistingAssignments([]);
    } finally {
      setConflictLoading(false);
    }
  }, [
    teacher._id,
    year,
    responsibilityType?.name,
    matchesSelectedTarget,
  ]);

  useEffect(() => {
    if (isModalOpen) {
      fetchExistingAssignments();
      checkLeaveStatus();
    }
  }, [isModalOpen, fetchExistingAssignments, checkLeaveStatus]);

  const handleAssignDuty = async () => {
    setLoading(true);
    try {
      await assignDuty({
        teacher: teacher._id,
        responsibilityType: responsibilityType._id,
        year,
        targetClass: targetClass._id,
        targetSubject: targetSubject._id,
      });
      toast.success(`Assigned successfully!`);
      if (onAssignSuccess) onAssignSuccess();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Assignment failed.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Updated List with Subject Integration
  const CompactList = ({ list, title, icon: Icon, color, showAll = false }) => (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={`text-xs ${color}`} />
        <p className="truncate text-xs font-semibold text-slate-500">
          {title}
        </p>
      </div>
      <div className="max-h-40 space-y-1 overflow-y-auto">
        {list.length > 0 ? (
          (showAll ? list : list.slice(0, 2)).map((a, i) => (
            <p
              key={i}
              className="truncate text-xs font-semibold leading-tight text-slate-700"
            >
              {a.name?.name || a.name || "N/A"}{" "}
              <span className="font-medium text-slate-400">
                (
                {typeof a.class === "object" ? a.class?.name : a.class || "N/A"}{" "}
                |{" "}
                {typeof a.subject === "object"
                  ? a.subject?.name
                  : a.subject || "N/A"}
                )
              </span>
            </p>
          ))
        ) : (
          <p className="text-xs font-semibold text-slate-300">
            No data
          </p>
        )}
        {!showAll && list.length > 2 && (
          <p className="text-xs font-bold text-teal-700">
            + {list.length - 2} more
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="border border-slate-200 bg-white p-5 transition-colors hover:bg-slate-50">
        {/* --- HEADER: RESPONSIVE --- */}
        <div className="mb-4 flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-slate-900 text-white">
              <span className="text-sm font-bold">
                {teacher.name?.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold leading-tight text-slate-900">
                {teacher.name}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1 shrink-0">
                  <FaIdBadge className="text-slate-300" /> {teacher.teacherId}
                </span>
                <span className="flex items-center gap-1 truncate">
                  <FaUniversity className="shrink-0 text-slate-300" />{" "}
                  {teacher.campus?.name || "Global"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-teal-800 sm:w-auto"
          >
            <FaEdit /> Assign
          </button>
        </div>

        {/* --- MATRIX: ADAPTIVE --- */}
        <div className="grid grid-cols-1 gap-5 border-b border-slate-200 pb-4 sm:grid-cols-2">
          <div className="sm:border-r sm:border-slate-200 sm:pr-4">
            <CompactList
              list={assignmentsCurrent}
              title={`Cycle ${selectedYear}`}
              icon={FaLayerGroup}
              color="text-teal-700"
            />
          </div>
          <div className="sm:pl-1">
            <CompactList
              list={assignmentsPrevious}
              title={`Archive ${previousYear}`}
              icon={FaHistory}
              color="text-slate-400"
              showAll
            />
          </div>
        </div>

        {/* --- ROUTINE ACCORDION --- */}
        <div className="pt-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex w-full items-center justify-between py-1 text-xs font-semibold text-slate-500 hover:text-teal-700"
          >
            <span className="flex items-center gap-2">
              <FaBook className="text-teal-700" /> Routine
            </span>
            <FaChevronDown
              className={`transition-transform duration-500 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isOpen && (
            <div className="mt-3 flex flex-wrap gap-2">
              {routineDataCurrentYear.length > 0 ? (
                routineDataCurrentYear.map((item) => (
                  <span
                    key={item._id}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600"
                  >
                    {item.display}
                  </span>
                ))
              ) : (
                <p className="text-xs font-semibold text-slate-300">
                  No routine data.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-2 uppercase tracking-tighter font-black text-slate-800 text-sm sm:text-base">
            <FaUserCheck className="text-indigo-600" /> Confirm Allocation
          </div>
        }
      >
        <div className="p-1 sm:p-2 space-y-5 sm:space-y-6">
          <div className="bg-indigo-50/50 p-4 sm:p-6 rounded-[1.5rem] border border-indigo-100 space-y-2">
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
              Target Prototype
            </p>
            <h4 className="text-lg sm:text-xl font-black text-indigo-900 leading-tight uppercase">
              {responsibilityType?.name}
            </h4>
            <p className="text-[10px] sm:text-xs font-bold text-indigo-600 uppercase tracking-tight">
              {targetClass?.name} • {targetSubject?.name} ({year})
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FaSyncAlt className={conflictLoading ? "animate-spin" : ""} />{" "}
              Active Matrix Integrity Check
            </p>
            <div className="max-h-40 overflow-y-auto space-y-2 custom-scrollbar pr-1">
              {existingAssignments
                .filter((a) => a.status === "Assigned")
                .map((a) => (
                  <div
                    key={a._id}
                    className={`flex justify-between items-center p-3 rounded-xl border ${
                      matchesSelectedTarget(a)
                        ? "bg-rose-50 border-rose-100"
                        : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-[10px] font-bold text-slate-700 uppercase truncate">
                        {a.responsibilityType?.name}
                      </p>
                      {/* ✅ Modal conflict list with Subject integration */}
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">
                        (
                        {getAssignmentClassName(a) || "N/A"}{" "}
                        |{" "}
                        {getAssignmentSubjectName(a) || "N/A"}
                        )
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        deleteAssignmentPermanently(a._id).then(
                          fetchExistingAssignments
                        )
                      }
                      className="shrink-0 text-[8px] font-black text-rose-500 uppercase hover:bg-rose-100 px-2 py-1 rounded transition-colors"
                    >
                      Terminate
                    </button>
                  </div>
                ))}
              {existingAssignments.length === 0 && !conflictLoading && (
                <p className="text-[10px] text-slate-300 font-bold uppercase italic text-center py-6 border-2 border-dashed border-slate-50 rounded-2xl">
                  No conflicts detected.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {isLeaveConflict && (
              <div className="p-3 sm:p-4 bg-amber-50 border border-amber-100 rounded-xl text-[9px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-3 animate-pulse">
                <FaExclamationCircle size={14} /> LEAVE CONFLICT DETECTED
              </div>
            )}
            {isConflict && (
              <div className="p-3 sm:p-4 bg-rose-50 border border-rose-100 rounded-xl text-[9px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-3">
                <FaTimesCircle size={14} /> DUPLICATE DUTY BLOCKED
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={() => setIsModalOpen(false)}
              variant="secondary"
              className="w-full py-4 rounded-xl uppercase font-black text-[10px] tracking-widest"
            >
              Abort
            </Button>
            <Button
              onClick={handleAssignDuty}
              variant="primary"
              loading={loading}
              disabled={isConflict}
              className="w-full py-4 rounded-xl uppercase font-black text-[10px] tracking-widest bg-slate-900"
            >
              Authorize
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AssignmentCard;

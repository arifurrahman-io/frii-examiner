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

  const [existingAssignments, setExistingAssignments] = useState([]);
  const [conflictLoading, setConflictLoading] = useState(false);
  const [isConflict, setIsConflict] = useState(false);
  const [isLeaveConflict, setIsLeaveConflict] = useState(false);

  // --- Filter Routine Data ---
  const routineDataCurrentYear = Array.isArray(routineSchedule)
    ? routineSchedule.filter((item) => item.year === currentYear)
    : [];

  const assignmentsByYearArray = Array.isArray(assignmentsByYear)
    ? assignmentsByYear
    : [];
  const assignmentsCurrent =
    assignmentsByYearArray.find((a) => a._id === currentYear)
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
        (a) =>
          a.responsibilityType?.name === responsibilityType.name &&
          a.status === "Assigned"
      );
      setExistingAssignments(data);
      setIsConflict(hasConflict);
    } catch (error) {
      setExistingAssignments([]);
    } finally {
      setConflictLoading(false);
    }
  }, [teacher._id, year, responsibilityType?.name]);

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
  const CompactList = ({ list, title, icon: Icon, color }) => (
    <div className="flex flex-col space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className={`text-[8px] sm:text-[10px] ${color}`} />
        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
          {title}
        </p>
      </div>
      <div className="space-y-1 max-h-20 overflow-y-auto no-scrollbar">
        {list.length > 0 ? (
          list.slice(0, 2).map((a, i) => (
            <p
              key={i}
              className="text-[10px] sm:text-[11px] font-bold text-slate-600 truncate leading-tight"
            >
              {a.name?.name || a.name || "N/A"}{" "}
              <span className="text-slate-400 font-medium italic">
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
          <p className="text-[9px] text-slate-300 italic font-bold">
            Empty Node
          </p>
        )}
        {list.length > 2 && (
          <p className="text-[8px] font-black text-indigo-400">
            + {list.length - 2} Vectors
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="group relative bg-white/80 backdrop-blur-md rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 border border-white shadow-sm hover:shadow-indigo-100 transition-all duration-500 overflow-hidden">
        {/* --- HEADER: RESPONSIVE --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 pb-4 border-b border-slate-50 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-slate-900 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 group-hover:rotate-6 transition-transform">
              <span className="text-sm sm:text-lg font-black uppercase">
                {teacher.name?.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight leading-none mb-1.5 truncate">
                {teacher.name}
              </h3>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-1 shrink-0">
                  <FaIdBadge className="text-indigo-400" /> {teacher.teacherId}
                </span>
                <span className="hidden sm:block h-0.5 w-0.5 rounded-full bg-slate-300"></span>
                <span className="text-indigo-500 flex items-center gap-1 truncate">
                  <FaUniversity className="text-indigo-400 shrink-0" />{" "}
                  {teacher.campus?.name || "Global"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto h-9 sm:h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <FaEdit /> ASSIGN
          </button>
        </div>

        {/* --- MATRIX: ADAPTIVE --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-b border-slate-50 pb-4">
          <div className="sm:border-r border-slate-100 sm:pr-4">
            <CompactList
              list={assignmentsCurrent}
              title={`Cycle ${currentYear}`}
              icon={FaLayerGroup}
              color="text-indigo-500"
            />
          </div>
          <div className="sm:pl-1">
            <CompactList
              list={assignmentsPrevious}
              title={`Archive ${previousYear}`}
              icon={FaHistory}
              color="text-slate-400"
            />
          </div>
        </div>

        {/* --- ROUTINE ACCORDION --- */}
        <div className="pt-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex justify-between items-center py-1 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors"
          >
            <span className="flex items-center gap-2">
              <FaBook className="text-indigo-300" /> Routine Matrix
            </span>
            <FaChevronDown
              className={`transition-transform duration-500 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isOpen && (
            <div className="mt-3 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1">
              {routineDataCurrentYear.length > 0 ? (
                routineDataCurrentYear.map((item) => (
                  <span
                    key={item._id}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-500 rounded-lg text-[8px] font-bold uppercase tracking-tighter"
                  >
                    {item.display}
                  </span>
                ))
              ) : (
                <p className="text-[9px] text-slate-300 italic font-bold">
                  Zero routine data.
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
                      a.responsibilityType?.name === responsibilityType?.name
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
                        {typeof a.class === "object"
                          ? a.class?.name
                          : a.class || "N/A"}{" "}
                        |{" "}
                        {typeof a.subject === "object"
                          ? a.subject?.name
                          : a.subject || "N/A"}
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

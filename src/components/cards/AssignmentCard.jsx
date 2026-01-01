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
    if (!teacher._id || !year || !responsibilityType._id) return;
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
  }, [teacher._id, year, responsibilityType._id]);

  const fetchExistingAssignments = useCallback(async () => {
    if (!teacher._id || !year || !responsibilityType.name) return;
    setConflictLoading(true);
    try {
      const { data } = await getAssignmentsByTeacherAndYear(teacher._id, year);
      const hasConflict = data.some(
        (a) =>
          a.responsibilityType.name === responsibilityType.name &&
          a.status === "Assigned"
      );
      setExistingAssignments(data);
      setIsConflict(hasConflict);
    } catch (error) {
      setExistingAssignments([]);
    } finally {
      setConflictLoading(false);
    }
  }, [teacher._id, year, responsibilityType.name]);

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

  const CompactList = ({ list, title, icon: Icon, color }) => (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center gap-1.5">
        <Icon className={`text-[8px] ${color}`} />
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
          {title}
        </p>
      </div>
      <div className="space-y-0.5 max-h-16 overflow-y-auto no-scrollbar">
        {list.length > 0 ? (
          list.slice(0, 2).map((a, i) => (
            <p key={i} className="text-[9px] font-bold text-slate-600 truncate">
              {a.name}{" "}
              <span className="text-slate-400 font-medium">
                ({a.class?.name || "N/A"})
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
            + {list.length - 2} More
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="group relative bg-white/80 backdrop-blur-md rounded-[1.5rem] p-4 border border-white shadow-[0_10px_30px_rgba(79,70,229,0.02)] hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-500 overflow-hidden">
        {/* HEADER: COMPACT */}
        <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-50 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform duration-500">
              <span className="text-xs font-black">
                {teacher.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">
                {teacher.name}
              </h3>
              <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-1">
                  <FaIdBadge className="text-indigo-400" /> {teacher.teacherId}
                </span>
                <span className="h-0.5 w-0.5 rounded-full bg-slate-200"></span>
                <span className="text-indigo-500 flex items-center gap-1">
                  <FaUniversity className="text-indigo-400" />{" "}
                  {teacher.campus?.name || "Global"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
          >
            <FaEdit /> ASSIGN
          </button>
        </div>

        {/* ASSIGNMENT MATRIX: INLINE */}
        <div className="grid grid-cols-2 gap-4 border-b border-slate-50 pb-3">
          <div className="border-r border-slate-50 pr-2">
            <CompactList
              list={assignmentsCurrent}
              title={`Cycle ${currentYear}`}
              icon={FaLayerGroup}
              color="text-indigo-500"
            />
          </div>
          <div className="pl-1">
            <CompactList
              list={assignmentsPrevious}
              title={`Archive ${previousYear}`}
              icon={FaHistory}
              color="text-slate-400"
            />
          </div>
        </div>

        {/* ROUTINE TOGGLE: MINIMAL */}
        <div className="pt-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors"
          >
            <span className="flex items-center gap-2">
              <FaBook className="text-indigo-300" /> Routine Sync
            </span>
            <FaChevronDown
              className={`transition-transform duration-500 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isOpen && (
            <div className="mt-2 flex flex-wrap gap-1.5 animate-in fade-in slide-in-from-top-1">
              {routineDataCurrentYear.length > 0 ? (
                routineDataCurrentYear.map((item) => (
                  <span
                    key={item._id}
                    className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-md text-[8px] font-bold uppercase tracking-tighter"
                  >
                    {item.display}
                  </span>
                ))
              ) : (
                <p className="text-[8px] text-slate-300 italic font-bold">
                  No Neural Routine Data
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODERN CONFLICT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-2 uppercase tracking-tighter font-black text-slate-800">
            <FaUserCheck className="text-indigo-600" /> Confirm Induction
          </div>
        }
      >
        <div className="p-2 space-y-6">
          <div className="bg-indigo-50/50 p-5 rounded-[1.5rem] border border-indigo-100 space-y-2">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
              Selected Prototype
            </p>
            <h4 className="text-xl font-black text-indigo-900 leading-none">
              {responsibilityType.name}
            </h4>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-tight">
              {targetClass.name} • {targetSubject.name} ({year})
            </p>
          </div>

          {/* Conflict Console */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FaSyncAlt className={conflictLoading ? "animate-spin" : ""} />{" "}
              Active Matrix Sync
            </p>
            <div className="max-h-32 overflow-y-auto space-y-2 custom-scrollbar pr-1">
              {existingAssignments
                .filter((a) => a.status === "Assigned")
                .map((a) => (
                  <div
                    key={a._id}
                    className={`flex justify-between items-center p-3 rounded-xl border ${
                      a.responsibilityType.name === responsibilityType.name
                        ? "bg-rose-50 border-rose-100"
                        : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-700 uppercase">
                      {a.responsibilityType.name}
                    </span>
                    <button
                      onClick={() =>
                        deleteAssignmentPermanently(a._id).then(
                          fetchExistingAssignments
                        )
                      }
                      className="text-[8px] font-black text-rose-500 uppercase hover:underline"
                    >
                      Delete Node
                    </button>
                  </div>
                ))}
              {existingAssignments.length === 0 && !conflictLoading && (
                <p className="text-[10px] text-slate-300 font-bold uppercase italic text-center py-4">
                  No conflicts detected in sector
                </p>
              )}
            </div>
          </div>

          {/* Warnings */}
          {isLeaveConflict && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-[9px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-3 animate-pulse">
              <FaExclamationCircle size={14} /> LEAVE CONFLICT DETECTED IN
              SESSION
            </div>
          )}
          {isConflict && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-[9px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-3">
              <FaTimesCircle size={14} /> DUPLICATE DUTY ASSIGNMENT BLOCKED
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setIsModalOpen(false)}
              variant="secondary"
              className="flex-1 rounded-xl uppercase font-black text-[10px] tracking-widest"
            >
              Abort
            </Button>
            <Button
              onClick={handleAssignDuty}
              variant="primary"
              loading={loading}
              disabled={isConflict}
              className="flex-1 rounded-xl uppercase font-black text-[10px] tracking-widest bg-slate-900"
            >
              Authorize induction
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AssignmentCard;

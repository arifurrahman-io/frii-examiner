import React, { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import {
  FaUserShield,
  FaClipboardList,
  FaEdit,
  FaSyncAlt,
  FaRegWindowClose,
  FaBook,
  FaCalendarTimes,
  FaPlus,
  FaPrint,
  FaChevronLeft,
  FaHistory,
  FaPhoneAlt,
  FaUniversity,
  FaUserTag,
  FaCalendarCheck,
  FaChartLine,
  FaQuoteLeft,
  FaSuitcase,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  getTeacherProfile,
  deleteAssignmentPermanently,
  getTeacherRoutines,
  deleteLeave,
  getGrantedLeavesByTeacher,
  deleteRoutine,
} from "../../api/apiService";

import UpdateTeacherForm from "../forms/UpdateTeacherForm";
import Button from "../ui/Button";
import GrantLeaveModal from "../modals/GrantLeaveModal";
import RoutineEntryModal from "../modals/RoutineEntryModal";
import AnnualReportModal from "../modals/AnnualReportModal";
import YearlyRoutineViewModal from "../modals/YearlyRoutineViewModal";

const TeacherProfile = ({ teacherId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const lastThreeYears = useMemo(
    () => [currentYear, currentYear - 1, currentYear - 2],
    [currentYear]
  );

  // --- States ---
  const [activeTab, setActiveTab] = useState(currentYear);
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [modals, setModals] = useState({
    leave: false,
    report: false,
    routine: false,
    yearlyView: false,
  });
  const [grantedLeaves, setGrantedLeaves] = useState([]);
  const [routineSchedule, setRoutineSchedule] = useState([]);

  const isAdmin = user?.role === "admin";
  const canManage = isAdmin || user?.role === "incharge";

  const toggleModal = (type, state) =>
    setModals((prev) => ({ ...prev, [type]: state }));

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, leavesRes, routinesRes] = await Promise.all([
        getTeacherProfile(teacherId),
        getGrantedLeavesByTeacher(teacherId),
        getTeacherRoutines(teacherId),
      ]);
      setTeacherData(profileRes.data);
      setGrantedLeaves(leavesRes.data);
      setRoutineSchedule(routinesRes.data);
    } catch (error) {
      toast.error("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const filteredAssignments = useMemo(() => {
    if (
      !teacherData?.assignmentsByYear ||
      !Array.isArray(teacherData.assignmentsByYear)
    )
      return [];
    const yearData = teacherData.assignmentsByYear.find(
      (a) => String(a._id) === String(activeTab)
    );
    return yearData && Array.isArray(yearData.responsibilities)
      ? yearData.responsibilities
      : [];
  }, [teacherData, activeTab]);

  const handleDutyDelete = async (id) => {
    if (!isAdmin) return toast.error("Only admins can remove assignments.");
    if (!window.confirm("Permanently remove this assignment?")) return;
    try {
      await deleteAssignmentPermanently(id);
      toast.success("Assignment removed.");
      fetchProfile();
    } catch {
      toast.error("Operation failed.");
    }
  };

  const handleDeleteLeave = async (leaveId) => {
    if (!window.confirm("Permanently delete this leave record?")) return;
    try {
      await deleteLeave(leaveId);
      toast.success("Leave record deleted.");
      fetchProfile();
    } catch {
      toast.error("Failed to delete leave.");
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="relative">
          <FaSyncAlt className="animate-spin text-6xl text-indigo-500" />
          <div className="absolute inset-0 blur-2xl bg-indigo-500 opacity-20"></div>
        </div>
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.5em] mt-6">
          Syncing Neural Profile
        </h2>
      </div>
    );

  if (!teacherData)
    return (
      <div className="text-center p-20 mt-20 text-red-500 font-bold uppercase">
        Profile Unavailable
      </div>
    );

  const { teacherDetails } = teacherData;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 px-4 sm:px-8">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* --- HEADER --- */}
        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(79,70,229,0.05)] border border-white flex flex-col md:flex-row justify-between items-center gap-8 mb-10 transition-all hover:shadow-indigo-100 print:shadow-none">
          <div className="flex items-center gap-8">
            <div className="relative">
              <div className="h-20 w-20 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white text-4xl font-black shadow-2xl uppercase">
                {teacherDetails.name?.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 h-5 w-5 rounded-full border-4 border-white"></div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase mb-2">
                {teacherDetails.name}
              </h1>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-indigo-100">
                  ID: {teacherDetails.teacherId}
                </span>
                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center bg-slate-100 px-3 py-1 rounded-lg">
                  <FaUserTag className="mr-2 text-indigo-500" />{" "}
                  {teacherDetails.designation}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 print:hidden">
            <Button
              onClick={() => window.print()}
              variant="secondary"
              className="rounded-xl p-4 bg-white shadow-sm border-slate-100"
            >
              <FaPrint />
            </Button>
            <Button
              onClick={() => navigate("/teachers")}
              variant="secondary"
              className="rounded-xl p-4 bg-white shadow-sm border-slate-100"
            >
              <FaChevronLeft />
            </Button>
            <div className="h-10 w-[1.5px] bg-slate-200 mx-2 hidden md:block" />
            <Button
              onClick={() => toggleModal("yearlyView", true)}
              variant="secondary"
              className="bg-white border-slate-100 text-indigo-600 font-black px-5 rounded-xl"
            >
              <FaBook className="mr-2" /> ROUTINE
            </Button>
            {canManage && (
              <>
                <Button
                  onClick={() => toggleModal("report", true)}
                  variant="primary"
                  className="bg-indigo-600 shadow-xl shadow-indigo-100 px-6 rounded-xl"
                >
                  <FaChartLine className="mr-2" /> REPORT
                </Button>
                <Button
                  onClick={() => toggleModal("leave", true)}
                  variant="warning"
                  className="bg-amber-500 shadow-xl shadow-amber-100 px-6 rounded-xl text-white border-none"
                >
                  <FaCalendarCheck className="mr-2" /> LEAVE
                </Button>
              </>
            )}
            {isAdmin && (
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className={`rounded-xl px-6 shadow-xl ${
                  isEditing
                    ? "bg-rose-500 text-white"
                    : "bg-slate-900 text-white"
                }`}
              >
                {isEditing ? (
                  <FaRegWindowClose />
                ) : (
                  <>
                    <FaEdit className="mr-2" /> MANAGE
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="animate-in zoom-in-95 duration-500">
            <UpdateTeacherForm
              teacherId={teacherId}
              onUpdateSuccess={() => {
                setIsEditing(false);
                fetchProfile();
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* --- SIDEBAR --- */}
            <div className="lg:col-span-4 space-y-10">
              {/* Intel Card */}
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-8 flex items-center">
                  <span className="h-1.5 w-10 bg-indigo-600 mr-4 rounded-full" />{" "}
                  Personal intel
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <FaPhoneAlt />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                        Contact Line
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {teacherDetails.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <FaUniversity />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                        Stationed Campus
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {teacherDetails.campus?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Timeline */}
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-10 flex items-center">
                  <span className="h-1.5 w-10 bg-indigo-600 mr-4 rounded-full" />{" "}
                  Annual Reviews
                </h3>
                {teacherDetails.reports?.length > 0 ? (
                  <div className="space-y-10 relative">
                    <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-slate-100"></div>
                    {teacherDetails.reports.map((report, idx) => (
                      <div key={idx} className="relative pl-12">
                        <div className="absolute left-0 top-1 h-[40px] w-[40px] rounded-full bg-white border-[3px] border-indigo-100 flex items-center justify-center z-10">
                          <FaQuoteLeft className="text-indigo-200 text-[10px]" />
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[11px] font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-lg">
                            Session {report.year}
                          </span>
                        </div>
                        {/* VIEW FIX: Added ResponsibilityType here */}
                        <div className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">
                            Responsibility:{" "}
                            {report.responsibility?.name || "N/A"}
                          </p>
                          <p className="text-xs text-slate-600 leading-relaxed font-semibold italic">
                            "{report.performanceReport}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-10 text-slate-300 font-black uppercase text-[10px]">
                    No Archival Reviews
                  </p>
                )}
              </div>

              {/* LEAVE HISTORY SECTION */}
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-10 flex items-center">
                  <span className="h-1.5 w-10 bg-rose-500 mr-4 rounded-full" />{" "}
                  Leave History
                </h3>
                {grantedLeaves.length > 0 ? (
                  <div className="space-y-8 relative">
                    <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-slate-100"></div>
                    {grantedLeaves.map((leave, idx) => (
                      <div key={idx} className="relative pl-12 group">
                        <div className="absolute left-0 top-1 h-[40px] w-[40px] rounded-full bg-white border-[3px] border-rose-100 flex items-center justify-center z-10 group-hover:border-rose-500 transition-all">
                          <FaSuitcase className="text-rose-200 text-xs group-hover:text-rose-500" />
                        </div>
                        <div className="p-5 bg-rose-50/30 rounded-3xl border border-rose-100/50">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-[10px] font-black text-rose-600 uppercase">
                                Year {leave.year}
                              </p>
                              <h4 className="text-xs font-black text-slate-800 uppercase mt-1">
                                {leave.responsibilityType?.name}
                              </h4>
                            </div>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteLeave(leave._id)}
                                className="text-rose-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <FaRegWindowClose size={14} />
                              </button>
                            )}
                          </div>
                          <div className="pt-2 border-t border-rose-100/50 text-[10px] font-bold text-slate-500 italic">
                            Reason: {leave.reason || "No reason specified"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-10 text-slate-300 font-black uppercase text-[10px]">
                    No leave records found
                  </p>
                )}
              </div>
            </div>

            {/* --- MAIN MATRIX --- */}
            <div className="lg:col-span-8 space-y-10">
              <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-sm border border-slate-100 min-h-[600px] relative">
                <div className="flex flex-col md:flex-row justify-between items-center mb-14 gap-8">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                      <FaClipboardList size={22} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      Responsibility Matrix
                    </h3>
                  </div>
                  <div className="flex bg-slate-100 p-2 rounded-[1.5rem]">
                    {lastThreeYears.map((year) => (
                      <button
                        key={year}
                        onClick={() => setActiveTab(year)}
                        className={`px-8 py-3 rounded-[1.2rem] text-xs font-black transition-all duration-500 ${
                          String(activeTab) === String(year)
                            ? "bg-white text-indigo-600 shadow-xl scale-110"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                  {filteredAssignments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {filteredAssignments.map((assignment, i) => (
                        <div
                          key={i}
                          className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                        >
                          <div className="flex items-center gap-6">
                            <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-indigo-500 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              <FaUserShield size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800 uppercase tracking-tighter mb-1">
                                {assignment.name}
                              </p>
                              <div className="flex gap-2">
                                <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                                  {assignment.class}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">
                                  {assignment.subject}
                                </span>
                              </div>
                            </div>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={() => handleDutyDelete(assignment._id)}
                              className="text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <FaRegWindowClose size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-40 opacity-20 font-black uppercase text-sm tracking-widest">
                      No entries for {activeTab}
                    </div>
                  )}
                </div>
              </div>

              {/* Routine Panel */}
              <div className="bg-slate-900 p-12 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative shadow-2xl">
                <div className="relative z-10">
                  <h3 className="text-3xl font-black uppercase leading-none mb-3 tracking-tight">
                    Academic Routine
                  </h3>
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em]">
                    Official Institutional Schedule
                  </p>
                </div>
                <div className="flex gap-5 relative z-10">
                  <Button
                    onClick={() => toggleModal("yearlyView", true)}
                    className="bg-white/10 hover:bg-white/20 border-white/10 text-white rounded-2xl font-black px-10 py-4"
                  >
                    ARCHIVE
                  </Button>
                  {canManage && (
                    <Button
                      onClick={() => toggleModal("routine", true)}
                      className="bg-indigo-600 hover:bg-indigo-700 shadow-xl rounded-2xl font-black px-10 py-4"
                    >
                      <FaPlus className="mr-3" /> INITIALIZE
                    </Button>
                  )}
                </div>
                <FaBook className="absolute -bottom-10 -right-10 text-white/[0.03] text-[15rem] transform -rotate-12" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      <AnnualReportModal
        isOpen={modals.report}
        onClose={() => toggleModal("report", false)}
        teacherId={teacherId}
        onSuccess={fetchProfile}
      />
      <YearlyRoutineViewModal
        isOpen={modals.yearlyView}
        onClose={() => toggleModal("yearlyView", false)}
        routines={routineSchedule}
      />
      <GrantLeaveModal
        teacher={teacherDetails}
        isOpen={modals.leave}
        onClose={() => toggleModal("leave", false)}
        onLeaveGrant={fetchProfile}
      />
      <RoutineEntryModal
        isOpen={modals.routine}
        onClose={() => toggleModal("routine", false)}
        onSaveSuccess={fetchProfile}
        teacherIdForNewEntry={teacherDetails?._id}
      />
    </div>
  );
};

export default TeacherProfile;

import React, { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import {
  FaUserShield,
  FaClipboardList,
  FaEdit,
  FaSyncAlt,
  FaRegWindowClose,
  FaBook,
  FaPlus,
  FaPrint,
  FaChevronLeft,
  FaPhoneAlt,
  FaUniversity,
  FaUserTag,
  FaCalendarCheck,
  FaChartLine,
  FaQuoteLeft,
  FaTrashAlt,
  FaHistory,
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

  const dynamicYears = useMemo(() => {
    const years = [];
    for (let y = currentYear; y >= 2024; y--) years.push(y);
    return years;
  }, [currentYear]);

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
  const isIncharge = user?.role === "incharge";
  const canManageRoutine = isAdmin || isIncharge;

  // --- 🛠️ UNIQUE ROUTINE LOGIC (Filters out duplicates for both Screen & Print) ---
  const uniqueRoutineSchedule = useMemo(() => {
    const seen = new Set();
    return routineSchedule.filter((item) => {
      const key = `${item.year}-${item.display.toLowerCase().trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [routineSchedule]);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const promises = [
        getTeacherProfile(teacherId),
        getTeacherRoutines(teacherId),
      ];
      if (isAdmin || isIncharge)
        promises.push(getGrantedLeavesByTeacher(teacherId));
      const [profileRes, routinesRes, leavesRes] = await Promise.all(promises);
      setTeacherData(profileRes.data);
      setRoutineSchedule(routinesRes.data || []);
      if (leavesRes) setGrantedLeaves(leavesRes.data || []);
    } catch (error) {
      toast.error("Buffer Sync Fail.");
    } finally {
      setLoading(false);
    }
  }, [teacherId, isAdmin, isIncharge]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const toggleModal = (type, state) =>
    setModals((prev) => ({ ...prev, [type]: state }));

  const filteredAssignments = useMemo(() => {
    if (!teacherData?.assignmentsByYear) return [];
    const yearData = teacherData.assignmentsByYear.find(
      (a) => String(a._id) === String(activeTab)
    );
    return yearData?.responsibilities || [];
  }, [teacherData, activeTab]);

  const handleAssignmentDelete = async (id) => {
    if (!isAdmin) return toast.error("Admin only action.");
    if (!window.confirm("Purge assignment?")) return;
    try {
      await deleteAssignmentPermanently(id);
      toast.success("Purged.");
      fetchProfile();
    } catch {
      toast.error("Fail.");
    }
  };

  const handleRoutineDelete = async (id) => {
    if (!window.confirm("Remove routine?")) return;
    try {
      await deleteRoutine(id);
      toast.success("Deleted.");
      fetchProfile();
    } catch {
      toast.error("Fail.");
    }
  };

  const handleLeaveDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete leave?")) return;
    try {
      await deleteLeave(id);
      toast.success("Removed.");
      fetchProfile();
    } catch {
      toast.error("Error.");
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <FaSyncAlt className="animate-spin text-5xl text-indigo-500" />
      </div>
    );
  if (!teacherData) return null;
  const { teacherDetails } = teacherData;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 px-4 sm:px-8 pt-10 print:pt-0">
      <style>
        {`
          @media print {
            @page { 
              size: A4 portrait; 
              margin: 15mm 15mm 20mm 15mm; 
            }
            body { 
              background: white !important; 
              margin: 0 !important; 
              padding: 0 !important; 
              -webkit-print-color-adjust: exact; 
            }
            .screen-layout, nav, .fixed, button, .no-print { display: none !important; }
            
            .print-container { 
              display: block !important; 
              width: 100% !important;
              position: absolute;
              top: 0;
              left: 0;
            }

            .print-header { 
              border-bottom: 2px solid #000; 
              padding-bottom: 10px; 
              margin-bottom: 25px; 
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            
            .print-section { 
              margin-bottom: 25px; 
              width: 100%; 
              page-break-inside: avoid;
            }
            
            table { 
              width: 100% !important; 
              border-collapse: collapse !important; 
              table-layout: fixed; 
              margin-top: 5px;
              border: 1px solid #000 !important;
            }
            th { 
              background-color: #d9d2e9 !important; 
              font-weight: 900; 
              text-transform: uppercase; 
              font-size: 10px; 
              border: 1px solid #000 !important; 
              padding: 8px 12px; 
              text-align: left !important;
            }
            td { 
              border: 1px solid #000 !important; 
              padding: 8px 12px; 
              font-size: 10px; 
              text-align: left !important;
              word-wrap: break-word; 
              vertical-align: top;
            }

            .print-footer {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              font-size: 8px;
              color: #000;
              border-top: 1px solid #000;
              padding-top: 5px;
              display: flex !important;
              justify-content: space-between;
              width: 100%;
            }
            .page-number::after { content: counter(page); }
          }
          .print-container { display: none; }
        `}
      </style>

      {/* --- 📄 PDF LAYOUT --- */}
      <div className="print-container">
        <div className="print-header">
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase">
              {teacherDetails.name}
            </h1>
            <p className="text-[10px] font-bold text-slate-700 tracking-widest uppercase">
              {teacherDetails.designation} | ID: {teacherDetails.teacherId}
            </p>
            <p className="text-[9px] text-slate-600 font-bold mt-1 uppercase">
              CAMPUS:{" "}
              <span className="text-blue-600">
                {teacherDetails.campus?.name}
              </span>{" "}
              | PHONE:{" "}
              <span className="text-blue-600">{teacherDetails.phone}</span>
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-black text-slate-900 uppercase">
              Teacher's Exam Duty Report
            </h2>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
              Confidential Record
            </p>
          </div>
        </div>

        {/* ১. রেসপন্সিবিলিটি আর্কাইভ */}
        <div className="print-section">
          <h3 className="text-[9px] font-black bg-slate-100 border border-black px-2 py-1 inline-block mb-2 uppercase tracking-widest">
            1. Responsibility Archive
          </h3>
          <table>
            <thead>
              <tr>
                <th style={{ width: "12%" }}>Session</th> {/* প্রস্থ ১২% */}
                <th style={{ width: "38%" }}>Duty Title</th>
                <th style={{ width: "25%" }}>Class</th>
                <th style={{ width: "25%" }}>Subject</th>
              </tr>
            </thead>
            <tbody>
              {teacherData.assignmentsByYear?.map((year) =>
                year.responsibilities.map((res, idx) => (
                  <tr key={`${year._id}-${idx}`}>
                    <td className="font-bold">{idx === 0 ? year._id : ""}</td>
                    <td className="uppercase font-semibold">{res.name}</td>
                    <td>{res.class}</td>
                    <td>{res.subject}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ২. লিভ ও পারফরম্যান্স গ্রিড */}
        <div className="print-section">
          <div>
            <h3 className="text-[9px] font-black bg-slate-100 border border-black px-2 py-1 inline-block mb-2 uppercase tracking-widest">
              2. Leave Records
            </h3>
            <table>
              <thead>
                <tr>
                  <th style={{ width: "12%" }}>Year</th>{" "}
                  {/* গ্রিডের কারণে ১২% * ২ = ২৪% */}
                  <th style={{ width: "88%" }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {grantedLeaves.map((leave) => (
                  <tr key={leave._id}>
                    <td className="font-bold">{leave.year}</td>
                    <td className="italic">{leave.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-[9px] font-black bg-slate-100 border border-black px-2 py-1 inline-block mb-2 uppercase tracking-widest">
              3. Performance Review
            </h3>
            <table>
              <thead>
                <tr>
                  <th style={{ width: "12%" }}>Year</th>{" "}
                  {/* গ্রিডের কারণে ১২% * ২ = ২৪% */}
                  <th style={{ width: "88%" }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {teacherDetails.reports?.map((report, idx) => (
                  <tr key={idx}>
                    <td className="font-bold">{report.year}</td>
                    <td className="italic">"{report.performanceReport}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ৩. একাডেমিক রুটিন */}
        <div className="print-section">
          <h3 className="text-[9px] font-black bg-slate-100 border border-black px-2 py-1 inline-block mb-2 uppercase tracking-widest">
            4. Academic Routine
          </h3>
          <table>
            <thead>
              <tr>
                <th style={{ width: "12%" }}>Year</th>
                <th style={{ width: "88%" }}>Routine (Class & Subject)</th>
              </tr>
            </thead>
            <tbody>
              {uniqueRoutineSchedule.map((item, i) => (
                <tr key={i}>
                  <td className="font-bold">{item.year}</td>
                  <td className="uppercase font-semibold">{item.display}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* সিগনেচার এরিয়া */}
        <div className="mt-20 flex justify-between px-10">
          <div className="text-center border-t border-black pt-1 w-44 text-[8px] font-black uppercase">
            Incharge
          </div>
          <div className="text-center border-t border-black pt-1 w-44 text-[8px] font-black uppercase">
            Headmaster
          </div>
        </div>

        {/* প্রফেশনাল ফুটার */}
        <div className="print-footer">
          <div>
            Printed: {new Date().toLocaleDateString()} |{" "}
            {new Date().toLocaleTimeString()}
          </div>
          <div className="page-number">Page </div>
        </div>
      </div>

      {/* --- 🖥️ ORIGINAL SCREEN LAYOUT --- */}
      <div className="screen-layout max-w-[1600px] mx-auto relative z-10">
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-sm border border-white flex flex-col md:flex-row justify-between items-center gap-6 mb-10 transition-all">
          <div className="flex items-center gap-8">
            <div className="h-20 w-20 rounded-[2rem] bg-slate-900 flex items-center justify-center text-white text-4xl font-black shadow-2xl uppercase">
              {teacherDetails.name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase mb-2">
                {teacherDetails.name}
              </h1>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">
                  ID: {teacherDetails.teacherId}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-widest">
                  {teacherDetails.designation}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate("/teachers")}
              variant="secondary"
              className="rounded-xl p-4 bg-white"
            >
              <FaChevronLeft />
            </Button>
            <Button
              onClick={() => window.print()}
              variant="secondary"
              className="rounded-xl px-5 bg-white border-slate-200 text-indigo-600 font-black text-xs"
            >
              <FaPrint className="mr-2" /> PRINT REPORT
            </Button>
            <Button
              onClick={() => toggleModal("report", true)}
              variant="primary"
              className="bg-indigo-600 shadow-lg px-6 rounded-xl font-black uppercase text-[10px] tracking-widest"
            >
              <FaChartLine className="mr-2" /> Report
            </Button>
            {isAdmin && (
              <>
                <Button
                  onClick={() => toggleModal("leave", true)}
                  variant="warning"
                  className="bg-amber-500 text-white shadow-lg px-6 rounded-xl font-black uppercase text-[10px] tracking-widest border-none"
                >
                  <FaCalendarCheck className="mr-2" /> Leave
                </Button>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`rounded-xl px-6 shadow-xl font-black uppercase text-[10px] tracking-widest ${
                    isEditing
                      ? "bg-rose-500 text-white"
                      : "bg-slate-900 text-white"
                  }`}
                >
                  {isEditing ? (
                    <FaRegWindowClose />
                  ) : (
                    <>
                      <FaEdit className="mr-2" /> Manage
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {!isEditing && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sidebar Historial Data */}
            <div className="lg:col-span-4 space-y-10">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center">
                  <span className="h-1 w-8 bg-indigo-600 mr-3 rounded-full" />{" "}
                  Personal Intel
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                    <FaPhoneAlt className="text-indigo-400" />
                    <p className="text-xs font-bold text-slate-700">
                      {teacherDetails.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                    <FaUniversity className="text-indigo-400" />
                    <p className="text-xs font-bold text-slate-700">
                      {teacherDetails.campus?.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em] mb-6 flex items-center">
                  <span className="h-1 w-8 bg-rose-500 mr-3 rounded-full" />{" "}
                  Leave History
                </h3>
                <div className="space-y-4">
                  {grantedLeaves.length > 0 ? (
                    grantedLeaves.map((leave) => (
                      <div
                        key={leave._id}
                        className="p-4 bg-rose-50/40 border border-rose-100 rounded-2xl relative group"
                      >
                        <p className="text-[9px] font-black text-rose-600">
                          Session {leave.year}
                        </p>
                        <p className="text-[10px] font-bold text-slate-700">
                          {leave.reason}
                        </p>
                        {isAdmin && (
                          <button
                            onClick={() => handleLeaveDelete(leave._id)}
                            className="absolute top-3 right-3 text-rose-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <FaTrashAlt size={12} />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-[10px] font-black text-slate-200">
                      No Records
                    </p>
                  )}
                </div>
              </div>

              {/* ✅ REPORT HISTORY RESTORED IN SCREEN VIEW */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-6 flex items-center">
                  <span className="h-1 w-8 bg-emerald-500 mr-3 rounded-full" />{" "}
                  Performance Reviews
                </h3>
                <div className="space-y-6">
                  {teacherDetails.reports?.length > 0 ? (
                    teacherDetails.reports.map((report, idx) => (
                      <div
                        key={idx}
                        className="pl-6 border-l-2 border-emerald-100 relative"
                      >
                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-emerald-500 border-4 border-white"></div>
                        <span className="text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                          Session {report.year}
                        </span>
                        <div className="mt-3 p-4 bg-slate-50 rounded-2xl">
                          <p className="text-[11px] text-slate-600 font-semibold italic">
                            "{report.performanceReport}"
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-6 text-[10px] font-black text-slate-300 uppercase">
                      No reviews yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Main Sections */}
            <div className="lg:col-span-8 space-y-10">
              <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-12">
                  <h3 className="text-xl font-black text-slate-900 uppercase">
                    Responsibility Matrix
                  </h3>
                  <div className="flex bg-slate-100 p-1 rounded-2xl">
                    {dynamicYears.slice(0, 4).map((year) => (
                      <button
                        key={year}
                        onClick={() => setActiveTab(year)}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${
                          activeTab === year
                            ? "bg-white text-indigo-600 shadow-md"
                            : "text-slate-400"
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredAssignments.map((assignment, i) => (
                    <div
                      key={i}
                      className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-4 relative group"
                    >
                      <FaUserShield className="text-indigo-500" size={24} />
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase">
                          {assignment.name}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400">
                          {assignment.class} | {assignment.subject}
                        </p>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => handleAssignmentDelete(assignment._id)}
                          className="absolute top-4 right-4 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black text-slate-900 uppercase">
                    Current Routine
                  </h3>
                  {canManageRoutine && (
                    <button
                      onClick={() => toggleModal("routine", true)}
                      className="bg-indigo-600 text-white p-3 rounded-xl hover:scale-105 transition-all"
                    >
                      <FaPlus />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {uniqueRoutineSchedule
                    .filter((r) => r.year === currentYear)
                    .map((item, i) => (
                      <div
                        key={i}
                        className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <FaHistory className="text-indigo-500" />
                          <p className="text-xs font-bold text-slate-700">
                            {item.display}
                          </p>
                        </div>
                        {canManageRoutine && (
                          <button
                            onClick={() => handleRoutineDelete(item._id)}
                            className="text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <FaTrashAlt />
                          </button>
                        )}
                      </div>
                    ))}
                </div>
                <div className="mt-8 pt-8 border-t border-slate-50 flex justify-center">
                  <button
                    onClick={() => toggleModal("yearlyView", true)}
                    className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                  >
                    <FaHistory /> View Archive
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isEditing && (
          <UpdateTeacherForm
            teacherId={teacherId}
            onUpdateSuccess={() => {
              setIsEditing(false);
              fetchProfile();
            }}
          />
        )}
      </div>

      {/* MODALS */}
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

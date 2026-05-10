import React, { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { FaSyncAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getTeacherProfile,
  getTeacherRoutines,
  getGrantedLeavesByTeacher,
  deleteAssignmentPermanently,
  deleteRoutine,
  deleteLeave,
  deleteTeacher,
  deletePerformanceReport,
} from "../../api/apiService";

// UI/Sections
import ProfileHeader from "./../sections/ProfileHeader";
import ProfileSidebar from "./../sections/ProfileSidebar";
import ProfileMainMatrix from "./../sections/ProfileMainMatrix";
import DeleteConfirmModal from "./../modals/DeleteConfirmModal";
import UpdateTeacherForm from "../forms/UpdateTeacherForm";

// Modals
import GrantLeaveModal from "../modals/GrantLeaveModal";
import RoutineEntryModal from "../modals/RoutineEntryModal";
import AnnualReportModal from "../modals/AnnualReportModal";
import YearlyRoutineViewModal from "../modals/YearlyRoutineViewModal";

const TeacherProfile = ({ teacherId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const [activeTab, setActiveTab] = useState(currentYear);
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  // --- 🛠️ Logic Helpers ---
  const dynamicYears = useMemo(() => {
    const years = [];
    for (let y = currentYear; y >= 2024; y--) years.push(y);
    return years;
  }, [currentYear]);

  const uniqueRoutineSchedule = useMemo(() => {
    const seen = new Set();
    return routineSchedule.filter((item) => {
      const key = `${item.year}-${item.display?.toLowerCase().trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [routineSchedule]);

  const filteredAssignments = useMemo(() => {
    if (!teacherData?.assignmentsByYear) return [];
    const yearData = teacherData.assignmentsByYear.find(
      (a) => String(a._id) === String(activeTab)
    );
    return yearData?.responsibilities || [];
  }, [teacherData, activeTab]);

  // --- 🛠️ Handlers ---
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
      toast.error("Protocol Error: Synchronization failed.");
    } finally {
      setLoading(false);
    }
  }, [teacherId, isAdmin, isIncharge]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleTeacherDelete = async () => {
    setLoading(true);
    try {
      await deleteTeacher(teacherId);
      toast.success("Node Terminated.");
      navigate("/teachers");
    } catch (error) {
      toast.error("Purge Failed.");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAssignmentDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Purge assignment?")) return;
    try {
      await deleteAssignmentPermanently(id);
      toast.success("Purged.");
      fetchProfile();
    } catch {
      toast.error("Error.");
    }
  };

  const handleReportDelete = async (reportId) => {
    if (!isAdmin) return toast.error("Admin credentials required.");
    if (!window.confirm("Purge this performance record?")) return;
    try {
      await deletePerformanceReport(teacherId, reportId);
      toast.success("Node Purged.");
      fetchProfile();
    } catch (error) {
      toast.error("Purge failed.");
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

  if (loading && !teacherData)
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <FaSyncAlt className="animate-spin text-5xl text-indigo-500 mb-4" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">
          Syncing Profile
        </p>
      </div>
    );

  if (!teacherData) return null;
  const { teacherDetails } = teacherData;
  const totalAssignments =
    teacherData.assignmentsByYear?.reduce(
      (total, year) => total + (year.responsibilities?.length || 0),
      0
    ) || 0;
  const profileStats = {
    currentAssignments: filteredAssignments.length,
    totalAssignments,
    currentRoutine:
      uniqueRoutineSchedule.filter((item) => item.year === currentYear)
        .length || 0,
    leaves: grantedLeaves.length,
    reports: teacherDetails.reports?.length || 0,
  };

  return (
    <div className="min-h-screen bg-transparent px-4 pb-10 pt-6 sm:px-6 sm:pt-8 lg:px-8 print:bg-white print:pt-0">

      <style>
        {`
            @media print {
              @page { 
                size: A4 portrait; 
                margin: 5mm; /* পেজ লেভেলের মার্জিন কমিয়ে ৫ মিমি করা হয়েছে */
              }
              body { 
                background: white !important; 
                margin: 0 !important; 
                padding: 0 !important;
              }
              .no-print { display: none !important; }
              
              /* --- প্রিন্ট কন্টেইনার ফিক্স --- */
              .print-container { 
                display: block !important; 
                width: 100% !important; 
                padding-top: 0 !important; /* টপ প্যাডিং সম্পূর্ণ রিমুভ করা হয়েছে */
                margin-top: -5px !important; /* নেগেটিভ মার্জিন দিয়ে টাইটেলকে আরও উপরে তোলা হয়েছে */
              }
              
              /* --- রিপোর্ট টাইটেল সেকশন (ছবি অনুযায়ী) --- */
              .report-title { 
                border-bottom: 2px solid #1e293b; 
                padding-bottom: 10px; 
                margin-bottom: 15px; 
                display: flex; 
                justify-content: space-between; 
                align-items: flex-start;
              }

              .section-header { 
                background: #f1f5f9 !important; 
                border-left: 4px solid #4f46e5; 
                padding: 5px 10px; 
                margin: 15px 0 8px 0; 
                font-size: 10px; 
                font-weight: 900; 
                text-transform: uppercase; 
              }
              
              table { width: 100% !important; border-collapse: collapse !important; margin-bottom: 15px; }
              th { background-color: #f8fafc !important; border: 1px solid #cbd5e1 !important; padding: 6px; font-size: 9px; text-align: left; text-transform: uppercase; }
              td { border: 1px solid #e2e8f0 !important; padding: 6px; font-size: 9px; vertical-align: top; }
              
              .print-footer { 
                position: fixed; 
                bottom: 0; 
                left: 0; 
                right: 0; 
                display: flex; 
                justify-content: space-between; 
                border-top: 1px solid #e2e8f0; 
                padding-top: 5px; 
                background: white !important; 
              }
            }
            .print-container { display: none; }
          `}
      </style>

      {/* --- প্রিন্ট টেমপ্লেট --- */}
      <div className="print-container">
        <div className="report-title">
          <div>
            <h1 className="text-2xl font-black uppercase text-slate-900 leading-tight">
              {teacherDetails.name}
            </h1>
            <p className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-widest">
              | ID: {teacherDetails.teacherId}
            </p>
            <p className="text-[9px] text-indigo-600 font-bold mt-1 uppercase">
              CAMPUS: {teacherDetails.campus?.name} | PHONE:{" "}
              {teacherDetails.phone}
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-black text-slate-900 uppercase">
              Teacher's Duty Report
            </h2>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
              Institutional Governance Matrix
            </p>
          </div>
        </div>

        {/* সেকশন ১: দায়িত্বের রেকর্ড */}
        <div className="section-header">1. Responsibility Records Archive</div>
        <table>
          <thead>
            <tr>
              <th style={{ width: "12%" }}>Session</th>
              <th style={{ width: "38%" }}>Title</th>
              <th style={{ width: "25%" }}>Class</th>
              <th style={{ width: "25%" }}>Subject</th>
            </tr>
          </thead>
          <tbody>
            {teacherData.assignmentsByYear?.map((year) =>
              year.responsibilities.map((res, idx) => (
                <tr key={`${year._id}-${idx}`}>
                  <td>{idx === 0 ? year._id : ""}</td>
                  <td className="font-bold">{res.name}</td>
                  <td>{res.class}</td>
                  <td>{res.subject}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* সেকশন ২: লিভ হিস্ট্রি */}
        <div className="section-header">2. Leave History Archive</div>
        <table>
          <thead>
            <tr>
              <th style={{ width: "12%" }}>Year</th>
              <th>Leave Reason / Narrative</th>
            </tr>
          </thead>
          <tbody>
            {grantedLeaves.length > 0 ? (
              grantedLeaves.map((leave) => (
                <tr key={leave._id}>
                  <td>{leave.year}</td>
                  <td className="italic">{leave.reason}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center text-slate-300 italic">
                  No leave nodes indexed
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* সেকশন ৩: পারফরম্যান্স রিপোর্ট */}
        <div className="section-header">3. Performance Appraisal Logs</div>
        <table>
          <thead>
            <tr>
              <th style={{ width: "12%" }}>Year</th>
              <th>Review Detail</th>
            </tr>
          </thead>
          <tbody>
            {teacherDetails.reports?.length > 0 ? (
              teacherDetails.reports.map((r, i) => (
                <tr key={i}>
                  <td>{r.year}</td>
                  <td className="italic">"{r.performanceReport}"</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center text-slate-300 italic">
                  No performance data found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* সেকশন ৪: একাডেমিক রুটিন */}
        <div className="section-header">4. Academic Schedule Matrix</div>
        <table>
          <thead>
            <tr>
              <th style={{ width: "12%" }}>Year</th>
              <th>Routine Configuration</th>
            </tr>
          </thead>
          <tbody>
            {uniqueRoutineSchedule.map((item, i) => (
              <tr key={i}>
                <td>{item.year}</td>
                <td className="font-bold uppercase tracking-tighter">
                  {item.display}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="print-footer">
          <p className="text-[7px] font-black uppercase text-slate-400">
            Timestamp: {new Date().toLocaleString()}
          </p>
          <p className="text-[7px] font-black uppercase text-slate-900 tracking-widest">
            Official Document
          </p>
        </div>
      </div>

      {/* --- 🖥️ স্ক্রিন লেআউট (ফুল রেসপন্সিভ) --- */}
      <div className="screen-layout mx-auto max-w-[1440px] animate-in fade-in duration-700">
        <ProfileHeader
          teacherDetails={teacherDetails}
          stats={profileStats}
          isAdmin={isAdmin}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          navigate={navigate}
          toggleModal={(t, s) => setModals((p) => ({ ...p, [t]: s }))}
          setShowDeleteConfirm={setShowDeleteConfirm}
        />

        {!isEditing ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="order-1">
              <ProfileMainMatrix
                dynamicYears={dynamicYears}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                filteredAssignments={filteredAssignments}
                isAdmin={isAdmin}
                handleAssignmentDelete={handleAssignmentDelete}
                currentYear={currentYear}
                uniqueRoutineSchedule={uniqueRoutineSchedule}
                canManageRoutine={canManageRoutine}
                toggleModal={(t, s) => setModals((p) => ({ ...p, [t]: s }))}
                handleRoutineDelete={handleRoutineDelete}
              />
            </div>
            <div className="order-2">
              <ProfileSidebar
                teacherDetails={teacherDetails}
                grantedLeaves={grantedLeaves}
                isAdmin={isAdmin}
                handleLeaveDelete={handleLeaveDelete}
                handleReportDelete={handleReportDelete}
              />
            </div>
          </div>
        ) : (
          <div className="border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <UpdateTeacherForm
              teacherId={teacherId}
              onUpdateSuccess={() => {
                setIsEditing(false);
                fetchProfile();
              }}
            />
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        teacherName={teacherDetails.name}
        onConfirm={handleTeacherDelete}
        loading={loading}
      />
      <AnnualReportModal
        isOpen={modals.report}
        onClose={() => setModals((p) => ({ ...p, report: false }))}
        teacherId={teacherId}
        onSuccess={fetchProfile}
      />
      <YearlyRoutineViewModal
        isOpen={modals.yearlyView}
        onClose={() => setModals((p) => ({ ...p, yearlyView: false }))}
        routines={routineSchedule}
      />
      <GrantLeaveModal
        teacher={teacherDetails}
        isOpen={modals.leave}
        onClose={() => setModals((p) => ({ ...p, leave: false }))}
        onLeaveGrant={fetchProfile}
      />
      <RoutineEntryModal
        isOpen={modals.routine}
        onClose={() => setModals((p) => ({ ...p, routine: false }))}
        onSaveSuccess={fetchProfile}
        teacherIdForNewEntry={teacherDetails?._id}
      />
    </div>
  );
};

export default TeacherProfile;

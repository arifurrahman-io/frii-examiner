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

  // --- 🛠️ 1. Hooks (Top Level) ---

  const dynamicYears = useMemo(() => {
    const years = [];
    for (let y = currentYear; y >= 2024; y--) years.push(y);
    return years;
  }, [currentYear]);

  const uniqueRoutineSchedule = useMemo(() => {
    const seen = new Set();
    return routineSchedule.filter((item) => {
      const key = `${item.year}-${item.display.toLowerCase().trim()}`;
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

  // --- 🛠️ 2. Handlers ---

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

  const handleTeacherDelete = async () => {
    setLoading(true);
    try {
      await deleteTeacher(teacherId);
      toast.success("Teacher Node Purged.");
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
      toast.error("Fail.");
    }
  };

  const handleReportDelete = async (reportId) => {
    if (!isAdmin) return toast.error("Admin authorization required.");

    if (!window.confirm("CRITICAL: Purge this performance record?")) return;

    try {
      // এখানে teacherId (প্রপস থেকে) এবং reportId দুটোই পাঠাতে হবে
      await deletePerformanceReport(teacherId, reportId);
      toast.success("Sync Complete: Node Purged.");
      fetchProfile(); // ডাটা রিফ্রেশ করুন
    } catch (error) {
      console.error("Purge Error:", error);
      // ব্যাকএন্ড থেকে আসা প্রকৃত এরর মেসেজ দেখাবে
      toast.error(
        error.response?.data?.message ||
          "Purge execution failed: Matrix Link Interrupted."
      );
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
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <FaSyncAlt className="animate-spin text-5xl text-indigo-500" />
      </div>
    );

  if (!teacherData) return null;
  const { teacherDetails } = teacherData;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 px-4 sm:px-8 pt-10 print:pt-0 print:bg-white">
      {/* 🛠️ ১. মডার্ন প্রিন্ট ইঞ্জিন (CSS) */}
      <style>
        {`
          @media print {
            @page { 
               size: A4 portrait; 
               margin: 5mm 5mm 15mm 5mm; /* উপরের মার্জিন কমিয়ে ৫ মিমি করা হয়েছে */
            }
            body { 
               background: white !important; 
               -webkit-print-color-adjust: exact; 
               counter-reset: page; 
               margin: 0 !important;
               padding: 0 !important;
            }
            .screen-layout, .no-print, nav, button, .fixed { display: none !important; }
            .print-container { 
               display: block !important; 
               width: 100% !important; 
               position: relative;
               padding-top: 0 !important; /* টপ প্যাডিং জিরো */
            }
            
            .report-title { 
               border-bottom: 2px solid #1e293b; 
               padding-bottom: 10px; 
               margin-bottom: 15px; /* টাইটেল মার্জিন কমানো হয়েছে */
               display: flex; 
               justify-content: space-between; 
            }
            .section-header { 
               background: #f1f5f9 !important; 
               padding: 5px 10px; 
               border-left: 4px solid #4f46e5; 
               margin: 15px 0 8px 0; 
               font-size: 10px; 
               font-weight: 900; 
               text-transform: uppercase; 
            }
            
            table { width: 100% !important; border-collapse: collapse !important; margin-bottom: 12px; table-layout: fixed; }
            th { background-color: #f8fafc !important; border: 1px solid #cbd5e1 !important; padding: 6px; font-size: 9px; text-align: left; text-transform: uppercase; }
            td { border: 1px solid #e2e8f0 !important; padding: 6px; font-size: 9px; vertical-align: top; word-wrap: break-word; }
            
            .signature-box { margin-top: 40px; display: flex; justify-content: space-between; padding: 0 40px; page-break-inside: avoid; }
            .sig-line { border-top: 1px solid #000; width: 140px; text-align: center; font-size: 8px; font-weight: bold; padding-top: 4px; text-transform: uppercase; }

            .print-footer {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 1px solid #e2e8f0;
              padding-top: 6px;
              background: white !important;
            }
            .page-number::after {
              counter-increment: page;
              content: "Page " counter(page);
            }
          }
          .print-container { display: none; }
        `}
      </style>

      {/* 📄 ২. প্রোফেশনাল পিডিএফ লেআউট */}
      <div className="print-container">
        <div className="report-title">
          <div>
            <h1 className="text-2xl font-black uppercase text-slate-900 leading-none">
              {teacherDetails.name}
            </h1>
            <p className="text-[10px] font-bold text-slate-600 mt-2 uppercase tracking-widest">
              {teacherDetails.designation} | ID: {teacherDetails.teacherId}
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
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Institutional Governance Data
            </p>
          </div>
        </div>

        <div className="section-header">1. Responsibility Records Archive</div>
        <table>
          <thead>
            <tr>
              <th style={{ width: "10%" }}>Session</th>
              <th style={{ width: "36%" }}>Title</th>
              <th style={{ width: "27%" }}>Class</th>
              <th style={{ width: "27%" }}>Subject</th>
            </tr>
          </thead>
          <tbody>
            {teacherData.assignmentsByYear?.map((year) =>
              year.responsibilities.map((res, idx) => (
                <tr key={`${year._id}-${idx}`}>
                  <td style={{ width: "10%" }}>{idx === 0 ? year._id : ""}</td>
                  <td className="font-bold">{res.name}</td>
                  <td>{res.class}</td>
                  <td>{res.subject}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="section-header">2. Leave History</div>
        <table>
          <thead>
            <tr>
              <th style={{ width: "10%" }}>Year</th>
              <th>Description</th>
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

        <div className="section-header">3. Performance Report</div>
        <table>
          <thead>
            <tr>
              <th style={{ width: "10%" }}>Year</th>
              <th>Report Detail</th>
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
                  Pending
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="section-header">4. Academic Schedule Matrix</div>
        <table>
          <thead>
            <tr>
              <th style={{ width: "10%" }}>Year</th>
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

        <div className="signature-box">
          <div className="sig-line">Incharge</div>
          <div className="sig-line">Headmaster</div>
        </div>

        {/* ✅ Dynamic Print Footer */}
        <div className="print-footer hidden print:flex">
          <p className="text-[7px] font-black uppercase text-slate-500">
            SYNC: {new Date().toLocaleString()}
          </p>
          <div className="text-[7px] font-black uppercase tracking-widest text-slate-900 flex gap-4">
            <span className="page-number"></span>{" "}
            {/* এখানে "Page 1" জেনারেট হবে */}
            <span>•</span>
            <span>NEURAL MATRIX V2.5</span>
          </div>
        </div>
      </div>

      {/* --- 🖥️ স্ক্রিন লেআউট --- */}
      <div className="screen-layout max-w-[1600px] mx-auto relative z-10">
        <ProfileHeader
          teacherDetails={teacherDetails}
          isAdmin={isAdmin}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          navigate={navigate}
          toggleModal={(t, s) => setModals((p) => ({ ...p, [t]: s }))}
          setShowDeleteConfirm={setShowDeleteConfirm}
        />

        {!isEditing ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <ProfileSidebar
              teacherDetails={teacherDetails}
              grantedLeaves={grantedLeaves}
              isAdmin={isAdmin}
              handleLeaveDelete={handleLeaveDelete}
              handleReportDelete={handleReportDelete}
            />
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
        ) : (
          <UpdateTeacherForm
            teacherId={teacherId}
            onUpdateSuccess={() => {
              setIsEditing(false);
              fetchProfile();
            }}
          />
        )}
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        teacherName={teacherDetails.name}
        onConfirm={handleTeacherDelete}
        loading={loading}
      />

      {/* Modals are the same... */}
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

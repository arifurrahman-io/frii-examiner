import React from "react";
import {
  FaChevronLeft,
  FaPrint,
  FaChartLine,
  FaCalendarCheck,
  FaTrashAlt,
  FaEdit,
  FaRegWindowClose,
} from "react-icons/fa";
import Button from "../ui/Button";

const ProfileHeader = ({
  teacherDetails,
  isAdmin,
  isEditing,
  setIsEditing,
  navigate,
  toggleModal,
  setShowDeleteConfirm,
}) => (
  <div className="bg-white/80 backdrop-blur-xl p-5 sm:p-8 rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-white flex flex-col lg:flex-row justify-between items-center gap-6 mb-8 sm:mb-10 transition-all no-print">
    {/* --- LEFT: Profile Intel --- */}
    <div className="flex flex-col sm:row items-center gap-4 sm:gap-8 w-full lg:w-auto text-center sm:text-left">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase mb-2 truncate max-w-[250px] sm:max-w-none">
          {teacherDetails.name}
        </h1>
        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
          <span className="px-3 py-1 bg-indigo-600 text-white text-[8px] sm:text-[10px] font-black rounded-lg uppercase tracking-widest">
            ID: {teacherDetails.teacherId}
          </span>
          <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[8px] sm:text-[10px] font-black rounded-lg uppercase tracking-widest truncate">
            {teacherDetails.designation}
          </span>
        </div>
      </div>
    </div>

    {/* --- RIGHT: Action Matrix --- */}
    <div className="flex flex-wrap justify-center lg:justify-end gap-2 sm:gap-3 w-full lg:w-auto">
      {/* Back Button (Always visible) */}
      <Button
        onClick={() => navigate("/teachers")}
        variant="secondary"
        className="rounded-xl p-3 sm:p-4 bg-white border-slate-100 text-slate-400 hover:text-indigo-600 shadow-sm"
        title="Go Back"
      >
        <FaChevronLeft size={14} />
      </Button>

      {/* Print Button */}
      <Button
        onClick={() => window.print()}
        variant="secondary"
        className="rounded-xl px-4 sm:px-5 py-3 sm:py-4 bg-white border-slate-200 text-indigo-600 font-black text-[10px] sm:text-xs"
      >
        <FaPrint className="sm:mr-2" />
        <span className="hidden sm:inline">PRINT</span>
      </Button>

      {/* Report Button */}
      <Button
        onClick={() => toggleModal("report", true)}
        variant="primary"
        className="bg-indigo-600 shadow-lg px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-black uppercase text-[10px] tracking-widest"
      >
        <FaChartLine className="sm:mr-2" />
        <span className="hidden sm:inline">Report</span>
      </Button>

      {/* ADMIN ACTIONS */}
      {isAdmin && (
        <>
          <Button
            onClick={() => toggleModal("leave", true)}
            variant="warning"
            className="bg-amber-500 text-white shadow-lg px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-black uppercase text-[10px] tracking-widest border-none"
          >
            <FaCalendarCheck className="sm:mr-2" />
            <span className="hidden sm:inline">Leave</span>
          </Button>

          <Button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-rose-500 border border-rose-600 text-rose-600 hover:bg-rose-600 hover:text-white px-4 sm:px-5 py-3 sm:py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
          >
            <FaTrashAlt className="sm:mr-2" />
            <span className="hidden sm:inline">Delete</span>
          </Button>

          <Button
            onClick={() => setIsEditing(!isEditing)}
            className={`rounded-xl px-4 sm:px-6 py-3 sm:py-4 shadow-xl font-black uppercase text-[10px] tracking-widest transition-all ${
              isEditing
                ? "bg-rose-600 text-white"
                : "bg-slate-900 text-white hover:bg-indigo-600"
            }`}
          >
            {isEditing ? (
              <>
                <FaRegWindowClose className="sm:mr-2" />
                <span className="hidden sm:inline">Cancel</span>
              </>
            ) : (
              <>
                <FaEdit className="sm:mr-2" />
                <span className="hidden sm:inline">Manage</span>
              </>
            )}
          </Button>
        </>
      )}
    </div>
  </div>
);

export default ProfileHeader;

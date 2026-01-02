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
  <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-sm border border-white flex flex-col md:flex-row justify-between items-center gap-6 mb-10 transition-all no-print">
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
        <FaPrint className="mr-2" /> PRINT
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
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-rose-500 text-rose-600 hover:bg-rose-600 hover:text-white px-5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
          >
            <FaTrashAlt className="mr-2" /> Delete
          </Button>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className={`rounded-xl px-6 shadow-xl font-black uppercase text-[10px] tracking-widest ${
              isEditing ? "bg-rose-500 text-white" : "bg-slate-900 text-white"
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
);

export default ProfileHeader;

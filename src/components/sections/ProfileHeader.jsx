import React from "react";
import {
  FaCalendarCheck,
  FaChartLine,
  FaChevronLeft,
  FaEdit,
  FaIdBadge,
  FaPrint,
  FaRegWindowClose,
  FaTrashAlt,
  FaUserTie,
} from "react-icons/fa";
import Button from "../ui/Button";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "T";

const StatPill = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
  </div>
);

const ProfileHeader = ({
  teacherDetails,
  stats,
  isAdmin,
  isEditing,
  setIsEditing,
  navigate,
  toggleModal,
  setShowDeleteConfirm,
}) => (
  <section className="no-print mb-6 overflow-hidden border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 p-5 sm:p-6 lg:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => navigate("/teachers")}
            className="grid h-10 w-10 flex-none place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            title="Back to teachers"
          >
            <FaChevronLeft size={13} />
          </button>

          <div className="grid h-16 w-16 flex-none place-items-center rounded-xl bg-slate-900 text-xl font-bold text-white">
            {getInitials(teacherDetails.name)}
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                <FaIdBadge size={11} />
                {teacherDetails.teacherId}
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                <FaUserTie size={11} />
                {teacherDetails.designation || "Teacher"}
              </span>
            </div>
            <h1 className="truncate text-2xl font-bold text-slate-900 sm:text-3xl">
              {teacherDetails.name}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {teacherDetails.campus?.name || "Campus not assigned"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Button
            onClick={() => window.print()}
            variant="secondary"
            className="px-3 py-2.5 text-sm"
          >
            <FaPrint size={13} />
            Print
          </Button>

          <Button
            onClick={() => toggleModal("report", true)}
            variant="primary"
            className="px-3 py-2.5 text-sm"
          >
            <FaChartLine size={13} />
            Report
          </Button>

          {isAdmin && (
            <>
              <Button
                onClick={() => toggleModal("leave", true)}
                variant="secondary"
                className="px-3 py-2.5 text-sm"
              >
                <FaCalendarCheck size={13} />
                Leave
              </Button>

              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "danger" : "secondary"}
                className="px-3 py-2.5 text-sm"
              >
                {isEditing ? <FaRegWindowClose size={13} /> : <FaEdit size={13} />}
                {isEditing ? "Cancel" : "Edit"}
              </Button>

              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="danger"
                className="px-3 py-2.5 text-sm"
              >
                <FaTrashAlt size={12} />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-5 sm:grid-cols-5 sm:p-6">
      <StatPill label="Current duties" value={stats.currentAssignments} />
      <StatPill label="All duties" value={stats.totalAssignments} />
      <StatPill label="Routine items" value={stats.currentRoutine} />
      <StatPill label="Granted leaves" value={stats.leaves} />
      <StatPill label="Reports" value={stats.reports} />
    </div>
  </section>
);

export default ProfileHeader;

import React from "react";
import {
  FaBuilding,
  FaClipboardCheck,
  FaHistory,
  FaPhoneAlt,
  FaStar,
  FaTrashAlt,
  FaUserCheck,
} from "react-icons/fa";

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
    <div className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-white text-teal-700">
      <Icon size={13} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="truncate text-sm font-semibold text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
  </div>
);

const Panel = ({ icon: Icon, title, children }) => (
  <section className="border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center gap-3 border-b border-slate-200 p-5">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-teal-700">
        <Icon />
      </div>
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const EmptyList = ({ children }) => (
  <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm font-medium text-slate-400">
    {children}
  </div>
);

const ProfileSidebar = ({
  teacherDetails,
  grantedLeaves,
  isAdmin,
  handleLeaveDelete,
  handleReportDelete,
}) => (
  <aside className="no-print space-y-6">
    <Panel icon={FaUserCheck} title="Profile Details">
      <div className="space-y-3">
        <InfoRow icon={FaPhoneAlt} label="Phone" value={teacherDetails.phone} />
        <InfoRow
          icon={FaBuilding}
          label="Campus"
          value={teacherDetails.campus?.name}
        />
        <InfoRow
          icon={FaClipboardCheck}
          label="Designation"
          value={teacherDetails.designation}
        />
      </div>
    </Panel>

    <Panel icon={FaHistory} title="Leave History">
      <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
        {grantedLeaves.length > 0 ? (
          grantedLeaves.map((leave) => (
            <article
              key={leave._id}
              className="group rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">
                  {leave.year}
                </span>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleLeaveDelete(leave._id)}
                    className="grid h-7 w-7 place-items-center rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                    title="Delete leave"
                  >
                    <FaTrashAlt size={11} />
                  </button>
                )}
              </div>
              <p className="text-sm leading-6 text-slate-600">
                {leave.reason}
              </p>
            </article>
          ))
        ) : (
          <EmptyList>No leave records found.</EmptyList>
        )}
      </div>
    </Panel>

    <Panel icon={FaStar} title="Performance Reports">
      <div className="space-y-4">
        {teacherDetails.reports?.length > 0 ? (
          teacherDetails.reports.map((report) => (
            <article
              key={report._id}
              className="relative border-l-2 border-teal-100 pl-4"
            >
              <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white bg-teal-700" />
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-teal-700">
                  Session {report.year}
                </p>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleReportDelete(report._id)}
                    className="grid h-7 w-7 place-items-center rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                    title="Delete report"
                  >
                    <FaTrashAlt size={11} />
                  </button>
                )}
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm leading-6 text-slate-600">
                  {report.performanceReport}
                </p>
              </div>
            </article>
          ))
        ) : (
          <EmptyList>No performance reports yet.</EmptyList>
        )}
      </div>
    </Panel>
  </aside>
);

export default ProfileSidebar;

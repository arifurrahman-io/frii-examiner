import React from "react";
import {
  FaBookOpen,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaHistory,
  FaPlus,
  FaTrashAlt,
  FaUserShield,
} from "react-icons/fa";

const EmptyState = ({ title, description }) => (
  <div className="rounded-lg border border-dashed border-slate-200 bg-white px-5 py-10 text-center">
    <p className="text-sm font-semibold text-slate-600">{title}</p>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
  </div>
);

const SectionShell = ({ icon: Icon, title, subtitle, action, children }) => (
  <section className="border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-teal-700">
          <Icon />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
    <div className="p-5 sm:p-6">{children}</div>
  </section>
);

const ProfileMainMatrix = ({
  dynamicYears,
  activeTab,
  setActiveTab,
  filteredAssignments,
  isAdmin,
  handleAssignmentDelete,
  currentYear,
  uniqueRoutineSchedule,
  canManageRoutine,
  toggleModal,
  handleRoutineDelete,
}) => {
  const currentRoutines = uniqueRoutineSchedule.filter(
    (routine) => routine.year === currentYear
  );

  return (
    <div className="no-print space-y-6">
      <SectionShell
        icon={FaUserShield}
        title="Responsibility Matrix"
        subtitle={`Duty records for ${activeTab}`}
        action={
          <div className="flex w-full overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-1 sm:w-auto">
            {dynamicYears.slice(0, 5).map((year) => (
              <button
                key={year}
                onClick={() => setActiveTab(year)}
                className={`min-w-16 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === year
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:bg-white hover:text-slate-900"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        }
      >
        {filteredAssignments.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredAssignments.map((assignment, index) => (
              <article
                key={assignment._id || index}
                className="group relative rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-teal-200 hover:bg-white"
              >
                <div className="flex items-start gap-3 pr-8">
                  <div className="mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-lg bg-white text-teal-700">
                    <FaChalkboardTeacher size={15} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-slate-900">
                      {assignment.name}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                      <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1">
                        <FaBookOpen size={10} />
                        {assignment.subject || "N/A"}
                      </span>
                      <span className="rounded-md border border-slate-200 bg-white px-2 py-1">
                        {assignment.class || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleAssignmentDelete(assignment._id)}
                    className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-slate-300 opacity-100 hover:bg-rose-50 hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100"
                    title="Delete assignment"
                  >
                    <FaTrashAlt size={12} />
                  </button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No assignments found"
            description="This teacher has no responsibility records for the selected year."
          />
        )}
      </SectionShell>

      <SectionShell
        icon={FaCalendarAlt}
        title="Current Routine"
        subtitle={`Academic schedule for ${currentYear}`}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleModal("yearlyView", true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              <FaHistory size={12} />
              Archive
            </button>
            {canManageRoutine && (
              <button
                type="button"
                onClick={() => toggleModal("routine", true)}
                className="grid h-10 w-10 place-items-center rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                title="Add routine"
              >
                <FaPlus size={13} />
              </button>
            )}
          </div>
        }
      >
        {currentRoutines.length > 0 ? (
          <div className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200">
            {currentRoutines.map((item, index) => (
              <div
                key={item._id || index}
                className="group flex items-center justify-between gap-4 bg-white px-4 py-3 hover:bg-slate-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-teal-50 text-teal-700">
                    <FaHistory size={13} />
                  </div>
                  <p className="truncate text-sm font-semibold text-slate-700">
                    {item.display}
                  </p>
                </div>
                {canManageRoutine && (
                  <button
                    type="button"
                    onClick={() => handleRoutineDelete(item._id)}
                    className="grid h-8 w-8 flex-none place-items-center rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                    title="Delete routine"
                  >
                    <FaTrashAlt size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No routine set for this year"
            description="Add routine items when the academic schedule is ready."
          />
        )}
      </SectionShell>
    </div>
  );
};

export default ProfileMainMatrix;

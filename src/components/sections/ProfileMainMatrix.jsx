import React from "react";
import { FaUserShield, FaTrashAlt, FaPlus, FaHistory } from "react-icons/fa";

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
}) => (
  <div className="lg:col-span-8 space-y-10 no-print">
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
            className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-4 relative group transition-all hover:bg-white hover:shadow-xl"
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
        <h3 className="text-xl font-black text-slate-900 uppercase">Routine</h3>
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
);

export default ProfileMainMatrix;

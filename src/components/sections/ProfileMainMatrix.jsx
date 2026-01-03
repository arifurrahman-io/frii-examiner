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
  <div className="lg:col-span-8 space-y-6 sm:space-y-10 no-print">
    {/* --- ১. Responsibility Matrix Section --- */}
    <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[4rem] shadow-sm border border-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 sm:mb-12">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
          Responsibility Matrix
        </h3>

        {/* মোবাইলে বছরগুলো স্ক্রোলযোগ্য করার জন্য custom-scrollbar লজিক */}
        <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto no-scrollbar">
          <div className="flex min-w-max">
            {dynamicYears.slice(0, 4).map((year) => (
              <button
                key={year}
                onClick={() => setActiveTab(year)}
                className={`px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black transition-all ${
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment, i) => (
            <div
              key={i}
              className="p-6 sm:p-8 bg-slate-50 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 flex items-center gap-4 relative group transition-all hover:bg-white hover:shadow-xl"
            >
              <FaUserShield className="text-indigo-500 shrink-0" size={24} />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-black text-slate-800 uppercase truncate">
                  {assignment.name}
                </p>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 truncate">
                  {assignment.class} | {assignment.subject}
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleAssignmentDelete(assignment._id)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all p-1"
                >
                  <FaTrashAlt size={12} />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest border-2 border-dashed border-slate-50 rounded-[2rem]">
            No Assignments Found
          </div>
        )}
      </div>
    </div>

    {/* --- ২. Routine Section --- */}
    <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[4rem] shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase">
          Routine
        </h3>
        {canManageRoutine && (
          <button
            onClick={() => toggleModal("routine", true)}
            className="bg-indigo-600 text-white p-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-100"
          >
            <FaPlus size={14} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {uniqueRoutineSchedule
          .filter((r) => r.year === currentYear)
          .map((item, i) => (
            <div
              key={i}
              className="p-5 sm:p-6 bg-slate-50 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 flex items-center justify-between group transition-all hover:border-indigo-100"
            >
              <div className="flex items-center gap-4 min-w-0">
                <FaHistory className="text-indigo-500 shrink-0" />
                <p className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase truncate">
                  {item.display}
                </p>
              </div>
              {canManageRoutine && (
                <button
                  onClick={() => handleRoutineDelete(item._id)}
                  className="text-rose-300 hover:text-rose-500 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all p-1"
                >
                  <FaTrashAlt size={12} />
                </button>
              )}
            </div>
          ))}
        {uniqueRoutineSchedule.filter((r) => r.year === currentYear).length ===
          0 && (
          <div className="col-span-full py-10 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest border-2 border-dashed border-slate-50 rounded-[2rem]">
            Current Session Awaiting Sync
          </div>
        )}
      </div>

      {/* --- Archive Access --- */}
      <div className="mt-8 pt-8 border-t border-slate-50 flex justify-center">
        <button
          onClick={() => toggleModal("yearlyView", true)}
          className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors py-2 px-4 rounded-full hover:bg-indigo-50"
        >
          <FaHistory /> View Full Archive
        </button>
      </div>
    </div>
  </div>
);

export default ProfileMainMatrix;

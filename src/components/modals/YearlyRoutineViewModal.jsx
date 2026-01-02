import React from "react";
import Modal from "../ui/Modal";
import {
  FaCalendarAlt,
  FaClock,
  FaLayerGroup,
  FaTrashAlt,
  FaHistory,
  FaShieldAlt,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { deleteRoutine } from "../../api/apiService";

const YearlyRoutineViewModal = ({
  isOpen,
  onClose,
  routines,
  onActionSuccess,
}) => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  const isAdmin = user?.role === "admin";
  const isIncharge = user?.role === "incharge";
  const canManage = isAdmin || isIncharge;

  // 🚀 ১. বছর অনুযায়ী গ্রুপ করা এবং ডুপ্লিকেট রিমুভ করা
  const groupedRoutines = routines.reduce((acc, obj) => {
    const yearKey = obj.year || "Unknown Year";
    if (!acc[yearKey]) acc[yearKey] = [];

    const isDuplicate = acc[yearKey].some(
      (item) =>
        item.display.trim().toLowerCase() === obj.display.trim().toLowerCase()
    );

    if (!isDuplicate) {
      acc[yearKey].push(obj);
    }
    return acc;
  }, {});

  const sortedYears = Object.keys(groupedRoutines).sort((a, b) => b - a);

  // 🛠️ ২. ডিলিট হ্যান্ডলার
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to purge this routine node from active cycle?"
      )
    )
      return;
    try {
      await deleteRoutine(id);
      toast.success("Routine node successfully purged.");
      if (onActionSuccess) onActionSuccess();
    } catch (error) {
      toast.error("Deletion protocol failed.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Historical Matrix Archive">
      <div className="max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar p-1">
        {sortedYears.length > 0 ? (
          sortedYears.map((year) => {
            const isCurrentYear = parseInt(year) === currentYear;

            return (
              <div key={year} className="mb-12 last:mb-2 group/session">
                {/* --- 🏷️ SESSION STICKY HEADER --- */}
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-white/90 backdrop-blur-md py-4 z-20 border-b border-indigo-100/50">
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-2xl flex items-center justify-center shadow-xl transition-transform group-hover/session:scale-110 ${
                        isCurrentYear
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-900 text-indigo-400"
                      }`}
                    >
                      <FaLayerGroup size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">
                        Session {year}{" "}
                        {isCurrentYear && (
                          <span className="text-[10px] text-indigo-500 lowercase tracking-normal ml-2">
                            (Active)
                          </span>
                        )}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {isCurrentYear
                          ? "Current Operational Cycle"
                          : "Historical Data Archive"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full border border-indigo-100">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">
                      {groupedRoutines[year].length} Units
                    </span>
                  </div>
                </div>

                {/* --- 📋 ROUTINE CARDS --- */}
                <div className="grid grid-cols-1 gap-4 ml-2">
                  {groupedRoutines[year].map((item, index) => (
                    <div
                      key={index}
                      className="group/card relative flex items-center p-5 bg-white hover:bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10"
                    >
                      <div
                        className={`absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1 rounded-r-full scale-y-0 group-hover/card:scale-y-100 transition-transform duration-500 ${
                          isCurrentYear ? "bg-indigo-500" : "bg-slate-400"
                        }`}
                      ></div>

                      <div className="h-14 w-14 bg-indigo-50/50 rounded-3xl flex items-center justify-center text-indigo-500 border border-indigo-100 group-hover/card:bg-indigo-600 group-hover/card:text-white transition-all duration-500">
                        <FaCalendarAlt size={20} />
                      </div>

                      <div className="ml-6 flex-1">
                        <div className="flex items-center gap-3">
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tight leading-tight">
                            {item.display.split("[")[0]}
                          </p>
                          {item.display.includes("[") && (
                            <span className="text-[9px] font-black bg-slate-900 text-indigo-400 px-3 py-1 rounded-lg uppercase tracking-tighter">
                              {item.display.split("[")[1].replace("]", "")}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <FaClock className="mr-1.5 text-indigo-300" />{" "}
                            {isCurrentYear ? "Live Log" : "Archived"}
                          </span>
                          <div className="h-1 w-1 rounded-full bg-slate-200"></div>
                          <span className="flex items-center text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                            <FaShieldAlt className="mr-1.5" /> Verified
                          </span>
                        </div>
                      </div>

                      {/* --- 🗑️ CONDITIONAL DELETE ACTION --- */}
                      {canManage && isCurrentYear && (
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all duration-300 opacity-0 group-hover/card:opacity-100"
                          title="Purge Active Node"
                        >
                          <FaTrashAlt size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-40 grayscale opacity-40">
            <div className="h-24 w-24 bg-slate-100 rounded-[3rem] flex items-center justify-center text-slate-300 mb-6 shadow-inner">
              <FaHistory size={40} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">
              No Archival Data Found
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-5 border-t border-slate-100 flex justify-between items-center px-2">
        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">
          Institutional Node Protocol v2.5.0
        </p>
        <div className="flex gap-1 text-[8px] font-black text-indigo-300 uppercase tracking-widest">
          {currentYear} Matrix Active
        </div>
      </div>
    </Modal>
  );
};

export default YearlyRoutineViewModal;

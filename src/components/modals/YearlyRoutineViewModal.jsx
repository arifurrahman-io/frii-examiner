import React from "react";
import Modal from "../ui/Modal";
import { FaCalendarAlt, FaClock, FaLayerGroup } from "react-icons/fa";

const YearlyRoutineViewModal = ({ isOpen, onClose, routines }) => {
  // 🚀 ১. বছর অনুযায়ী গ্রুপ করা এবং ডুপ্লিকেট (Class + Subject) রিমুভ করা
  const groupedRoutines = routines.reduce((acc, obj) => {
    const yearKey = obj.year || "Unknown Year";
    if (!acc[yearKey]) acc[yearKey] = [];

    // একই Class এবং Subject চেক করার জন্য লজিক
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Academic Routines">
      <div className="max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar p-2">
        {sortedYears.length > 0 ? (
          sortedYears.map((year) => (
            <div key={year} className="mb-8 last:mb-2">
              {/* --- SESSION HEADER (Image অনুযায়ী) --- */}
              <div className="flex items-center gap-3 mb-6 sticky top-0 bg-white py-2 z-10">
                <div className="h-6 w-1 bg-indigo-600 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <FaLayerGroup className="text-indigo-600 text-lg" />
                  <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest">
                    SESSION {year}
                  </h3>
                </div>
                {/* Entry Count Badge */}
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                  {groupedRoutines[year].length} Entries
                </span>
              </div>

              {/* --- ROUTINE CARDS (Image অনুযায়ী UI) --- */}
              <div className="space-y-4 ml-4">
                {groupedRoutines[year].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center p-5 bg-indigo-50/30 rounded-3xl border border-indigo-100/50 hover:bg-indigo-50 transition-all duration-300"
                  >
                    {/* Icon Box */}
                    <div className="p-3 bg-white rounded-2xl mr-5 text-indigo-600 shadow-sm border border-indigo-50">
                      <FaCalendarAlt size={20} />
                    </div>

                    {/* Content */}
                    <div>
                      <p className="text-sm font-black text-gray-800 uppercase tracking-tight">
                        {item.display}
                      </p>
                      <p className="text-[10px] font-black text-indigo-500 flex items-center mt-1 uppercase tracking-tighter">
                        <FaClock className="mr-1.5" /> ACTIVE SCHEDULE
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
            No routine records available
          </div>
        )}
      </div>
    </Modal>
  );
};

export default YearlyRoutineViewModal;

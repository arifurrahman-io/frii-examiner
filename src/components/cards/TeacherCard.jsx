import React, { useState } from "react";
import {
  FaChevronDown,
  FaBook,
  FaIdBadge,
  FaUniversity,
  FaLayerGroup,
  FaHistory,
  FaArrowRight,
  FaCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const TeacherCard = ({ teacher, assignmentsByYear, routineSchedule }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  // --- ডাটা ফিল্টারিং ---
  const routineDataCurrentYear = Array.isArray(routineSchedule)
    ? routineSchedule.filter((item) => item.year === currentYear)
    : [];

  const assignmentsByYearArray = Array.isArray(assignmentsByYear)
    ? assignmentsByYear
    : [];
  const assignmentsCurrent =
    assignmentsByYearArray.find((a) => a._id === currentYear)
      ?.responsibilities || [];
  const assignmentsPrevious =
    assignmentsByYearArray.find((a) => a._id === previousYear)
      ?.responsibilities || [];

  return (
    <div
      onClick={() => navigate(`/teacher/profile/${teacher._id}`)}
      className="group relative bg-blue-50 rounded-[2.5rem] p-5 border border-blue-200 shadow-[0_20px_50px_rgba(79,70,229,0.04)] hover:shadow-indigo-100 hover:-translate-y-1 transition-all duration-500 cursor-pointer overflow-hidden"
    >
      {/* Background Neural Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl transition-transform group-hover:scale-150 duration-1000"></div>

      {/* --- ১. প্রোফাইল হেডার (Modern & Clean) --- */}
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 shrink-0">
            <div className="h-full w-full bg-slate-900 rounded-[1.2rem] flex items-center justify-center text-white shadow-lg group-hover:rotate-3 transition-transform duration-500">
              <span className="text-lg font-black">
                {teacher.name.charAt(0)}
              </span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>

          <div className="min-w-0">
            <h3 className="text-[15px] font-black text-slate-900 truncate tracking-tight leading-none mb-1.5 group-hover:text-indigo-600 transition-colors">
              {teacher.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 flex items-center gap-1">
                <FaIdBadge className="text-indigo-400" size={8} />{" "}
                {teacher.teacherId}
              </span>
              <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50/50 px-2 py-0.5 rounded-md border border-indigo-100/50 flex items-center gap-1">
                <FaUniversity size={8} /> {teacher.campus?.name || "Global"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-500 ${
            isOpen
              ? "bg-slate-900 text-white shadow-lg"
              : "bg-indigo-600 text-white"
          }`}
        >
          <FaChevronDown
            size={10}
            className={`transition-transform duration-500 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* --- ২. কম্প্যাক্ট সিঙ্গেল-লাইন রেসপনসিবিলিটি ম্যাট্রিক্স --- */}
      <div className="grid grid-cols-2 gap-4 relative z-10 border-t border-indigo-600 pt-4">
        {/* Current Session (Session 2025) */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-indigo-300">
            <FaLayerGroup className="text-indigo-600" size={9} />
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
              Session {currentYear}
            </p>
          </div>
          <div className="space-y-1 max-h-[110px] overflow-y-auto custom-scrollbar pr-1">
            {assignmentsCurrent.length > 0 ? (
              assignmentsCurrent.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 py-1 whitespace-nowrap"
                >
                  <span className="text-[9px] font-bold text-slate-800 leading-none">
                    {a.name}
                  </span>
                  <span className="text-[7px] font-black text-indigo-500 uppercase tracking-tighter bg-indigo-50/50 px-1.5 rounded-sm">
                    {a.class?.name || a.class} • {a.subject?.name || a.subject}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-[8px] font-bold text-slate-300 uppercase italic">
                No data found
              </span>
            )}
          </div>
        </div>

        {/* Previous Session (History 2024) */}
        <div className="flex flex-col space-y-2 border-l border-blue-500 pl-3">
          <div className="flex items-center gap-2 pb-1 border-b border-indigo-600">
            <FaHistory className="text-slate-400" size={9} />
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
              History {previousYear}
            </p>
          </div>
          <div className="space-y-1 max-h-[110px] overflow-y-auto custom-scrollbar pr-1">
            {assignmentsPrevious.length > 0 ? (
              assignmentsPrevious.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 py-1 whitespace-nowrap"
                >
                  <span className="text-[11px] font-bold text-gray-700 leading-none">
                    {a.name}
                  </span>
                  <span className="text-[10px] font-bold text-gray-700 uppercase tracking-tighter px-1.5 rounded-sm">
                    {a.class?.name || a.class} • {a.subject?.name || a.subject}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-[8px] font-bold text-slate-300 uppercase italic">
                No Archive
              </span>
            )}
          </div>
        </div>
      </div>

      {/* --- ৩. এক্সপেন্ডেবল সিডিউল ম্যাট্রিক্স --- */}
      <div
        className={`overflow-hidden transition-all duration-700 ease-in-out ${
          isOpen ? "max-h-48 mt-5 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pt-4 border-t border-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[8px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center">
              <FaBook className="mr-1.5 text-indigo-500" size={10} /> Routine of
              ({currentYear})
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {routineDataCurrentYear.length > 0 ? (
              routineDataCurrentYear.map((item) => (
                <span
                  key={item._id}
                  className="px-2 py-1 bg-white border border-slate-100 text-slate-600 rounded-lg text-[8px] font-bold uppercase tracking-tight shadow-sm"
                >
                  {item.display}
                </span>
              ))
            ) : (
              <p className="text-[8px] font-bold text-slate-300 uppercase italic">
                Operational Sync Pending
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Access Hover Action */}
      <div className="absolute bottom-3 right-5 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 flex items-center gap-1.5">
        <FaArrowRight size={8} className="text-indigo-600" />
      </div>
    </div>
  );
};

export default TeacherCard;

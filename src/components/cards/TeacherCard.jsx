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
      className="group relative bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* --- ১. প্রোফাইল হেডার (Modern & Clean) --- */}
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 shrink-0">
            <div className="h-full w-full bg-emerald-700 rounded-xl flex items-center justify-center text-white">
              <span className="text-lg font-bold">
                {teacher.name.charAt(0)}
              </span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>

          <div className="min-w-0">
            <h3 className="text-[15px] font-bold text-slate-900 truncate tracking-tight leading-none mb-1.5 group-hover:text-emerald-700 transition-colors">
              {teacher.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 flex items-center gap-1">
                <FaIdBadge className="text-slate-400" size={8} />{" "}
                {teacher.teacherId}
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 flex items-center gap-1">
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
              ? "bg-emerald-700 text-white"
              : "bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
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
      <div className="grid grid-cols-2 gap-4 relative z-10 border-t border-slate-100 pt-4">
        {/* Current Session (Session 2025) */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <FaLayerGroup className="text-emerald-700" size={9} />
            <p className="text-[10px] font-semibold text-slate-500 leading-none">
              {currentYear}
            </p>
          </div>
          <div className="space-y-1 max-h-[110px] overflow-y-auto custom-scrollbar pr-1">
            {assignmentsCurrent.length > 0 ? (
              assignmentsCurrent.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 py-1 whitespace-nowrap"
                >
                  <span className="text-[10px] font-semibold text-slate-700 leading-none">
                    {a.name}
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 rounded-sm">
                    {a.class?.name || a.class} • {a.subject?.name || a.subject}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-[10px] font-semibold text-slate-300">
                No data found
              </span>
            )}
          </div>
        </div>

        {/* Previous Session (History 2024) */}
        <div className="flex flex-col space-y-2 border-l border-slate-100 pl-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <FaHistory className="text-slate-400" size={9} />
            <p className="text-[10px] font-semibold text-slate-500 leading-none">
              {previousYear}
            </p>
          </div>
          <div className="space-y-1 max-h-[110px] overflow-y-auto custom-scrollbar pr-1">
            {assignmentsPrevious.length > 0 ? (
              assignmentsPrevious.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 py-1 whitespace-nowrap"
                >
                  <span className="text-[10px] font-semibold text-gray-700 leading-none">
                    {a.name}
                  </span>
                  <span className="text-[9px] font-semibold text-gray-500 px-1.5 rounded-sm">
                    {a.class?.name || a.class} • {a.subject?.name || a.subject}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-[10px] font-semibold text-slate-300">
                No history
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
            <h4 className="text-[10px] font-semibold text-slate-700 flex items-center">
              <FaBook className="mr-1.5 text-emerald-700" size={10} /> Routine of
              ({currentYear})
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {routineDataCurrentYear.length > 0 ? (
              routineDataCurrentYear.map((item) => (
                <span
                  key={item._id}
                  className="px-2 py-1 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg text-[10px] font-semibold"
                >
                  {item.display}
                </span>
              ))
            ) : (
              <p className="text-[10px] font-semibold text-slate-300">
                No routine found
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Access Hover Action */}
      <div className="absolute bottom-3 right-5 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 flex items-center gap-1.5">
        <FaArrowRight size={8} className="text-emerald-700" />
      </div>
    </div>
  );
};

export default TeacherCard;

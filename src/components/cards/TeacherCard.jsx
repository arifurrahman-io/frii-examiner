import React, { useState } from "react";
import {
  FaChevronDown,
  FaBook,
  FaIdBadge,
  FaUniversity,
  FaLayerGroup,
  FaHistory,
  FaArrowRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const TeacherCard = ({ teacher, assignmentsByYear, routineSchedule }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  // --- ডাটা ফিল্টারিং ও প্রসেসিং ---
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

  // মডার্ন অ্যাসাইনমেন্ট লিস্ট সাব-কম্পোনেন্ট
  const AssignmentList = ({ list, title, icon: Icon, colorClass }) => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`p-1.5 rounded-lg bg-white shadow-sm border border-slate-50 ${colorClass}`}
        >
          <Icon size={10} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {title}
        </p>
      </div>
      <ul className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
        {list.length > 0 ? (
          list.map((assignment, index) => (
            <li
              key={index}
              className="flex flex-col p-2.5 rounded-xl bg-slate-50/50 border border-white hover:bg-white hover:shadow-sm transition-all duration-300 group/item"
            >
              <span className="text-[11px] font-bold text-slate-700 leading-tight truncate group-hover/item:text-indigo-600 transition-colors">
                {assignment.name}
              </span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase mt-1">
                {assignment.class?.name || assignment.class} •{" "}
                {assignment.subject?.name || assignment.subject}
              </span>
            </li>
          ))
        ) : (
          <li className="text-[10px] text-slate-300 font-bold uppercase italic p-3 border border-dashed border-slate-100 rounded-xl text-center">
            Zero Active Nodes
          </li>
        )}
      </ul>
    </div>
  );

  return (
    <div
      onClick={() => navigate(`/teacher/profile/${teacher._id}`)}
      className="group relative bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white shadow-[0_20px_50px_rgba(79,70,229,0.03)] hover:shadow-indigo-100 hover:-translate-y-1 transition-all duration-500 cursor-pointer overflow-hidden"
    >
      {/* Background dynamic glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl transition-transform group-hover:scale-150 duration-1000"></div>

      {/* --- ১. হেডার: ইনফরমেশন ও মেটা ডাটা --- */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-5">
          {/* প্রোফাইল এভার্টার (ইনিশিয়াল) */}
          <div className="h-14 w-14 bg-gradient-to-tr from-slate-900 to-indigo-900 rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:rotate-3 transition-transform duration-500 overflow-hidden relative">
            <span className="text-xl font-black relative z-10">
              {teacher.name.charAt(0)}
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-2 group-hover:text-indigo-600 transition-colors">
              {teacher.name}
            </h3>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <FaIdBadge className="text-indigo-400" /> {teacher.teacherId}
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-200"></span>
              <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">
                <FaUniversity size={8} /> {teacher.campus?.name || "Global"}
              </span>
            </div>
          </div>
        </div>

        {/* এক্সপেনশন টগল */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
            isOpen
              ? "bg-indigo-600 text-white shadow-lg"
              : "bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
          }`}
        >
          <FaChevronDown
            size={14}
            className={`transition-transform duration-500 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* --- ২. ডাইনামিক ডাটা গ্রিড (অ্যাসাইনমেন্টস) --- */}
      <div className="grid grid-cols-2 gap-6 relative z-10 border-t border-slate-50 pt-6">
        <div className="border-r border-slate-50 pr-2">
          <AssignmentList
            list={assignmentsCurrent}
            title={`Session ${currentYear}`}
            icon={FaLayerGroup}
            colorClass="text-indigo-600"
          />
        </div>
        <div className="pl-1">
          <AssignmentList
            list={assignmentsPrevious}
            title={`Archived ${previousYear}`}
            icon={FaHistory}
            colorClass="text-slate-400"
          />
        </div>
      </div>

      {/* --- ৩. রুটিন শিডিউল (স্মুথ এনিমেশন সহ) --- */}
      <div
        className={`overflow-hidden transition-all duration-700 ease-in-out ${
          isOpen ? "max-h-64 mt-8 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pt-6 border-t border-slate-50 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] flex items-center">
              <FaBook className="mr-2 text-indigo-500" size={12} /> Neural
              Schedule Matrix ({currentYear})
            </h4>
          </div>

          {routineDataCurrentYear.length > 0 ? (
            <div className="flex flex-wrap gap-2 p-1">
              {routineDataCurrentYear.map((item) => (
                <span
                  key={item._id}
                  className="px-3 py-1.5 bg-white border border-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-tight shadow-sm hover:border-indigo-200 hover:text-indigo-600 transition-all cursor-default"
                >
                  {item.display}
                </span>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                No schedule nodes detected in current cycle
              </p>
            </div>
          )}
        </div>
      </div>

      {/* হোভার অ্যাকশন ইন্ডিকেটর */}
      <div className="absolute bottom-4 right-8 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 flex items-center gap-2">
        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">
          Expand Intelligence
        </span>
        <FaArrowRight size={10} className="text-indigo-600" />
      </div>
    </div>
  );
};

export default TeacherCard;

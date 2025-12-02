// arifurrahman-io/frii-examiner/frii-examiner-94b444a3277f392cde2a42af87c32a9043a874f2/src/components/cards/TeacherCard.jsx

import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaBook } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const TeacherCard = ({ teacher, assignmentsByYear, routineSchedule }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  // --- RENDER DATA PREPARATION ---
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

  // --- MODERN/MINIMAL UI STYLES ---
  const baseBg = "bg-white";
  const accentColor = "text-indigo-700";
  const detailColor = "text-gray-800";
  const borderColor = "border-gray-200";
  const dividerColor = "border-gray-100";
  const routinePillBg = "bg-indigo-50";
  const routinePillText = "text-indigo-700";

  // Responsibility List Component (Cleaned up for minimal display)
  const AssignmentList = ({ list, title }) => (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-1">{title}</p>
      <ul className="text-xs text-gray-700 space-y-0.5 max-h-24 overflow-y-auto">
        {list.length > 0 ? (
          list.map((assignment, index) => {
            const className =
              assignment.class?.name || assignment.class || "N/A";
            const subjectName =
              assignment.subject?.name || assignment.subject || "N/A";

            return (
              <li key={index} className="flex items-start text-gray-600">
                <span className="w-1/2 overflow-hidden text-ellipsis whitespace-nowrap pr-2">
                  {assignment.name}
                </span>
                <span className="w-1/2 text-gray-400">
                  ({className} {subjectName})
                </span>
              </li>
            );
          })
        ) : (
          <li className="text-gray-500 italic">No data found!</li>
        )}
      </ul>
    </div>
  );

  return (
    <div
      // REDUCED PADDING: p-4 for better mobile density
      className={`w-full p-4 rounded-xl shadow-sm border ${borderColor} cursor-pointer ${baseBg} hover:shadow-md transition duration-200`}
      onClick={() => navigate(`/teacher/profile/${teacher._id}`)} // Navigate on click
    >
      {/* --- 1. TOP SECTION: Name, ID, Campus --- */}
      <div className="flex justify-between items-start pb-3 border-b border-indigo-100">
        {/* Left: Name and ID */}
        <div className="flex flex-col">
          <h3 className={`text-xl font-extrabold ${accentColor} leading-tight`}>
            {teacher.name}
          </h3>
          <p className="text-sm font-medium text-gray-600">
            ID: {teacher.teacherId}
          </p>
        </div>

        {/* Right: Campus and Toggle */}
        <div className="flex flex-col items-end space-y-1">
          <span className={`text-md font-semibold text-gray-700`}>
            {teacher.campus?.name || "N/A"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent navigation
              setIsOpen(!isOpen);
            }}
            // Toggler icon is minimal
            className={`text-xl ${accentColor} hover:text-indigo-900 transition p-1`}
            title="Toggle Details"
          >
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>

      {/* --- 2. ASSIGNMENT SUMMARY (Vertical Divider Added) --- */}
      {/* Removed gap-4 from grid to manually control spacing */}
      <div className={`grid grid-cols-2 mt-3 border-b ${dividerColor} pb-3`}>
        {/* Current Year Assignments: Add right border and padding-right (p-1) */}
        <div className={`pr-1 border-r ${dividerColor}`}>
          <AssignmentList
            list={assignmentsCurrent}
            title={`Assignments (${currentYear})`}
          />
        </div>

        {/* Previous Year Assignments: Add padding-left (p-1) */}
        <div className="pl-1">
          <AssignmentList
            list={assignmentsPrevious}
            title={`Assignments (${previousYear})`}
          />
        </div>
      </div>

      {/* --- 3. ROUTINE DETAILS (Toggled) --- */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4
            className={`text-md font-bold ${detailColor} flex items-center mb-3`}
          >
            <FaBook className="mr-2 text-indigo-500" /> Routine Schedule (
            {currentYear}):
          </h4>

          {routineDataCurrentYear.length > 0 ? (
            <div className="flex flex-wrap gap-2 text-sm max-h-24 overflow-y-auto">
              {routineDataCurrentYear.map((item) => (
                <span
                  key={item._id}
                  // Minimal pill styling
                  className={`px-3 py-1 ${routinePillBg} ${routinePillText} rounded-full text-xs font-medium border border-indigo-100`}
                >
                  {item.display}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              No detailed routine schedule found for the current year.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherCard;

import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaBook } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const TeacherCard = ({ teacher, assignmentsByYear, routineSchedule }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  // --- রুটিন ডেটা ফিল্টারিং (FIXED) ---
  // এখন routineSchedule এ অবজেক্ট আছে, তাই আমরা item.year ব্যবহার করে ফিল্টার করব
  const routineDataCurrentYear = Array.isArray(routineSchedule)
    ? routineSchedule.filter((item) => item.year === currentYear) // ✅ FIX: Filter by the 'year' property
    : [];

  // বছর অনুযায়ী অ্যাসাইনমেন্ট ডেটা বের করা (সুরক্ষিত)
  const assignmentsByYearArray = Array.isArray(assignmentsByYear)
    ? assignmentsByYear
    : [];
  const assignmentsCurrent =
    assignmentsByYearArray.find((a) => a._id === currentYear)
      ?.responsibilities || [];
  const assignmentsPrevious =
    assignmentsByYearArray.find((a) => a._id === previousYear)
      ?.responsibilities || [];

  // --- কালার প্যালেট (Finalized) ---
  const baseBg = "bg-blue-50";
  const accentColor = "text-indigo-700";
  const detailColor = "text-indigo-800";
  const borderColor = "border-blue-200";
  const dividerColor = "border-blue-200";
  const routinePillBg = "bg-blue-100";
  const routinePillText = "text-blue-800";

  // দায়িত্বের তালিকা আইটেম রেন্ডার
  const AssignmentList = ({ list }) => (
    <ul className="text-xs text-gray-700 space-y-0.5">
      {list.map((assignment, index) => {
        // রেন্ডারিং সুরক্ষা: অবজেক্ট হলে .name দেখান
        const className = assignment.class?.name || assignment.class || "N/A";
        const subjectName =
          assignment.subject?.name || assignment.subject || "N/A";

        return (
          <li key={index} className="flex items-start">
            <span className="w-4">{index + 1}.</span>
            <span className="flex-1">
              {assignment.name}
              <span className="ml-1 text-gray-500">
                ({className} {subjectName})
              </span>
            </span>
          </li>
        );
      })}
      {list.length === 0 && (
        <li className="text-gray-500 italic">No data found!</li>
      )}
    </ul>
  );

  return (
    <div
      className={`w-full p-4 rounded-xl shadow-lg border ${borderColor} cursor-pointer ${baseBg}`}
      onClick={() => navigate(`/teacher/profile/${teacher._id}`)} // নেভিগেশন (MongoDB ID)
    >
      {/* --- টপ সেকশন (নাম, আইডি, ক্যাম্পাস, টগল) --- */}
      <div className="flex justify-between items-start mb-3">
        {/* বাম অংশ: নাম ও আইডি */}
        <div className="flex flex-col">
          <h3
            className={`text-2xl font-extrabold ${detailColor} leading-tight`}
          >
            {teacher.name}
          </h3>
          <p className="text-sm font-medium text-gray-600">
            {teacher.teacherId}
          </p>
        </div>

        {/* ডান অংশ: ব্রাঞ্চ ও টগল */}
        <div className="flex flex-col items-end space-y-1">
          <span className={`text-lg font-semibold ${accentColor}`}>
            {teacher.campus?.name || "N/A"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation(); // প্রোফাইলে যাওয়া বন্ধ করতে
              setIsOpen(!isOpen);
            }}
            className={`text-2xl ${accentColor} hover:text-indigo-900 transition`}
            title="Toggle Routine Details"
          >
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>

      {/* --- অ্যাসাইনমেন্ট টেবিল (বর্তমান বছর / পূর্ববর্তী বছর) --- */}
      <div
        className={`grid grid-cols-2 gap-4 mt-2 border-t ${dividerColor} pt-3`}
      >
        {/* কলাম ১: বর্তমান বছর */}
        <div className={`border-r ${dividerColor} pr-2`}>
          <p className="text-lg font-bold text-gray-800 mb-1">
            {currentYear} Assignments
          </p>
          <AssignmentList list={assignmentsCurrent} />
        </div>

        {/* কলাম ২: পূর্ববর্তী বছর */}
        <div>
          <p className="text-lg font-bold text-gray-800 mb-1">
            {previousYear} Assignments
          </p>
          <AssignmentList list={assignmentsPrevious} />
        </div>
      </div>

      {/* --- রুটিন ডিটেইলস (টগল্ড) --- */}
      {isOpen && (
        <div className={`mt-4 pt-3 border-t ${dividerColor}`}>
          <h4
            className={`text-md font-bold ${detailColor} flex items-center mb-2`}
          >
            <FaBook className="mr-2" /> Routine:
          </h4>

          {routineDataCurrentYear.length > 0 ? (
            <div className="flex flex-wrap gap-2 text-sm">
              {routineDataCurrentYear.map((item) => (
                <span
                  key={item._id} // ✅ Use object's _id as key
                  className={`px-2 py-1 ${routinePillBg} ${routinePillText} rounded-full font-medium`}
                >
                  {item.display} {/* ✅ Use object's display property */}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 italic">
              No detailed routine schedule found for the current year.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherCard;

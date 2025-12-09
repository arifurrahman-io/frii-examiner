// FULL UPDATED CODE WITH DELETE BUTTON FIX
import React, { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import {
  FaUserGraduate,
  FaClipboardList,
  FaEdit,
  FaSyncAlt,
  FaRegWindowClose,
  FaBook,
  FaCalendarTimes,
  FaPlus,
  FaPrint, // Print Icon
  FaChevronLeft, // Icon for back button
  FaCalendarCheck, // Icon for Grant Leave (used FaCalendarTimes in UI)
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import {
  getTeacherProfile,
  deleteAssignmentPermanently,
  getTeacherRoutines,
  deleteLeave,
  getGrantedLeavesByTeacher,
  deleteRoutine,
} from "../../api/apiService";

import UpdateTeacherForm from "../forms/UpdateTeacherForm";
import Button from "../ui/Button";
import GrantLeaveModal from "../modals/GrantLeaveModal";
import RoutineEntryModal from "../modals/RoutineEntryModal";

// --- Assignment List Component (Screen View) ---
const AssignmentList = ({ list, handleDutyDelete }) => (
  <ul className="space-y-3 pr-4">
    {list.map((assignment, index) => (
      <li
        key={index}
        className="flex justify-between items-start p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-500 print:bg-white print:border-indigo-400 print:shadow-none"
      >
        <span className="text-sm flex-1 mr-3">
          <strong className="text-gray-800">{assignment.name}</strong>
          <span className="ml-2 text-gray-600 font-medium">
            ({assignment.class} - {assignment.subject})
          </span>
          {/* Status span is hidden in print view */}
          <span
            className={`ml-3 px-2 py-0.5 rounded-full text-xs font-semibold print-hidden ${
              assignment.status === "Cancelled"
                ? "bg-gray-200 text-gray-700"
                : "bg-green-200 text-green-800"
            }`}
          >
            {assignment.status}
          </span>
        </span>

        {/* Delete Button (Hidden on Print) */}
        <button
          onClick={() => handleDutyDelete(assignment._id)}
          className="text-red-500 hover:text-red-700 text-xs flex items-center transition flex-shrink-0 print-hidden"
        >
          <FaRegWindowClose className="inline mr-1" /> Delete
        </button>
      </li>
    ))}
  </ul>
);

// 🚀 Print Assignment Table
const PrintAssignmentTable = ({ list }) => (
  <div className="w-full overflow-x-auto print-small-font">
    <table className="w-full text-sm border-collapse mt-2">
      <thead>
        <tr className="bg-gray-200 border-b-2 border-gray-500">
          <th className="px-2 py-1 border border-gray-400 text-left font-bold w-[5%]">
            S.L.
          </th>
          <th className="px-2 py-1 border border-gray-400 text-left font-bold w-[45%]">
            Responsibility Type
          </th>
          <th className="px-2 py-1 border border-gray-400 text-left font-bold w-[50%]">
            Class/Subject
          </th>
        </tr>
      </thead>
      <tbody>
        {list.map((assignment, index) => (
          <tr key={assignment._id || index} className="even:bg-gray-100">
            <td className="px-2 py-1 border border-gray-400 text-left">
              {index + 1}
            </td>
            <td className="px-2 py-1 border border-gray-400 text-left">
              {assignment.name}
            </td>
            <td className="px-2 py-1 border border-gray-400 text-left">
              {assignment.class} - {assignment.subject}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// 🚀 Print Leaves Table
const PrintLeavesTable = ({ list }) => (
  <div className="w-full overflow-x-auto print-small-font">
    <table className="w-full text-sm border-collapse mt-2">
      <thead>
        <tr className="bg-gray-200 border-b-2 border-gray-500">
          <th className="px-2 py-1 border border-gray-400 text-left font-bold w-[5%]">
            S.L.
          </th>
          <th className="px-2 py-1 border border-gray-400 text-left font-bold w-[30%]">
            Duty Type
          </th>
          <th className="px-2 py-1 border border-gray-400 text-left font-bold w-[10%]">
            Year
          </th>
          <th className="px-2 py-1 border border-gray-400 text-left font-bold w-[55%]">
            Reason
          </th>
        </tr>
      </thead>
      <tbody>
        {list.map((leave, index) => (
          <tr key={leave._id} className="even:bg-gray-100">
            <td className="px-2 py-1 border border-gray-400 text-left">
              {index + 1}
            </td>
            <td className="px-2 py-1 border border-gray-400 text-left">
              {leave.responsibilityType.name}
            </td>
            <td className="px-2 py-1 border border-gray-400 text-left">
              {leave.year}
            </td>
            <td className="px-2 py-1 border border-gray-400 text-left">
              {leave.reason || "N/A"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const TeacherProfile = ({ teacherId }) => {
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [grantedLeaves, setGrantedLeaves] = useState([]);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [routineToEdit, setRoutineToEdit] = useState(null);
  const [routineSchedule, setRoutineSchedule] = useState([]);

  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const profileRef = useRef(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, leavesRes, routinesRes] = await Promise.all([
        getTeacherProfile(teacherId),
        getGrantedLeavesByTeacher(teacherId),
        getTeacherRoutines(teacherId),
      ]);

      setTeacherData(profileRes.data);
      setGrantedLeaves(leavesRes.data);
      setRoutineSchedule(routinesRes.data);
    } catch (error) {
      toast.error("Failed to load full profile data.");
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handlePrint = () => {
    window.print();
  };

  const handleDutyDelete = async (assignmentId) => {
    if (!window.confirm("Delete this assigned duty permanently?")) return;

    try {
      await deleteAssignmentPermanently(assignmentId);
      toast.success("Duty deleted.");
      fetchProfile();
    } catch (error) {
      toast.error("Deletion failed.");
    }
  };

  const handleDeleteLeave = async (leaveId) => {
    if (!window.confirm("Permanently delete this leave record?")) return;

    try {
      await deleteLeave(leaveId);
      toast.success("Leave deleted.");
      fetchProfile();
    } catch {
      toast.error("Failed to delete leave.");
    }
  };

  const handleEditRoutine = (routineItem) => {
    setRoutineToEdit(routineItem);
    setIsRoutineModalOpen(true);
  };

  const handleAddRoutine = () => {
    setRoutineToEdit(null);
    setIsRoutineModalOpen(true);
  };

  const handleDeleteRoutine = async (routineItem) => {
    const routineId = routineItem._id;

    if (!window.confirm(`Delete routine: ${routineItem.display}?`)) return;

    try {
      await deleteRoutine(routineId);
      toast.success("Routine deleted.");
      fetchProfile();
    } catch (error) {
      toast.error("Failed to delete routine.");
    }
  };

  if (loading) {
    return (
      <div className="text-center p-10">
        <FaSyncAlt className="animate-spin text-4xl text-indigo-500 mx-auto" />
        <p className="mt-4 text-lg text-gray-600">Loading profile data...</p>
      </div>
    );
  }

  if (!teacherData) {
    return <p className="text-center text-red-500 mt-10">Teacher not found.</p>;
  }

  const { teacherDetails, assignmentsByYear } = teacherData;

  const routineDataCurrentYear = Array.isArray(routineSchedule)
    ? routineSchedule.filter((item) => item.year === currentYear)
    : [];

  return (
    <>
      {/* 🚀 Ref for printing and modernized container */}
      <div
        ref={profileRef}
        className="max-w-6xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8 bg-white lg:bg-gray-50 rounded-xl print:pt-0"
      >
        {/* 🚀 RESPONSIVE HEADER & ACTION BUTTONS (Icon-Only on Screen) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-6 border-indigo-200">
          <h1 className="text-lg font-bold text-indigo-700 flex items-center mb-4 sm:mb-0">
            {teacherDetails.name} ({teacherDetails.teacherId})
          </h1>

          {/* Button Group: Stacks vertically on small screens */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto print-hidden">
            {/* Print Button */}
            <Button
              onClick={handlePrint}
              variant="secondary"
              className="w-full sm:w-auto print-icon-only print:p-2 print:text-base print:mr-0 print:ml-0"
              title="Print Profile" // Add title for usability
            >
              <FaPrint className="mr-2 sm:mr-0" />
            </Button>

            {/* Grant Leave Button */}
            <Button
              onClick={() => setIsLeaveModalOpen(true)}
              variant="warning"
              className="w-full sm:w-auto print-icon-only print:p-2 print:text-base print:mr-0 print:ml-0"
              title="Grant Leave"
            >
              <FaCalendarTimes className="mr-2 sm:mr-0" />
            </Button>

            {/* Edit Profile Button */}
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="primary"
              className="w-full sm:w-auto print-icon-only print:p-2 print:text-base print:mr-0 print:ml-0"
              title={isEditing ? "Cancel Edit" : "Edit Profile"}
            >
              <FaEdit className="mr-2 sm:mr-0" />{" "}
            </Button>

            {/* Back Button */}
            <Button
              onClick={() => navigate("/teachers")}
              variant="secondary"
              className="w-full sm:w-auto print-icon-only print:p-2 print:text-base print:mr-0 print:ml-0"
              title="Back to List"
            >
              <FaChevronLeft className="mr-2 sm:mr-0" />
            </Button>
          </div>
        </div>

        {isEditing ? (
          <UpdateTeacherForm
            teacherId={teacherId}
            onUpdateSuccess={() => {
              setIsEditing(false);
              fetchProfile();
            }}
          />
        ) : (
          /* 🚀 MAIN CONTENT GRID: Stacks on mobile, splits 1/3 and 2/3 on md and up */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* BASIC & LEAVES (1/3 width) */}
            <div className="md:col-span-1 space-y-6">
              {/* Basic Details Card */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 print:shadow-none print:border-gray-400">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">
                  Basic Details
                </h3>

                <p className="print-small-font">
                  <strong>Phone:</strong> {teacherDetails.phone}
                </p>
                <p className="print-small-font">
                  <strong>Campus:</strong> {teacherDetails.campus?.name}
                </p>
                <p className="print-small-font">
                  <strong>Designation:</strong> {teacherDetails.designation}
                </p>
              </div>

              {/* Granted Leaves Card */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 print:shadow-none print:border-gray-400">
                <h3 className="text-xl font-bold flex items-center mb-4 border-b pb-2">
                  <FaCalendarTimes className="mr-2 text-red-600" /> Granted
                  Leaves
                </h3>

                {grantedLeaves.length > 0 ? (
                  <>
                    {/* 1. SCREEN VIEW (List) */}
                    <ul className="space-y-3 max-h-56 overflow-y-auto pr-4 print-hidden">
                      {grantedLeaves.map((leave) => (
                        <li
                          key={leave._id}
                          className="flex justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400"
                        >
                          <span className="text-sm flex-1 mr-3">
                            {leave.responsibilityType.name} ({leave.year})
                          </span>

                          <div className="flex space-x-2 flex-shrink-0 print-hidden">
                            <button className="text-indigo-500 text-xs">
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteLeave(leave._id)}
                              className="text-red-500 text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* 2. PRINT VIEW (Table) */}
                    <div className="hidden print:block">
                      <PrintLeavesTable list={grantedLeaves} />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No granted leaves.</p>
                )}
              </div>
            </div>

            {/* RESPONSIBILITIES & ROUTINES (2/3 width) */}
            <div className="md:col-span-2 space-y-6">
              {/* Responsibility History Card */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 print:shadow-none print:border-gray-400">
                <h3 className="text-xl font-bold flex items-center mb-4 border-b pb-2">
                  <FaClipboardList className="mr-2" /> Responsibility History
                </h3>

                {assignmentsByYear?.length ? (
                  assignmentsByYear.map((yearData) => (
                    <div key={yearData._id} className="mb-3">
                      <h4 className="font-bold print-small-font">
                        {yearData._id} Assignments
                      </h4>

                      {/* 1. SCREEN VIEW (List) */}
                      <div className="print-hidden">
                        <AssignmentList
                          list={yearData.responsibilities}
                          handleDutyDelete={handleDutyDelete}
                        />
                      </div>

                      {/* 2. PRINT VIEW (Table) */}
                      <div className="hidden print:block">
                        <PrintAssignmentTable
                          list={yearData.responsibilities}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic py-5">
                    No responsibilities recorded.
                  </p>
                )}
              </div>

              {/* 🚀 ROUTINE SCHEDULE CARD IS HIDDEN ON PRINT */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 print-hidden">
                <h3 className="text-xl font-bold flex justify-between items-center mb-4 border-b pb-2">
                  <span>
                    <FaBook className="mr-2 inline" /> {currentYear} Routine
                    Schedule
                  </span>

                  <Button
                    onClick={handleAddRoutine}
                    variant="primary"
                    className="py-1 px-3 text-sm flex-shrink-0 print-hidden"
                  >
                    <FaPlus className="mr-1" /> Add Routine
                  </Button>
                </h3>

                {routineDataCurrentYear.length ? (
                  <ul className="space-y-3">
                    {routineDataCurrentYear.map((item) => (
                      <li
                        key={item._id}
                        className="flex justify-between bg-indigo-50 p-3 rounded-lg"
                      >
                        <span className="font-medium flex-1 mr-3">
                          {item.display}
                        </span>

                        <div className="flex space-x-2 flex-shrink-0 print-hidden">
                          <button
                            onClick={() => handleEditRoutine(item)}
                            className="text-yellow-600 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRoutine(item)}
                            className="text-red-600 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">
                    No routine entries for {currentYear}.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals are implicitly hidden during print by global CSS */}
      <GrantLeaveModal
        teacher={teacherDetails}
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onLeaveGrant={() => {
          setIsLeaveModalOpen(false);
          fetchProfile();
        }}
      />

      <RoutineEntryModal
        isOpen={isRoutineModalOpen}
        onClose={() => {
          setIsRoutineModalOpen(false);
          setRoutineToEdit(null);
        }}
        onSaveSuccess={fetchProfile}
        routineData={routineToEdit}
        teacherIdForNewEntry={teacherDetails._id}
      />
    </>
  );
};

export default TeacherProfile;

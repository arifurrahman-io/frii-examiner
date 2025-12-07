// FULL UPDATED CODE WITH DELETE BUTTON FIX
import React, { useState, useEffect, useCallback } from "react";
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

const AssignmentList = ({ list, handleDutyDelete }) => (
  <ul className="space-y-3 pr-4">
    {list.map((assignment, index) => (
      <li
        key={index}
        className="flex justify-between items-start p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-500"
      >
        <span className="text-sm flex-1 mr-3">
          <strong className="text-gray-800">{assignment.name}</strong>
          <span className="ml-2 text-gray-600 font-medium">
            ({assignment.class} - {assignment.subject})
          </span>
          <span
            className={`ml-3 px-2 py-0.5 rounded-full text-xs font-semibold ${
              assignment.status === "Cancelled"
                ? "bg-gray-200 text-gray-700"
                : "bg-green-200 text-green-800"
            }`}
          >
            {assignment.status}
          </span>
        </span>

        <button
          onClick={() => handleDutyDelete(assignment._id)}
          className="text-red-500 hover:text-red-700 text-xs flex items-center transition flex-shrink-0"
        >
          <FaRegWindowClose className="inline mr-1" /> Delete
        </button>
      </li>
    ))}
  </ul>
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
      <div className="max-w-6xl mx-auto space-y-8 p-6 bg-gray-50 rounded-xl">
        <div className="flex justify-between items-start border-b pb-4 mb-6 border-indigo-200">
          <h1 className="text-3xl font-bold text-indigo-700 flex items-center">
            <FaUserGraduate className="mr-3" />
            Profile: {teacherDetails.name} ({teacherDetails.teacherId})
          </h1>

          <div className="flex space-x-3">
            <Button onClick={() => setIsLeaveModalOpen(true)} variant="warning">
              Grant Leave
            </Button>

            <Button onClick={() => setIsEditing(!isEditing)} variant="primary">
              <FaEdit className="mr-2" />
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </Button>

            <Button onClick={() => navigate("/teachers")} variant="secondary">
              Back
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* BASIC & LEAVES */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">Basic Details</h3>

                <p>
                  <strong>Phone:</strong> {teacherDetails.phone}
                </p>
                <p>
                  <strong>Campus:</strong> {teacherDetails.campus?.name}
                </p>
                <p>
                  <strong>Designation:</strong> {teacherDetails.designation}
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold flex items-center mb-4">
                  <FaCalendarTimes className="mr-2" /> Granted Leaves
                </h3>

                {grantedLeaves.length > 0 ? (
                  <ul className="space-y-3 max-h-56 overflow-y-auto pr-4">
                    {grantedLeaves.map((leave) => (
                      <li
                        key={leave._id}
                        className="flex justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400"
                      >
                        <span className="text-sm flex-1 mr-3">
                          {leave.responsibilityType.name} ({leave.year})
                        </span>

                        <div className="flex space-x-2 flex-shrink-0">
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
                ) : (
                  <p className="text-sm text-gray-500">No granted leaves.</p>
                )}
              </div>
            </div>

            {/* RESPONSIBILITIES & ROUTINES */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold flex items-center mb-4">
                  <FaClipboardList className="mr-2" /> Responsibility History
                </h3>

                {assignmentsByYear?.length ? (
                  assignmentsByYear.map((yearData) => (
                    <div key={yearData._id} className="mb-3">
                      <h4 className="font-bold">{yearData._id} Assignments</h4>
                      <AssignmentList
                        list={yearData.responsibilities}
                        handleDutyDelete={handleDutyDelete}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic py-5">
                    No responsibilities recorded.
                  </p>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold flex justify-between mb-4">
                  <span>
                    <FaBook className="mr-2 inline" /> {currentYear} Routine
                    Schedule
                  </span>

                  <Button
                    onClick={handleAddRoutine}
                    variant="primary"
                    className="py-1 px-3 text-sm"
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

                        <div className="flex space-x-2 flex-shrink-0">
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

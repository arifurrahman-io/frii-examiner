// src/components/modals/RoutineEntryModal.jsx

import React from "react";
import Modal from "../ui/Modal";
import AddRoutineForm from "../forms/AddRoutineForm";

/**
 * Modal container for adding or editing a Routine entry.
 * It reuses the AddRoutineForm component.
 * * @param {boolean} isOpen - Controls visibility.
 * @param {function} onClose - Function to close the modal.
 * @param {function} onSaveSuccess - Function to refresh the profile list after a successful save.
 * @param {object} routineData - Optional: Data object (including class/subject IDs and _id) for editing.
 */
const RoutineEntryModal = ({ isOpen, onClose, onSaveSuccess, routineData }) => {
  // Determine the title based on whether routineData is provided (editing) or null (adding)
  const title = routineData
    ? `Edit Routine: ${routineData.display}`
    : "Add New Routine Entry";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="p-4">
        <p className="text-gray-600 mb-4">
          {routineData
            ? `Editing routine for ${routineData.year}. (Teacher, Class, Subject)`
            : `Manually add a new routine assignment for the teacher.`}
        </p>

        {/* Reusing AddRoutineForm */}
        <AddRoutineForm
          onSaveSuccess={() => {
            onSaveSuccess();
            onClose();
          }}
          // CRITICAL FIX: Pass routineData as initialData for editing
          initialData={routineData}
        />
      </div>
    </Modal>
  );
};

export default RoutineEntryModal;

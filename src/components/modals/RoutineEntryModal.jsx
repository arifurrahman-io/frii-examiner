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

  // Note: The AddRoutineForm component currently only supports adding (POST),
  // so for "Edit" functionality, you would typically pass initial data to a modified form
  // and use a PUT request. For simplicity, this initial version supports only adding/viewing.

  // In a full implementation, you'd pass a prop to AddRoutineForm to load initial data.

  // For now, we only allow adding/viewing the modal title.

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="p-4">
        <p className="text-gray-600 mb-4">
          {routineData
            ? `Editing routine for ${routineData.year}. (Teacher, Class, Subject)`
            : `Manually add a new routine assignment for the teacher.`}
        </p>

        {/* Reusing AddRoutineForm */}
        {/* Note: In a real scenario, AddRoutineForm should be updated to accept initialData and perform PUT for edit */}
        <AddRoutineForm
          onSaveSuccess={() => {
            onSaveSuccess();
            onClose();
          }}
          // initialData={routineData} // Uncomment and implement in AddRoutineForm for true edit functionality
        />
      </div>
    </Modal>
  );
};

export default RoutineEntryModal;

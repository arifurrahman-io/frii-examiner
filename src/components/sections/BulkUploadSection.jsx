// arifurrahman-io/frii-examiner/frii-examiner-94b444a3277f392cde2a42af87c32a9043a874f2/src/components/sections/BulkUploadSection.jsx

import React, { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { FaUpload, FaFileExcel, FaSyncAlt } from "react-icons/fa";
import Button from "../ui/Button";
import { uploadBulkTeachers } from "../../api/apiService";

// --- C. Bulk Upload Section Component ---
const BulkUploadSection = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false); // NEW STATE for drag styling

  // Handler for file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setBulkErrors([]);
    }
  };

  // DRAG HANDLERS
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange({ target: { files: files } });
    }
  }, []);

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an Excel file first.");
      return;
    }

    setUploading(true);
    setBulkErrors([]);
    const formData = new FormData();
    formData.append("excelFile", selectedFile);

    try {
      const { data } = await uploadBulkTeachers(formData);

      if (data.errors && data.errors.length > 0) {
        toast.warn(
          `${data.savedCount} teachers saved, but ${data.errors.length} rows had errors.`
        );
        setBulkErrors(data.errors);
      } else {
        toast.success(data.message || "Bulk upload completed successfully.");
      }

      setSelectedFile(null);
      onUploadSuccess();
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Bulk upload failed due to server error.";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    // Container: Using border-gray-200 for clean look.
    <div className="p-6 bg-white rounded-xl border border-gray-200 h-full">
      <h3 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center">
        <FaFileExcel className="mr-3 text-green-600" />
        Bulk Upload Teachers
      </h3>

      <div className="space-y-6">
        {" "}
        {/* Increased vertical space */}
        {/* Hidden File Input */}
        <input
          id="teacher-excel-upload"
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="hidden"
        />
        {/* 💡 MODERN DRAG-AND-DROP ZONE */}
        <div
          className={`flex flex-col items-center justify-center p-8 border-2 rounded-xl h-40 transition duration-300 cursor-pointer ${
            isDragOver
              ? "border-indigo-600 bg-indigo-50/50"
              : selectedFile
              ? "border-green-400 bg-green-50"
              : "border-dashed border-gray-300 hover:border-indigo-400 bg-gray-50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() =>
            document.getElementById("teacher-excel-upload").click()
          }
        >
          {/* Content based on file state */}
          {selectedFile ? (
            <>
              <FaFileExcel className="text-4xl text-green-600 mb-2" />
              <p className="font-semibold text-gray-800">{selectedFile.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                Ready for upload. Click Upload button below.
              </p>
            </>
          ) : (
            <>
              <FaUpload className="text-4xl text-indigo-500 mb-2" />
              <p className="text-lg text-gray-600 font-medium">
                Drag files here or{" "}
                <span className="text-indigo-600 font-bold hover:text-indigo-700">
                  browse
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Accepts .xlsx and .xls files
              </p>
            </>
          )}
        </div>
        <Button
          onClick={handleBulkUpload}
          fullWidth
          loading={uploading}
          // Changed variant to 'primary' (indigo) for the prominent blue action button
          variant="primary"
          disabled={!selectedFile}
        >
          <FaUpload className="mr-2" />
          UPLOAD AND SAVE DATA
        </Button>
      </div>

      {bulkErrors.length > 0 && (
        <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg max-h-48 overflow-y-auto">
          <h4 className="font-semibold text-red-700">Upload Errors:</h4>
          <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
            {bulkErrors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-sm text-gray-500 mt-6 border-t pt-4 italic">
        **Required Excel Columns (Headers):** teacherId, name, phone, campus,
        password (Optional), designation (Optional).
      </p>
    </div>
  );
};

export default BulkUploadSection;

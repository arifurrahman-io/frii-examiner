import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaUpload, FaFileExcel, FaSyncAlt } from "react-icons/fa";
import Button from "../ui/Button";
import { uploadBulkTeachers } from "../../api/apiService";

// --- C. Bulk Upload Section Component ---
const BulkUploadSection = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [bulkErrors, setBulkErrors] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setBulkErrors([]);
    }
  };

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
    <div className="p-6 bg-white rounded-xl shadow-2xl border border-gray-100 h-full">
      <h3 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center">
        <FaFileExcel className="mr-3 text-green-600" />
        Bulk Upload Teachers
      </h3>

      <div className="space-y-4">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500"
        />

        {selectedFile && (
          <p className="text-sm font-medium text-gray-700 bg-indigo-50 p-2 rounded-lg">
            Selected: {selectedFile.name}
          </p>
        )}

        <Button
          onClick={handleBulkUpload}
          fullWidth
          loading={uploading}
          variant="success"
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

import React, { useCallback, useState } from "react";
import toast from "react-hot-toast";
import {
  FaCloudUploadAlt,
  FaExclamationTriangle,
  FaFileExcel,
  FaSyncAlt,
  FaUpload,
} from "react-icons/fa";
import { uploadBulkTeachers } from "../../api/apiService";

const BulkUploadSection = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.name.endsWith(".xls") || file.name.endsWith(".xlsx"))) {
      setSelectedFile(file);
      setBulkErrors([]);
      toast.success(`${file.name} ready.`);
    } else {
      setSelectedFile(null);
      toast.error("Invalid file. Use .xlsx or .xls.");
    }
  };

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = event.dataTransfer.files;
    if (files?.length) handleFileChange({ target: { files } });
  }, []);

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      toast.error("Select an Excel file first.");
      return;
    }

    setUploading(true);
    setBulkErrors([]);
    const formData = new FormData();
    formData.append("excelFile", selectedFile);

    try {
      const { data } = await uploadBulkTeachers(formData);
      if (data.errors?.length) {
        toast.error(`${data.savedCount} added, ${data.errors.length} failed.`);
        setBulkErrors(data.errors);
      } else {
        toast.success(data.message || "Bulk add completed.");
      }

      setSelectedFile(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        id="teacher-excel-upload"
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        className={`flex min-h-[180px] w-full flex-col items-center justify-center rounded-lg border-2 p-6 text-center transition-colors ${
          isDragOver
            ? "border-teal-700 bg-teal-50"
            : selectedFile
            ? "border-teal-200 bg-teal-50"
            : "border-dashed border-slate-300 bg-slate-50 hover:border-teal-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("teacher-excel-upload").click()}
      >
        <div className="grid h-14 w-14 place-items-center rounded-lg bg-white text-teal-700">
          {selectedFile ? <FaFileExcel size={24} /> : <FaCloudUploadAlt size={26} />}
        </div>
        <p className="mt-4 max-w-[280px] text-sm font-bold text-slate-800">
          {selectedFile ? selectedFile.name : "Drop Excel file or browse"}
        </p>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Accepts .xlsx and .xls files
        </p>
      </button>

      <button
        type="button"
        onClick={handleBulkUpload}
        disabled={!selectedFile || uploading}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {uploading ? <FaSyncAlt className="animate-spin" /> : <FaUpload />}
        Upload Teachers
      </button>

      {bulkErrors.length > 0 && (
        <div className="rounded-lg border border-rose-100 bg-rose-50 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-rose-600">
            <FaExclamationTriangle />
            Upload errors
          </div>
          <ul className="max-h-40 space-y-2 overflow-y-auto text-xs font-semibold text-rose-600">
            {bulkErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BulkUploadSection;

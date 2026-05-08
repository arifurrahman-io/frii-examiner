import React, { useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FaUpload,
  FaFileExcel,
  FaSyncAlt,
  FaCloudUploadAlt,
  FaExclamationTriangle,
  FaTerminal,
  FaInfoCircle,
} from "react-icons/fa";
import Button from "../ui/Button";
import { uploadBulkTeachers } from "../../api/apiService";

const BulkUploadSection = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith(".xls") || file.name.endsWith(".xlsx"))) {
      setSelectedFile(file);
      setBulkErrors([]);
      toast.success(`${file.name} ready for add.`);
    } else {
      setSelectedFile(null);
      toast.error("Invalid file. Use .xlsx or .xls.");
    }
  };

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
      handleFileChange({ target: { files } });
    }
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

      if (data.errors && data.errors.length > 0) {
        toast.warn(`${data.savedCount} indexed, ${data.errors.length} failed.`);
        setBulkErrors(data.errors);
      } else {
        toast.success(data.message || "Bulk add completed successfully.");
      }

      setSelectedFile(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Critical upload failure.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-1 shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col group transition-all duration-200 hover:shadow-md">
      <div className="p-8 md:p-10 flex-grow space-y-8">
        {/* --- UNIFIED HEADER --- */}
        <div className="flex items-center gap-5 border-b border-slate-50 pb-8">
          <div className="h-14 w-14 bg-emerald-700 rounded-xl flex items-center justify-center text-white">
            <FaFileExcel size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
              Bulk Add
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-2 flex items-center gap-2">
              <FaTerminal className="text-emerald-700" /> Spreadsheet import
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <input
            id="teacher-excel-upload"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* --- MODERN INTERACTIVE DROPZONE --- */}
          <div
            className={`relative flex flex-col items-center justify-center p-10 border-2 rounded-[2.5rem] min-h-[220px] transition-all duration-500 cursor-pointer overflow-hidden ${
              isDragOver
                ? "border-indigo-600 bg-indigo-50/50 scale-[0.98]"
                : selectedFile
                ? "border-emerald-400 bg-emerald-50/30"
                : "border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() =>
              document.getElementById("teacher-excel-upload").click()
            }
          >
            {selectedFile ? (
              <div className="text-center animate-in zoom-in-95">
                <div className="h-20 w-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-emerald-200 rotate-6">
                  <FaFileExcel size={30} />
                </div>
                <p className="font-black text-slate-800 text-sm uppercase tracking-tighter truncate max-w-[250px]">
                  {selectedFile.name}
                </p>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-2 block italic">
                  File ready
                </span>
              </div>
            ) : (
              <div className="text-center group-hover:scale-105 transition-transform duration-500">
                <div className="h-20 w-20 bg-white rounded-[2rem] flex items-center justify-center text-indigo-500 mx-auto mb-4 shadow-lg border border-slate-50">
                  <FaCloudUploadAlt size={35} />
                </div>
                <p className="text-sm font-black text-slate-700 uppercase tracking-tighter">
                  Drop Excel file or{" "}
                  <span className="text-emerald-700 underline">Browse</span>
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3">
                  Accepts .xlsx and .xls files
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={handleBulkUpload}
            fullWidth
            loading={uploading}
            variant="primary"
            disabled={!selectedFile || uploading}
            className="rounded-xl py-5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-3 transition-colors"
          >
            {uploading ? (
              <FaSyncAlt className="animate-spin" />
            ) : (
              <>
                <FaUpload size={14} /> Upload teachers
              </>
            )}
          </Button>
        </div>

        {/* --- ERROR CONSOLE --- */}
        {bulkErrors.length > 0 && (
          <div className="mt-8 bg-rose-50 border border-rose-100 rounded-[2rem] p-6 animate-in slide-in-from-top-4">
            <div className="flex items-center gap-3 mb-4 text-rose-600">
              <FaExclamationTriangle />
              <h4 className="text-[10px] font-black uppercase tracking-widest">
                Upload errors
              </h4>
            </div>
            <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {bulkErrors.map((err, index) => (
                <li
                  key={index}
                  className="text-[10px] font-bold text-rose-500 bg-white/50 p-2 rounded-xl flex items-center gap-2"
                >
                  <span className="h-1 w-1 rounded-full bg-rose-400"></span>
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex items-start gap-4 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
          <FaInfoCircle className="text-indigo-400 mt-1" size={14} />
          <p className="text-[9px] font-bold text-indigo-900 uppercase tracking-widest leading-relaxed">
            <span className="text-emerald-700">Required columns:</span>{" "}
            teacherId, name, phone, campus, designation. Verify headers match
            the teacher import format.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadSection;

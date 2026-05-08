import React, { useState, useCallback } from "react";
import {
  FaCalendarAlt,
  FaFileExcel,
  FaUpload,
  FaSyncAlt,
  FaCloudUploadAlt,
  FaInfoCircle,
  FaTerminal,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserPlus,
} from "react-icons/fa";
import toast from "react-hot-toast";
import AddRoutineForm from "../components/forms/AddRoutineForm";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { uploadRoutineExcel } from "../api/apiService";

const RoutineSetupPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [duplicateMode, setDuplicateMode] = useState("skip");
  const [uploadResult, setUploadResult] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith(".xls") || file.name.endsWith(".xlsx"))) {
      setSelectedFile(file);
      toast.success(`${file.name} selected.`);
    } else {
      setSelectedFile(null);
      toast.error("Invalid file format. Use .xlsx");
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
    if (files?.length > 0) handleFileChange({ target: { files } });
  }, []);

  const handleExcelUpload = async () => {
    if (!selectedFile) return toast.error("Select a file first.");
    setUploading(true);
    setUploadResult(null);
    setUploadProgress(0);
    setIsUploadModalOpen(true);
    const formData = new FormData();
    formData.append("excelFile", selectedFile);
    formData.append("duplicateMode", duplicateMode);

    try {
      const response = await uploadRoutineExcel(formData, {
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(Math.min(percent, 95));
        },
      });
      const { uploadedCount, savedRoutinesCount, errors } = response.data;
      setUploadProgress(100);
      setUploadResult(response.data);
      toast.success(
        `Success: ${uploadedCount ?? savedRoutinesCount ?? 0} routines indexed.`
      );
      if (errors?.length > 0) toast.error(`${errors.length} records failed.`);
      setSelectedFile(null);
    } catch (error) {
      const message = error.response?.data?.message || "Upload failed.";
      setUploadResult({ message, errors: [message], failed: true });
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleManualSaveSuccess = () => {
    toast.success("Routine synchronized.");
  };

  return (
    <div className="min-h-screen bg-transparent pb-10 pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* --- HEADER --- */}
        <div className="mb-8 sm:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl flex-shrink-0">
              <FaCalendarAlt className="text-xl sm:text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none mb-1 sm:mb-2 uppercase">
                Routine setup
              </h1>
              <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.4em]">
                Manage institutional schedules
              </p>
            </div>
          </div>

          <div className="self-start md:self-auto px-4 sm:px-6 py-2 sm:py-3 bg-white rounded-xl sm:rounded-2xl border border-indigo-50 shadow-sm flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Ready
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
          {/* --- LEFT: MANUAL ENTRY --- */}
          <div className="lg:col-span-6 animate-in slide-in-from-bottom-4 md:slide-in-from-left-10 duration-700">
            <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-white h-full relative group overflow-hidden">
              <div className="flex items-center gap-3 mb-6 sm:mb-8 border-b border-slate-50 pb-4 sm:pb-6">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-indigo-50 rounded-lg sm:rounded-xl flex items-center justify-center text-indigo-600">
                  <FaTerminal className="text-sm sm:text-base" />
                </div>
                <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest">
                  Manual entry
                </h3>
              </div>
              <AddRoutineForm onSaveSuccess={handleManualSaveSuccess} />
            </div>
          </div>

          {/* --- RIGHT: BULK UPLOAD --- */}
          <div className="lg:col-span-6 animate-in slide-in-from-bottom-4 md:slide-in-from-right-10 duration-700">
            <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-slate-100 h-full flex flex-col justify-between group transition-all">
              <div>
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2 sm:gap-3">
                    <FaFileExcel className="text-emerald-500" /> Bulk Add
                  </h3>
                  <span className="text-[8px] sm:text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg uppercase tracking-widest">
                    Excel Support
                  </span>
                </div>

                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 sm:mb-8 leading-relaxed">
                  Fast-track routine population using system-ready spreadsheet
                  templates.
                </p>

                {/* --- MODERN INTERACTIVE DROPZONE --- */}
                <div
                  className={`relative flex flex-col items-center justify-center p-6 sm:p-10 border-2 rounded-[1.5rem] sm:rounded-[2.5rem] min-h-[180px] sm:min-h-[220px] transition-all duration-500 cursor-pointer overflow-hidden ${
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
                    document.getElementById("routine-excel-upload").click()
                  }
                >
                  <input
                    id="routine-excel-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="text-center animate-in zoom-in-95">
                      <div className="h-14 w-14 sm:h-20 sm:w-20 bg-emerald-500 rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-white mx-auto mb-3 sm:mb-4 shadow-xl shadow-emerald-200 rotate-3">
                        <FaFileExcel className="text-xl sm:text-3xl" />
                      </div>
                      <p className="font-black text-slate-800 text-[11px] sm:text-sm uppercase tracking-tighter truncate max-w-[180px] sm:max-w-[250px]">
                        {selectedFile.name}
                      </p>
                      <span className="text-[8px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1 sm:mt-2 block italic">
                        Ready for synchronization
                      </span>
                    </div>
                  ) : (
                    <div className="text-center group-hover:scale-105 transition-transform duration-500">
                      <div className="h-14 w-14 sm:h-20 sm:w-20 bg-white rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-indigo-500 mx-auto mb-3 sm:mb-4 shadow-lg border border-slate-50">
                        <FaCloudUploadAlt className="text-2xl sm:text-4xl" />
                      </div>
                      <p className="text-[11px] sm:text-sm font-black text-slate-700 uppercase tracking-tighter">
                        Drop Excel file or{" "}
                        <span className="text-indigo-600 underline">
                          Browse
                        </span>
                      </p>
                      <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 sm:mt-3">
                        Accepts .xlsx and .xls files
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* --- ACTION AREA --- */}
              <div className="mt-8 sm:mt-10">
                <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-2 border border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDuplicateMode("skip")}
                    className={`rounded-xl px-3 py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                      duplicateMode === "skip"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    Skip Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuplicateMode("overwrite")}
                    className={`rounded-xl px-3 py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                      duplicateMode === "overwrite"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    Overwrite
                  </button>
                </div>

                <Button
                  onClick={handleExcelUpload}
                  fullWidth
                  variant="success"
                  loading={uploading}
                  disabled={!selectedFile || uploading}
                  className="rounded-xl sm:rounded-[1.5rem] py-4 sm:py-5 bg-slate-900 hover:bg-indigo-600 text-white font-black text-[9px] sm:text-[11px] tracking-[0.1em] sm:tracking-[0.2em] transition-all active:scale-95 border-none"
                >
                  <FaUpload className="mr-2 sm:mr-3" /> Upload routines
                </Button>

                <div className="mt-4 sm:mt-6 flex items-start gap-2 sm:gap-3 p-4 sm:p-5 bg-indigo-50/50 rounded-xl sm:rounded-2xl border border-indigo-100/50">
                  <FaInfoCircle className="text-indigo-400 mt-0.5" size={12} />
                  <p className="text-[8px] sm:text-[9px] font-bold text-indigo-900 uppercase tracking-widest leading-relaxed">
                    <span className="text-indigo-600">Format:</span> TeacherID,
                    TeacherName, BranchName, ClassName, SubjectName, Year.
                    TeacherName is required only when the teacher ID is new.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => !uploading && setIsUploadModalOpen(false)}
        title="Routine Upload Status"
      >
        {uploading ? (
          <div className="py-8 text-center">
            <FaSyncAlt className="mx-auto mb-5 text-4xl text-indigo-600 animate-spin" />
            <p className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Processing Excel routines
            </p>
            <div className="mx-auto mt-6 max-w-sm">
              <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span>Upload Progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Routine work percentage appears when processing finishes.
            </p>
          </div>
        ) : uploadResult ? (
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              {uploadResult.failed ? (
                <FaExclamationTriangle className="mt-1 text-red-500" />
              ) : (
                <FaCheckCircle className="mt-1 text-emerald-500" />
              )}
              <div>
                <p className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  {uploadResult.message || "Bulk routine upload completed."}
                </p>
                <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Duplicate mode:{" "}
                  {uploadResult.duplicateMode === "overwrite"
                    ? "Overwrite"
                    : "Skip existing"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
              <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-indigo-700">
                <span>Total Routine Work</span>
                <span>{uploadResult.progressPercentage ?? 0}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-indigo-600"
                  style={{
                    width: `${uploadResult.progressPercentage ?? 0}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                Processed {uploadResult.processedCount ?? 0} of{" "}
                {uploadResult.totalRows ?? 0} rows
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                ["Total Rows", uploadResult.totalRows ?? 0, "text-slate-900"],
                [
                  "New Teachers",
                  uploadResult.createdTeachersCount ?? 0,
                  "text-emerald-600",
                  FaUserPlus,
                ],
                [
                  "Campus Updated",
                  uploadResult.updatedTeacherCampusesCount ?? 0,
                  "text-cyan-600",
                ],
                [
                  "Uploaded",
                  uploadResult.uploadedCount ??
                    uploadResult.savedRoutinesCount ??
                    0,
                  "text-emerald-600",
                ],
                [
                  "Remaining",
                  uploadResult.remainingCount ??
                    ((uploadResult.skippedCount || 0) +
                      (uploadResult.failedCount || 0)),
                  "text-amber-600",
                ],
                ["Skipped", uploadResult.skippedCount ?? 0, "text-indigo-600"],
                [
                  "Overwritten",
                  uploadResult.overwrittenCount ?? 0,
                  "text-violet-600",
                ],
                ["Failed", uploadResult.failedCount ?? 0, "text-red-600"],
              ].map(([label, value, color, Icon]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-2">
                    {Icon ? <Icon className="text-emerald-500" size={12} /> : null}
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {label}
                    </p>
                  </div>
                  <p className={`mt-2 text-2xl font-black ${color}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {uploadResult.errors?.length > 0 && (
              <div className="max-h-44 overflow-y-auto rounded-2xl border border-red-100 bg-red-50/60 p-4">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-red-600">
                  Remaining or failed rows
                </p>
                <ul className="space-y-1 text-[11px] font-semibold text-red-700">
                  {uploadResult.errors.slice(0, 25).map((err, index) => (
                    <li key={`${err}-${index}`}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

    </div>
  );
};

export default RoutineSetupPage;

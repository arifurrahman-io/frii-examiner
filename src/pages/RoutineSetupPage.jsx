import React, { useCallback, useState } from "react";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaCloudUploadAlt,
  FaExclamationTriangle,
  FaFileExcel,
  FaInfoCircle,
  FaPlus,
  FaShieldAlt,
  FaSyncAlt,
  FaUpload,
  FaUserPlus,
} from "react-icons/fa";
import toast from "react-hot-toast";
import AddRoutineForm from "../components/forms/AddRoutineForm";
import Modal from "../components/ui/Modal";
import { uploadRoutineExcel } from "../api/apiService";

const UploadMetric = ({ label, value, tone = "text-slate-900", icon: Icon }) => (
  <div className="border border-slate-200 bg-white p-4">
    <div className="flex items-center gap-2">
      {Icon ? <Icon className="text-teal-700" size={12} /> : null}
      <p className="text-xs font-medium text-slate-500">{label}</p>
    </div>
    <p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p>
  </div>
);

const RoutineSetupPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [duplicateMode, setDuplicateMode] = useState("skip");
  const [uploadResult, setUploadResult] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.name.endsWith(".xls") || file.name.endsWith(".xlsx"))) {
      setSelectedFile(file);
      toast.success(`${file.name} selected.`);
    } else {
      setSelectedFile(null);
      toast.error("Invalid file format. Use .xlsx or .xls.");
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
    <div className="min-h-screen bg-transparent px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 flex-none place-items-center rounded-lg bg-slate-900 text-white">
              <FaCalendarAlt />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Routine Setup
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Add teacher routines manually or import from Excel
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600">
            <span className="h-2 w-2 rounded-full bg-teal-600" />
            Ready
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <UploadMetric label="Manual entry" value="Single" icon={FaPlus} />
          <UploadMetric label="Bulk import" value="Excel" icon={FaFileExcel} />
          <UploadMetric
            label="Duplicate mode"
            value={duplicateMode === "overwrite" ? "Overwrite" : "Skip"}
            icon={FaShieldAlt}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <section className="border border-slate-200 bg-white p-5">
            <div className="mb-5 flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-teal-700">
                <FaCalendarAlt />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Manual Routine Entry
                </h2>
                <p className="text-sm text-slate-500">
                  Assign one class and subject to one teacher
                </p>
              </div>
            </div>
            <AddRoutineForm onSaveSuccess={handleManualSaveSuccess} />
          </section>

          <aside className="space-y-6">
            <section className="border border-slate-200 bg-white p-5">
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-teal-700">
                    <FaCloudUploadAlt />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Bulk Routine Import
                    </h2>
                    <p className="text-sm text-slate-500">
                      Upload .xlsx or .xls routine sheets
                    </p>
                  </div>
                </div>
              </div>

              <input
                id="routine-excel-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                className={`flex min-h-[190px] w-full flex-col items-center justify-center rounded-lg border-2 p-6 text-center transition-colors ${
                  isDragOver
                    ? "border-teal-700 bg-teal-50"
                    : selectedFile
                    ? "border-teal-200 bg-teal-50"
                    : "border-dashed border-slate-300 bg-slate-50 hover:border-teal-300"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() =>
                  document.getElementById("routine-excel-upload").click()
                }
              >
                <div className="grid h-14 w-14 place-items-center rounded-lg bg-white text-teal-700">
                  {selectedFile ? <FaFileExcel size={24} /> : <FaCloudUploadAlt size={26} />}
                </div>
                <p className="mt-4 max-w-[280px] text-sm font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : "Drop Excel file or browse"}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  TeacherID, TeacherName, BranchName, ClassName, SubjectName, Year
                </p>
              </button>

              <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setDuplicateMode("skip")}
                  className={`rounded-md px-3 py-2 text-sm font-semibold ${
                    duplicateMode === "skip"
                      ? "bg-white text-slate-900"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Skip Existing
                </button>
                <button
                  type="button"
                  onClick={() => setDuplicateMode("overwrite")}
                  className={`rounded-md px-3 py-2 text-sm font-semibold ${
                    duplicateMode === "overwrite"
                      ? "bg-white text-slate-900"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Overwrite
                </button>
              </div>

              <button
                type="button"
                onClick={handleExcelUpload}
                disabled={!selectedFile || uploading}
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
              >
                {uploading ? <FaSyncAlt className="animate-spin" /> : <FaUpload />}
                Upload Routines
              </button>
            </section>

            <section className="border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-500">
                  <FaInfoCircle />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Import notes</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Use skip mode to preserve existing routines. Use overwrite
                    mode only when the spreadsheet should replace matching
                    teacher, class, subject, and year entries.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>

      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => !uploading && setIsUploadModalOpen(false)}
        title="Routine Upload Status"
      >
        {uploading ? (
          <div className="py-8 text-center">
            <FaSyncAlt className="mx-auto mb-5 animate-spin text-4xl text-teal-700" />
            <p className="text-sm font-bold text-slate-900">
              Processing Excel routines
            </p>
            <div className="mx-auto mt-6 max-w-sm">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Upload Progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-teal-700 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : uploadResult ? (
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              {uploadResult.failed ? (
                <FaExclamationTriangle className="mt-1 text-rose-500" />
              ) : (
                <FaCheckCircle className="mt-1 text-teal-700" />
              )}
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {uploadResult.message || "Bulk routine upload completed."}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Duplicate mode:{" "}
                  {uploadResult.duplicateMode === "overwrite"
                    ? "Overwrite"
                    : "Skip existing"}
                </p>
              </div>
            </div>

            <div className="border border-teal-100 bg-teal-50 p-4">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-teal-700">
                <span>Total Routine Work</span>
                <span>{uploadResult.progressPercentage ?? 0}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-teal-700"
                  style={{
                    width: `${uploadResult.progressPercentage ?? 0}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs font-medium text-teal-700">
                Processed {uploadResult.processedCount ?? 0} of{" "}
                {uploadResult.totalRows ?? 0} rows
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <UploadMetric label="Total Rows" value={uploadResult.totalRows ?? 0} />
              <UploadMetric
                label="New Teachers"
                value={uploadResult.createdTeachersCount ?? 0}
                tone="text-teal-700"
                icon={FaUserPlus}
              />
              <UploadMetric
                label="Campus Updated"
                value={uploadResult.updatedTeacherCampusesCount ?? 0}
              />
              <UploadMetric
                label="Uploaded"
                value={
                  uploadResult.uploadedCount ??
                  uploadResult.savedRoutinesCount ??
                  0
                }
                tone="text-teal-700"
              />
              <UploadMetric
                label="Remaining"
                value={
                  uploadResult.remainingCount ??
                  (uploadResult.skippedCount || 0) +
                    (uploadResult.failedCount || 0)
                }
              />
              <UploadMetric label="Skipped" value={uploadResult.skippedCount ?? 0} />
              <UploadMetric
                label="Overwritten"
                value={uploadResult.overwrittenCount ?? 0}
              />
              <UploadMetric
                label="Failed"
                value={uploadResult.failedCount ?? 0}
                tone="text-rose-600"
              />
            </div>

            {uploadResult.errors?.length > 0 && (
              <div className="max-h-44 overflow-y-auto border border-rose-100 bg-rose-50 p-4">
                <p className="mb-2 text-xs font-bold text-rose-600">
                  Remaining or failed rows
                </p>
                <ul className="space-y-1 text-xs font-semibold text-rose-700">
                  {uploadResult.errors.slice(0, 25).map((error, index) => (
                    <li key={`${error}-${index}`}>{error}</li>
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

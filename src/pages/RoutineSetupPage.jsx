import React, { useState, useCallback } from "react";
import {
  FaCalendarAlt,
  FaFileExcel,
  FaUpload,
  FaSyncAlt,
  FaCloudUploadAlt,
  FaInfoCircle,
  FaTerminal,
} from "react-icons/fa";
import toast from "react-hot-toast";
import AddRoutineForm from "../components/forms/AddRoutineForm";
import Button from "../components/ui/Button";
import { uploadRoutineExcel } from "../api/apiService";

const RoutineSetupPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

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
    const formData = new FormData();
    formData.append("excelFile", selectedFile);

    try {
      const response = await uploadRoutineExcel(formData);
      const { savedRoutinesCount, errors } = response.data;
      toast.success(`Success: ${savedRoutinesCount} routines indexed.`);
      if (errors?.length > 0) toast.error(`${errors.length} records failed.`);
      setSelectedFile(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleManualSaveSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 pt-20 sm:pt-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* --- HEADER --- */}
        <div className="mb-8 sm:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl flex-shrink-0">
              <FaCalendarAlt className="text-xl sm:text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none mb-1 sm:mb-2 uppercase">
                Schedule Engine <span className="text-indigo-600">.</span>
              </h1>
              <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.4em]">
                Initialize Institutional Routines
              </p>
            </div>
          </div>

          <div className="self-start md:self-auto px-4 sm:px-6 py-2 sm:py-3 bg-white rounded-xl sm:rounded-2xl border border-indigo-50 shadow-sm flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Core Synchronized
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
                  Manual Entry Console
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
                    accept=".xlsx"
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
                        Drop Excel Node or{" "}
                        <span className="text-indigo-600 underline">
                          Browse
                        </span>
                      </p>
                      <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 sm:mt-3">
                        Accepts .XLSX Matrix only
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* --- ACTION AREA --- */}
              <div className="mt-8 sm:mt-10">
                <Button
                  onClick={handleExcelUpload}
                  fullWidth
                  variant="success"
                  loading={uploading}
                  disabled={!selectedFile || uploading}
                  className="rounded-xl sm:rounded-[1.5rem] py-4 sm:py-5 bg-slate-900 hover:bg-indigo-600 text-white font-black text-[9px] sm:text-[11px] tracking-[0.1em] sm:tracking-[0.2em] transition-all active:scale-95 border-none"
                >
                  <FaUpload className="mr-2 sm:mr-3" /> INITIALIZE BULK UPLOAD
                </Button>

                <div className="mt-4 sm:mt-6 flex items-start gap-2 sm:gap-3 p-4 sm:p-5 bg-indigo-50/50 rounded-xl sm:rounded-2xl border border-indigo-100/50">
                  <FaInfoCircle className="text-indigo-400 mt-0.5" size={12} />
                  <p className="text-[8px] sm:text-[9px] font-bold text-indigo-900 uppercase tracking-widest leading-relaxed">
                    <span className="text-indigo-600">Format:</span> TeacherID,
                    Name, Phone, Branch, Class, Subject. Ensure master data
                    matches perfectly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-12 sm:mt-20 text-center opacity-20 px-4">
        <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] sm:tracking-[1em] leading-relaxed">
          Authorized Governance Matrix
        </p>
      </div>
    </div>
  );
};

export default RoutineSetupPage;

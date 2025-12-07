// arifurrahman-io/frii-examiner/frii-examiner-94b444a3277f392cde2a42af87c32a9043a874f2/src/pages/RoutineSetupPage.jsx

import React, { useState, useCallback } from "react";
import {
  FaCalendarAlt,
  FaFileExcel,
  FaUpload,
  FaSyncAlt,
  FaCloudUploadAlt, // Using a cloud icon for visual appeal
} from "react-icons/fa";
import toast from "react-hot-toast";
import AddRoutineForm from "../components/forms/AddRoutineForm";
import Button from "../components/ui/Button";

// ✅ CORRECTED IMPORT PATH
import SelectDropdown from "../components/ui/SelectDropdown";

// ✅ IMPORT the API function for bulk upload
import { uploadRoutineExcel } from "../api/apiService";

// 🚀 CLEANUP: Remove useDebounce import

const RoutineSetupPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  // 🚀 CLEANUP: Remove searchTerm and debouncedSearchTerm states

  // --- ১. এক্সেল ফাইল হ্যান্ডলিং ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      (file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".xlsx"))
    ) {
      setSelectedFile(file);
      toast.success(`${file.name} selected for upload.`);
    } else {
      setSelectedFile(null);
      toast.error("Please select a valid .xlsx file.");
    }
  };

  // NEW DRAG HANDLERS (Basic implementation for visual feedback)
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

  // --- ২. এক্সেল ফাইল আপলোড লজিক (INTEGRATED) ---
  const handleExcelUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an Excel file first.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("excelFile", selectedFile);

    try {
      const response = await uploadRoutineExcel(formData);

      const { savedTeachersCount, savedRoutinesCount, errors } = response.data;

      let successMessage = `Bulk upload complete: ${savedRoutinesCount} routines saved.`;

      if (savedTeachersCount > 0) {
        successMessage += ` (${savedTeachersCount} new teachers created).`;
      }

      if (errors.length > 0) {
        successMessage += ` ${errors.length} records failed due to conflicts or missing data.`;
        toast.error(successMessage, { duration: 8000 });
      } else {
        toast.success(successMessage);
      }

      setSelectedFile(null);

      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Bulk upload failed. Check the file format.";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // --- ৩. ম্যানুয়াল সেভ সফল হলে তালিকা রিফ্রেশ করা ---
  const handleManualSaveSuccess = () => {
    toast.success("Routine added. Refreshing list...");
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="p-4">
      {/* 🚀 MODERNIZE HEADER */}
      <h2 className="text-xl font-extrabold text-indigo-800 mb-8 flex items-center border-b-4 border-indigo-300 pb-2">
        <FaCalendarAlt className="mr-3 text-xl text-indigo-600" />
        Academic Routine Setup
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* বাম কলাম: ম্যানুয়াল এন্ট্রি (Uses clean styling from AddRoutineForm) */}
        <div className="lg:col-span-1">
          {/* 🚀 CLEANUP: Removed the search bar JSX from here */}

          <AddRoutineForm
            onSaveSuccess={handleManualSaveSuccess}
            // 🚀 CLEANUP: Removed searchTerm prop
          />
        </div>

        {/* ডান কলাম: এক্সেল আপলোড (Modernized Card) */}
        <div className="lg:col-span-1 p-6 bg-white rounded-xl border border-gray-200 h-full flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center">
              <FaFileExcel className="mr-2 text-2xl text-green-600" />
              Routine Bulk Upload (Excel)
            </h3>

            <p className="text-gray-600 mb-6">
              Upload routine data using a pre-defined Excel format to quickly
              update the system.
            </p>

            {/* 💡 MODERN FILE UPLOAD SECTION (DRAG/DROP AESTHETIC) */}
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
                document.getElementById("routine-excel-upload").click()
              }
            >
              <input
                id="routine-excel-upload"
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="hidden" // Hide the default input
              />

              {/* Content based on file state */}
              {selectedFile ? (
                <>
                  <FaFileExcel className="text-4xl text-green-600 mb-2" />
                  <p className="font-semibold text-gray-800">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Click to select a different file.
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
                    Accepts .xlsx files only
                  </p>
                </>
              )}
            </div>
          </div>

          {/* আপলোড বাটন and Footer instructions */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Button
              onClick={handleExcelUpload}
              fullWidth
              variant="success"
              loading={uploading}
              disabled={!selectedFile || uploading}
            >
              <FaUpload className="mr-2" />
              UPLOAD EXCEL ROUTINE
            </Button>

            <p className="text-xs text-gray-500 mt-3 italic">
              **Required Format:** TeacherID, Name, **Phone**, BranchName,
              ClassName, SubjectName. (Ensure master data names match).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineSetupPage;

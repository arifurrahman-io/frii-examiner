import React, { useState } from "react";
import {
  FaCalendarAlt,
  FaFileExcel,
  FaUpload,
  FaSyncAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";
import AddRoutineForm from "../components/forms/AddRoutineForm";
import Button from "../components/ui/Button";

// ✅ IMPORT the API function for bulk upload
import { uploadRoutineExcel } from "../api/apiService";

const RoutineSetupPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // --- ১. এক্সেল ফাইল হ্যান্ডলিং ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      setSelectedFile(file);
      toast.success(`${file.name} selected for upload.`);
    } else {
      setSelectedFile(null);
      toast.error("Please select a valid .xlsx file.");
    }
  };

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
      // ✅ API CALL: Use the actual function
      const response = await uploadRoutineExcel(formData);

      // Destructure and check results based on backend controller logic
      const { savedTeachersCount, savedRoutinesCount, errors } = response.data;

      let successMessage = `Bulk upload complete: ${savedRoutinesCount} routines saved.`;

      if (savedTeachersCount > 0) {
        successMessage += ` (${savedTeachersCount} new teachers created).`;
      }

      // Provide feedback for partial success/failure
      if (errors.length > 0) {
        successMessage += ` ${errors.length} records failed due to conflicts or missing data.`;
        // Use error toast for visibility of failure
        toast.error(successMessage, { duration: 8000 });
      } else {
        toast.success(successMessage);
      }

      setSelectedFile(null);

      // Successfully refresh the list
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
      <h2 className="text-4xl font-extrabold text-indigo-800 mb-8 flex items-center border-b-4 border-indigo-300 pb-2">
        <FaCalendarAlt className="mr-3 text-4xl text-indigo-600" />
        Academic Routine Setup
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* বাম কলাম: ম্যানুয়াল এন্ট্রি */}
        <div className="lg:col-span-1">
          <AddRoutineForm onSaveSuccess={handleManualSaveSuccess} />
        </div>

        {/* ডান কলাম: এক্সেল আপলোড */}
        <div className="lg:col-span-1 p-6 bg-white rounded-xl shadow-2xl border border-gray-100 h-full flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center">
              <FaFileExcel className="mr-2 text-2xl text-green-600" />
              Routine Bulk Upload (Excel)
            </h3>

            <p className="text-gray-600 mb-6">
              Upload routine data using a pre-defined Excel format to quickly
              update the system.
            </p>

            <div className="space-y-4">
              {/* ফাইল সিলেকশন */}
              <label className="block">
                <span className="sr-only">Choose routine file</span>
                {/* 🎨 MODERN FILE INPUT */}
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-700
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-lg file:border-0
                              file:text-sm file:font-semibold
                              file:bg-indigo-100 file:text-indigo-700
                              hover:file:bg-indigo-200 transition duration-150 border border-gray-300 rounded-lg"
                />
              </label>

              {/* নির্বাচিত ফাইল প্রদর্শন */}
              {selectedFile && (
                <div className="text-sm font-medium text-gray-700 bg-yellow-50 p-2 rounded-lg flex justify-between items-center border border-yellow-200">
                  <span>File Selected: {selectedFile.name}</span>
                </div>
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

      {/* Optional Routine List Section (currently commented out) */}
      {/* <div className="mt-12">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Current Active Routines</h3>
          <RoutineListTable key={refreshTrigger} />
      </div> */}
    </div>
  );
};

export default RoutineSetupPage;

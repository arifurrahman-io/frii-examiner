import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FaChartBar,
  FaFilter,
  FaSyncAlt,
  FaClipboardList,
  FaSearch,
  FaFilePdf,
  FaCheckCircle,
  FaBuilding, // Icon for Campus-wise
  FaGraduationCap, // Icon for Class-wise
} from "react-icons/fa";

// Reusable UI Components
import SelectDropdown from "../components/ui/SelectDropdown";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";

import {
  getClasses,
  getResponsibilityTypes,
  getBranches,
  getReportData,
} from "../api/apiService";

// --- Conceptual: Custom Export Function (Must be added to apiService.js) ---
const exportCustomReportToPDF = (filters) => {
  const params = new URLSearchParams(filters).toString(); // We simulate calling a new backend endpoint
  return window.open(`/api/reports/export/custom-pdf?${params}`, "_blank");
};
// --- END Conceptual ---

// --- REPORT TABLE COMPONENT (Retained) ---
const ReportTable = ({ data, reportType }) => {
  if (!ArrayOfData(data)) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
               {" "}
        <FaClipboardList className="text-6xl text-gray-400 mx-auto mb-4" />     
         {" "}
        <p className="text-lg text-gray-600 font-medium">
                    No records found matching your current filter criteria.    
             {" "}
        </p>
               {" "}
        <p className="text-sm text-gray-500 mt-2">
                    Try adjusting your filters and fetching again.        {" "}
        </p>
             {" "}
      </div>
    );
  }

  const allHeaders = Object.keys(data[0]); // Define essential columns in the requested order

  const MINIMAL_COLUMNS = [
    "ID",
    "CLASS",
    "SUBJECT",
    "TEACHER",
    "CAMPUS",
    "RESPONSIBILITY_TYPE",
  ];

  let filteredHeaders;
  if (allHeaders.includes("ID") || allHeaders.includes("_ID")) {
    filteredHeaders = MINIMAL_COLUMNS.filter((header) =>
      allHeaders.includes(header)
    );
  } else {
    const standardExclusions = [
      "STATUS",
      "CREATED AT",
      "UPDATED AT",
      "_ID",
      "TEACHERID",
    ];
    filteredHeaders = allHeaders.filter(
      (header) => !standardExclusions.includes(header)
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-2xl border border-gray-100">
           {" "}
      <table className="min-w-full divide-y divide-gray-200">
               {" "}
        <thead className="bg-indigo-600 sticky top-0">
                   {" "}
          <tr>
                       {" "}
            {filteredHeaders.map((headerKey, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap"
              >
                               {" "}
                {headerKey === "ID"
                  ? "S.L."
                  : headerKey.replace(/_/g, " ").charAt(0).toUpperCase() +
                    headerKey.replace(/_/g, " ").slice(1).toLowerCase()}
                             {" "}
              </th>
            ))}
                     {" "}
          </tr>
                 {" "}
        </thead>
               {" "}
        <tbody className="bg-white divide-y divide-gray-100">
                   {" "}
          {filteredHeaders.length > 0 &&
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-indigo-50 transition duration-150"
              >
                               {" "}
                {filteredHeaders.map((key, colIndex) => {
                  const cellValue = row[key];
                  let displayValue = cellValue;

                  if (typeof cellValue === "object" && cellValue !== null) {
                    displayValue = cellValue.name || "";
                  } else if (
                    cellValue === null ||
                    cellValue === undefined ||
                    displayValue === ""
                  ) {
                    displayValue = "N/A";
                  }

                  if (key === "ID") {
                    displayValue = rowIndex + 1;
                  }

                  let statusClass = "text-gray-800";
                  if (key === "STATUS") {
                    if (displayValue === "Assigned")
                      statusClass = "text-blue-600 font-medium";
                    else if (displayValue === "Completed")
                      statusClass = "text-green-600 font-medium";
                    else if (displayValue === "Cancelled")
                      statusClass = "text-red-600 italic";
                  }

                  return (
                    <td
                      key={colIndex}
                      className={`px-4 py-3 whitespace-nowrap text-sm ${statusClass}`}
                    >
                                            {displayValue}                   {" "}
                    </td>
                  );
                })}
                             {" "}
              </tr>
            ))}
                 {" "}
        </tbody>
             {" "}
      </table>
         {" "}
    </div>
  );
};

const ArrayOfData = (data) => Array.isArray(data) && data.length > 0;

const ReportViewPage = () => {
  const currentYear = new Date().getFullYear();

  const yearOptions = [
    { _id: currentYear, name: `${currentYear}` },
    { _id: currentYear - 1, name: `${currentYear - 1}` },
    { _id: currentYear - 2, name: `${currentYear - 2}` },
  ]; // State definitions

  const [filters, setFilters] = useState({
    reportType: "DETAILED_ASSIGNMENT",
    year: currentYear,
    typeId: "",
    classId: "",
    branchId: "",
    status: "Assigned",
  }); // NEW STATE: Modal control and selection

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  // State to show validation message in modal
  const [exportError, setExportError] = useState(null);

  const [reportData, setReportData] = useState([]);
  const [masterData, setMasterData] = useState({
    classes: [],
    types: [],
    branches: [],
  });
  const [loading, setLoading] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [classesRes, typesRes, branchesRes] = await Promise.all([
          getClasses(),
          getResponsibilityTypes(),
          getBranches(),
        ]);
        setMasterData({
          classes: Array.isArray(classesRes.data) ? classesRes.data : [],
          types: Array.isArray(typesRes.data) ? typesRes.data : [],
          branches: Array.isArray(branchesRes.data) ? branchesRes.data : [],
        });
        setFetchTrigger((prev) => prev + 1);
      } catch (error) {
        toast.error("Failed to load filter options.");
      }
    };
    fetchMasterData();
  }, []);

  const fetchReport = useCallback(async () => {
    if (fetchTrigger === 0) return;

    setLoading(true);
    try {
      const { data } = await getReportData(filters);
      setReportData(data);
      if (data.length === 0) {
        toast.info("No responsibility records found matching your filters.");
      }
    } catch (error) {
      console.error("Fetch Report Data Error:", error);
      toast.error("Error fetching report data. Check console for details.");
    } finally {
      setLoading(false);
    }
  }, [filters, fetchTrigger]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport, fetchTrigger]);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleFetchData = () => {
    setFetchTrigger((prev) => prev + 1);
  };

  const isFetchDisabled = loading; // --- Export Logic Refactored for Buttons ---

  const handleExportAction = (exportType) => {
    // Reset any previous export errors
    setExportError(null);

    if (!filters.typeId || !filters.year) {
      setExportError(
        "Year and Responsibility Type filters must be selected first."
      );
      return;
    }

    let mandatoryFilterId = "";
    let mandatoryFilterName = "";

    if (exportType === "EXPORT_BRANCH_DETAILED") {
      mandatoryFilterId = filters.branchId;
      mandatoryFilterName = "Branch/Campus";
    } else if (exportType === "EXPORT_CLASS_DETAILED") {
      mandatoryFilterId = filters.classId;
      mandatoryFilterName = "Class";
    }

    if (!mandatoryFilterId) {
      setExportError(
        `Please select a ${mandatoryFilterName} filter for this export type.`
      );
      return;
    }

    setExportLoading(true);

    const exportFilters = {
      reportType: exportType,
      year: filters.year,
      typeId: filters.typeId,
      classId: filters.classId,
      branchId: filters.branchId,
    };

    toast
      .promise(
        new Promise((resolve) => {
          setTimeout(() => {
            exportCustomReportToPDF(exportFilters);
            resolve();
          }, 300);
        }),
        {
          loading: `Preparing ${
            exportType.includes("BRANCH") ? "Branch" : "Class"
          }-wise PDF...`,
          success: "Download started!",
          error: "PDF generation failed. Check server logs.",
        }
      )
      .finally(() => {
        setExportLoading(false);
        setIsExportModalOpen(false);
      });
  }; // Get the name of the currently selected mandatory filter in the main UI

  const getFilterName = (id, options) => {
    if (!id) return "N/A";
    const item = options.find((opt) => opt._id === id);
    return item ? item.name : "N/A";
  };
  const selectedYearName = filters.year;
  const selectedTypeName = getFilterName(filters.typeId, masterData.types);
  const selectedBranchName = getFilterName(
    filters.branchId,
    masterData.branches
  );
  const selectedClassName = getFilterName(filters.classId, masterData.classes);

  return (
    <div className="p-4">
      {/* 💡 Using the user-defined preference for modern, dynamic UI/UX */}   
        {/* 🚀 MODERNIZE HEADER */}     {" "}
      <h2 className="text-4xl font-extrabold text-indigo-800 mb-8 flex items-center border-b-4 border-indigo-300 pb-2">
                <FaChartBar className="mr-3 text-4xl text-indigo-600" />       
        Detailed Assignment Report      {" "}
      </h2>
      {/* --- FILTER AREA --- */}
      <div className="bg-white p-6 rounded-xl shadow-xl mb-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-700 mb-6 flex items-center">
          <FaFilter className="mr-2 text-indigo-500" /> Filter Report Data
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-end">
          {/* 1. Year Filter */}
          <SelectDropdown
            label="Year"
            name="year"
            value={filters.year}
            onChange={handleChange}
            options={yearOptions}
            className="xl:col-span-1"
          />

          {/* 2. Branch Filter */}
          <SelectDropdown
            label="Branch/Campus"
            name="branchId"
            value={filters.branchId}
            onChange={handleChange}
            options={masterData.branches}
            placeholder="All Campuses"
            className="xl:col-span-1"
          />

          {/* 3. Responsibility Type Filter */}
          <SelectDropdown
            label="Type"
            name="typeId"
            value={filters.typeId}
            onChange={handleChange}
            options={masterData.types}
            placeholder="All Responsibility Types"
            className="xl:col-span-1"
          />

          {/* 4. Class Filter */}
          <SelectDropdown
            label="Class"
            name="classId"
            value={filters.classId}
            onChange={handleChange}
            options={masterData.classes}
            placeholder="All Classes"
            className="xl:col-span-1"
          />

          {/* 5. Fetch button */}
          <div className="sm:col-span-2 lg:col-span-1 xl:col-span-1">
            <Button
              onClick={handleFetchData}
              disabled={isFetchDisabled}
              fullWidth
              variant="primary"
            >
              <FaSearch className={`mr-2 ${loading ? "animate-spin" : ""}`} />{" "}
              Fetch Data
            </Button>
          </div>
        </div>
      </div>
            {/* --- EXPORT BUTTON (NEW) --- */}     {" "}
      <div className="mb-6 flex justify-end">
               {" "}
        <Button
          onClick={() => {
            if (!filters.typeId) {
              toast.error("Please select a Responsibility Type filter first.");
              return;
            }
            // Reset export error when opening modal
            setExportError(null);
            setIsExportModalOpen(true);
          }}
          disabled={loading || !filters.year}
          variant="success"
        >
                    <FaFilePdf className="mr-2" /> Export Report        {" "}
        </Button>
             {" "}
      </div>
            {/* --- REPORT TABLE --- */}     {" "}
      {loading ? (
        <div className="text-center p-10 bg-white rounded-xl shadow-md">
                   {" "}
          <FaSyncAlt className="animate-spin text-4xl text-indigo-500 mx-auto" />
                   {" "}
          <p className="mt-4 text-lg text-gray-600 font-semibold">
                        Loading report...          {" "}
          </p>
                 {" "}
        </div>
      ) : (
        <ReportTable data={reportData} reportType={filters.reportType} />
      )}
            {/* --- EXPORT SELECTION MODAL (MODERN UI) --- */}     {" "}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Custom Report Export"
      >
               {" "}
        <div className="p-4 space-y-6">
                   {" "}
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 text-sm">
                       {" "}
            <p className="font-semibold text-indigo-700 mb-2">
                            Current Report Context:            {" "}
            </p>
                       {" "}
            <p>
                            <strong>Year:</strong> {selectedYearName} |
              <strong> Type:</strong> {selectedTypeName}           {" "}
            </p>
            <p>
              <strong>Branch Filter:</strong> {selectedBranchName} |
              <strong> Class Filter:</strong> {selectedClassName}
            </p>
                     {" "}
          </div>
          <p className="text-md font-semibold text-gray-700">
            Choose the specific detailed report you want to generate:
          </p>
          <div className="grid grid-cols-2 gap-4">
            {/* Campus-Wise Button */}
            <Button
              onClick={() => handleExportAction("EXPORT_BRANCH_DETAILED")}
              disabled={exportLoading || !filters.branchId}
              variant={filters.branchId ? "success" : "light"}
              fullWidth
            >
              <FaBuilding className="mr-2" /> Campus-Wise List
            </Button>

            {/* Class-Wise Button */}
            <Button
              onClick={() => handleExportAction("EXPORT_CLASS_DETAILED")}
              disabled={exportLoading || !filters.classId}
              variant={filters.classId ? "success" : "light"}
              fullWidth
            >
              <FaGraduationCap className="mr-2" /> Class-Wise List
            </Button>
          </div>
          {/* Validation/Error Message */}
          {exportError && (
            <p className="text-sm text-red-600 flex items-center bg-red-50 p-3 rounded-lg border border-red-300">
              <FaCheckCircle className="mr-2 text-red-500" /> {exportError}
            </p>
          )}
          {/* Note on requirement */}
          <p className="text-xs text-gray-500 pt-2 text-center">
            Press any button to generate report
          </p>
                 {" "}
        </div>
             {" "}
      </Modal>
         {" "}
    </div>
  );
};

export default ReportViewPage;

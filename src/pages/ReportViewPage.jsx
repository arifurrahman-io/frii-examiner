// arifurrahman-io/frii-examiner/frii-examiner-94b444a3277f392cde2a42af87c32a9043a874f2/src/pages/ReportViewPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FaChartBar,
  FaFilter,
  FaSyncAlt,
  FaClipboardList,
  FaSearch, // Added for search/filter visual flair
} from "react-icons/fa";

// Reusable UI Components
import SelectDropdown from "../components/ui/SelectDropdown";
import Button from "../components/ui/Button";

import {
  getClasses,
  getResponsibilityTypes,
  getBranches,
  getReportData,
} from "../api/apiService";

// --- REPORT TABLE COMPONENT (Enhanced UI) ---
const ReportTable = ({ data, reportType }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
        <FaClipboardList className="text-6xl text-gray-400 mx-auto mb-4" />
        <p className="text-lg text-gray-600 font-medium">
          No records found matching your current filter criteria.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Try adjusting your filters and fetching again.
        </p>
      </div>
    );
  }

  const allHeaders = Object.keys(data[0]);

  // ✅ UPDATED: Define essential columns in the requested order
  const MINIMAL_COLUMNS = [
    "ID",
    "CLASS",
    "SUBJECT",
    "TEACHER",
    "CAMPUS",
    "RESPONSIBILITY_TYPE",
  ];

  let filteredHeaders;

  if (
    reportType === "DETAILED_ASSIGNMENT" &&
    (allHeaders.includes("_ID") || allHeaders.includes("ID"))
  ) {
    // Use the requested minimal columns for detailed view, ensuring they exist in the data
    filteredHeaders = MINIMAL_COLUMNS.filter((header) =>
      allHeaders.includes(header)
    );
  } else {
    // For Summary reports, use all generated headers excluding metadata
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
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-100">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-indigo-600 sticky top-0">
          {" "}
          {/* Sticky header for better UX on scroll */}
          <tr>
            {filteredHeaders.map((headerKey, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap"
              >
                {/* Convert uppercase key to readable title (e.g., TEACHER -> Teacher) */}
                {headerKey === "ID"
                  ? "S.L."
                  : headerKey.replace(/_/g, " ").charAt(0).toUpperCase() +
                    headerKey.replace(/_/g, " ").slice(1).toLowerCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {filteredHeaders.length > 0 &&
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-indigo-50 transition duration-150"
              >
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

                  // Highlight summary counts
                  if (key === "TotalAssignments") {
                    displayValue = (
                      <span className="font-extrabold text-indigo-700 text-base">
                        {displayValue}
                      </span>
                    );
                  }

                  // Conditional styling for STATUS (If present, though excluded from list)
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
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

const ReportViewPage = () => {
  const currentYear = new Date().getFullYear();

  const yearOptions = [
    { _id: currentYear, name: `${currentYear}` },
    { _id: currentYear - 1, name: `${currentYear - 1}` },
    { _id: currentYear - 2, name: `${currentYear - 2}` },
  ];

  const reportTypeOptions = [
    { _id: "DETAILED_ASSIGNMENT", name: "Detailed Assignment List" },
    { _id: "CAMPUS_SUMMARY", name: "Campus/Branch Summary" },
    { _id: "CLASS_SUMMARY", name: "Class-wise Summary" },
  ];

  // State definitions
  const [filters, setFilters] = useState({
    reportType: "DETAILED_ASSIGNMENT",
    year: currentYear,
    typeId: "",
    classId: "",
    branchId: "",
    status: "Assigned",
  });

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

  const isBranchSummary = filters.reportType === "CAMPUS_SUMMARY";
  const isClassSummary = filters.reportType === "CLASS_SUMMARY";

  // Enforce mandatory filters for summary reports (Strong Filtering)
  const isFetchDisabled =
    loading ||
    (isBranchSummary && !filters.branchId) ||
    (isClassSummary && !filters.classId);

  return (
    <div className="p-4">
      {/* 🚀 MODERNIZE HEADER: Large, prominent, and clean */}
      <h2 className="text-2xl font-extrabold text-indigo-800 mb-8 flex items-center border-b-4 border-indigo-300 pb-2">
        <FaChartBar className="mr-3 text-2xl text-indigo-600" />
        Responsibility Report View
      </h2>

      {/* --- FILTER AREA: Clean card design --- */}
      <div className="bg-white p-6 rounded-xl  mb-10 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-700 mb-6 flex items-center">
          <FaFilter className="mr-2 text-indigo-500" /> Filter Report Data
        </h3>

        {/* Responsive Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 items-end">
          {/* Report Type Filter */}
          <SelectDropdown
            label="Report Type"
            name="reportType"
            value={filters.reportType}
            onChange={handleChange}
            options={reportTypeOptions}
            className="xl:col-span-1"
          />

          {/* Year Filter */}
          <SelectDropdown
            label="Year"
            name="year"
            value={filters.year}
            onChange={handleChange}
            options={yearOptions}
            className="xl:col-span-1"
          />

          {/* Branch Filter (Conditional Required) */}
          <SelectDropdown
            label="Branch/Campus"
            name="branchId"
            value={filters.branchId}
            onChange={handleChange}
            options={masterData.branches}
            placeholder="All Campuses"
            required={isBranchSummary}
            className="xl:col-span-1"
          />

          {/* Responsibility Type Filter */}
          <SelectDropdown
            label="Type"
            name="typeId"
            value={filters.typeId}
            onChange={handleChange}
            options={masterData.types}
            placeholder="All Responsibility Types"
            className="xl:col-span-1"
          />

          {/* Class Filter (Conditional Required) */}
          <SelectDropdown
            label="Class"
            name="classId"
            value={filters.classId}
            onChange={handleChange}
            options={masterData.classes}
            placeholder="All Classes"
            required={isClassSummary}
            className="xl:col-span-1"
          />

          {/* Fetch button: Always occupy the last slot in the grid */}
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

      {/* --- REPORT TABLE DISPLAY --- */}
      {loading ? (
        <div className="text-center p-10 bg-white rounded-xl">
          <FaSyncAlt className="animate-spin text-4xl text-indigo-500 mx-auto" />
          <p className="mt-4 text-lg text-gray-600 font-semibold">
            Loading report...
          </p>
        </div>
      ) : (
        <ReportTable data={reportData} reportType={filters.reportType} />
      )}
    </div>
  );
};

export default ReportViewPage;

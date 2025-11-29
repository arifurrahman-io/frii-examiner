// src/pages/ReportViewPage.jsx (Complete Updated File)

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FaChartBar,
  FaFilePdf,
  FaFileExcel,
  FaFilter,
  FaSyncAlt,
  FaClipboardList,
} from "react-icons/fa";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

// Reusable UI Components
import SelectDropdown from "../components/ui/SelectDropdown";
import Button from "../components/ui/Button";

import {
  getClasses,
  getResponsibilityTypes,
  getBranches,
  getReportData,
  exportReportToExcel,
} from "../api/apiService";

// --- PDF STYLING (MODERNIZED & FIXED FOR BORDERS) ---
const styles = StyleSheet.create({
  page: {
    padding: 30, // Increased padding
    fontFamily: "Helvetica",
    backgroundColor: "#f9fafb", // Subtle background color
  },
  header: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 5,
    fontWeight: "extrabold",
    color: "#1E3A8A", // Deep Indigo
  },
  subHeader: {
    fontSize: 10, // Smaller font for filter details
    textAlign: "center",
    marginBottom: 10,
    color: "#4B5563", // Gray text
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
    paddingVertical: 5,
    backgroundColor: "#E0E7FF", // Light blue background for filter info
    borderRadius: 4,
    borderBottom: "1pt solid #A5B4FC",
  },
  filterText: {
    fontSize: 8,
    color: "#374151",
    fontWeight: "bold",
  },
  table: {
    display: "table",
    width: "auto",
    // Base table style is now minimal, borders are set on cells
    marginTop: 15,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  // Base style for Header cell - Border styles REMOVED to be set in JSX
  tableColHeader: {
    width: "14.28%",
    borderColor: "#4F46E5",
    backgroundColor: "#4F46E5", // Indigo 600
    color: "white",
    padding: 6,
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
  },
  // Base style for Body cell - Border styles REMOVED to be set in JSX
  tableCol: {
    width: "14.28%",
    borderColor: "#E5E7EB", // Light gray border
    padding: 4,
    fontSize: 6,
    color: "#374151",
  },
});

// --- PDF DOCUMENT COMPONENT (MODERNIZED & FIXED) ---
const ReportPDF = ({ data, filters, title, reportType }) => {
  if (!data || data.length === 0) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.header}>No Data Available</Text>
        </Page>
      </Document>
    );
  }

  const allHeaders = Object.keys(data[0]);

  // ✅ FIX 1: Columns to hide for a cleaner report (as requested)
  const columnsToExclude = ["STATUS", "CREATED AT", "UPDATED AT"];

  const filteredHeaders = allHeaders.filter(
    (header) => !columnsToExclude.includes(header)
  );

  const numColumns = filteredHeaders.length;
  // Dynamic width calculation
  const colWidth = `${100 / numColumns}%`;

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <Text style={styles.header}>{title}</Text>
        <Text style={styles.subHeader}>
          Report Type: {filters.reportType.replace(/_/g, " ")}
        </Text>

        {/* Filter Row with light background for applied filters */}
        <View style={styles.filterRow}>
          <Text style={styles.filterText}>Year: {filters.year}</Text>
          <Text style={styles.filterText}>Branch: {filters.branchName}</Text>
          <Text style={styles.filterText}>Type: {filters.typeName}</Text>
          <Text style={styles.filterText}>Class: {filters.className}</Text>
        </View>

        <View style={styles.table}>
          {/* Table Header Row */}
          <View style={styles.tableRow}>
            {filteredHeaders.map((header, index) => (
              <View
                key={index}
                style={[
                  styles.tableColHeader,
                  { width: colWidth },
                  // CRITICAL FIX: Define ALL border properties explicitly here to solve 'undefined' error
                  {
                    borderStyle: "solid",
                    borderBottomWidth: 1,
                    borderRightWidth: 1,
                    borderTopWidth: 1,
                    borderLeftWidth: index === 0 ? 1 : 0,
                  },
                ]}
              >
                <Text>
                  {header === "ID"
                    ? "S.L."
                    : header.replace(/([A-Z])/g, " $1").trim()}
                </Text>
              </View>
            ))}
          </View>

          {/* Table Body Rows */}
          {data.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={[
                styles.tableRow,
                // Add alternating row color for better readability
                rowIndex % 2 === 1 ? { backgroundColor: "#F3F4F6" } : {},
              ]}
            >
              {filteredHeaders.map((key, colIndex) => {
                let displayValue = row[key];

                if (key === "ID") {
                  displayValue = rowIndex + 1;
                }

                return (
                  <View
                    key={colIndex}
                    style={[
                      styles.tableCol,
                      { width: colWidth },
                      // CRITICAL FIX: Define ALL border properties explicitly here
                      {
                        borderStyle: "solid",
                        borderBottomWidth: 1,
                        borderRightWidth: 1,
                        borderTopWidth: 0, // No top border on body cells
                        borderLeftWidth: colIndex === 0 ? 1 : 0, // Add left border only to the first column
                        // Set right border for the last cell if it's the last cell
                        ...(colIndex === numColumns - 1
                          ? { borderRightWidth: 1 }
                          : {}),
                      },
                    ]}
                  >
                    <Text>{displayValue || "N/A"}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

// --- রিপোর্ট টেবিল কম্পোনেন্ট (Unchanged) ---
const ReportTable = ({ data, classes, types, reportType }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-200">
        <FaClipboardList className="text-5xl text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">
          No records found matching your current filter criteria.
        </p>
      </div>
    );
  }

  const isSummary =
    reportType === "CAMPUS_SUMMARY" || reportType === "CLASS_SUMMARY";
  const allHeaders = Object.keys(data[0]);

  // Use the same exclusion list for the HTML table view
  const columnsToExclude = ["STATUS", "CREATED AT", "UPDATED AT"];
  const filteredHeaders = allHeaders.filter(
    (header) => !columnsToExclude.includes(header)
  );

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-2xl border border-gray-100">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-indigo-600">
          <tr>
            {filteredHeaders.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider"
              >
                {header === "ID"
                  ? "S.L."
                  : header.replace(/([A-Z])/g, " $1").trim()}{" "}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-indigo-50 transition duration-150"
            >
              {filteredHeaders.map((key, colIndex) => {
                const cellValue = row[key];
                let displayValue = cellValue;

                if (typeof cellValue === "object" && cellValue !== null) {
                  if (cellValue.name) {
                    displayValue = cellValue.name;
                  } else {
                    displayValue = "";
                  }
                } else if (cellValue === null) {
                  displayValue = "N/A";
                }

                if (key === "ID") {
                  displayValue = rowIndex + 1;
                }

                if (key === "TotalAssignments") {
                  displayValue = (
                    <span className="font-extrabold text-indigo-700">
                      {displayValue}
                    </span>
                  );
                }

                return (
                  <td
                    key={colIndex}
                    className="px-4 py-2 whitespace-nowrap text-sm text-gray-800"
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
    { _id: currentYear + 1, name: `${currentYear + 1}` },
    { _id: currentYear, name: `${currentYear}` },
    { _id: currentYear - 1, name: `${currentYear - 1}` },
  ];

  // MOVED DEFINITION: Report Type Options
  const reportTypeOptions = [
    { _id: "DETAILED_ASSIGNMENT", name: "Detailed Assignment List" },
    { _id: "CAMPUS_SUMMARY", name: "Campus/Branch Summary" },
    { _id: "CLASS_SUMMARY", name: "Class-wise Summary" },
  ];

  // Status অপশন
  const statusOptions = [
    { _id: "Assigned", name: "Assigned (Active)" },
    { _id: "", name: "All (Including Cancelled)" },
    { _id: "Cancelled", name: "Cancelled Only" },
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

  // --- ১. মাস্টার ডেটা লোড করা ---
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
      } catch (error) {
        toast.error("Failed to load filter options.");
      }
    };
    fetchMasterData();
  }, []);

  // --- Utility functions to get descriptive names for filters ---
  const getFilterName = (id, options, defaultText = "All") => {
    if (!id) return defaultText;
    const item = options.find((opt) => opt._id === id);
    return item ? item.name : defaultText;
  };

  // --- ২. রিপোর্ট ডেটা ফেচ করা ---
  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      // NOTE: The backend's `reportController.js` already handles filtering the data based on `branchId` here.
      const { data } = await getReportData(filters);
      setReportData(data);
      if (data.length === 0) {
        toast.info("No responsibility records found matching your filters.");
      }
    } catch (error) {
      toast.error("Error fetching report data.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // ফিল্টার পরিবর্তন হলেই রিপোর্ট ফেচ করা
  useEffect(() => {
    fetchReport();
  }, [filters, fetchReport]);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // Logic to determine when the Fetch button should be disabled due to missing mandatory filters
  const isBranchSummary = filters.reportType === "CAMPUS_SUMMARY";
  const isClassSummary = filters.reportType === "CLASS_SUMMARY";

  // Conditionally set the fetch button disabled status
  const isFetchDisabled =
    loading ||
    (isBranchSummary && !filters.branchId) ||
    (isClassSummary && !filters.classId);

  // --- ৩. DOWNLOAD HANDLERS ---

  const handleExportExcel = () => {
    toast.promise(
      new Promise((resolve) => {
        exportReportToExcel(filters);
        resolve();
      }),
      {
        loading: "Preparing Excel file...",
        success: "Download started!",
        error: "Download failed.",
      }
    );
  };

  // Custom handler to open PDF in a new tab
  const handleOpenPDF = async () => {
    const isPDFDownloadDisabled = reportData.length === 0 || loading;
    if (isPDFDownloadDisabled) {
      toast.error("No data to export.");
      return;
    }
    setLoading(true);

    try {
      // Get descriptive names for PDF header
      const selectedBranchName = getFilterName(
        filters.branchId,
        masterData.branches,
        "All Campuses"
      );
      const selectedClassName = getFilterName(
        filters.classId,
        masterData.classes,
        "All Classes"
      );
      const selectedTypeName = getFilterName(
        filters.typeId,
        masterData.types,
        "All Types"
      );

      // 1. Define the PDF component (document structure)
      const doc = (
        <ReportPDF
          data={reportData}
          filters={{
            ...filters,
            branchName: selectedBranchName,
            className: selectedClassName,
            typeName: selectedTypeName,
          }}
          title="Responsibility Report"
          reportType={filters.reportType}
        />
      );

      // 2. Generate the PDF blob using the low-level API
      const blob = await pdf(doc).toBlob();

      // 3. Create an object URL and open it in a new, blank tab
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      toast.success("PDF report opened in a new tab.");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error(
        "Failed to generate or open PDF. Please ensure @react-pdf/renderer is installed and the component structure is correct."
      );
    } finally {
      setLoading(false);
    }
  };

  const isPDFDownloadDisabled = reportData.length === 0 || loading;

  // Final JSX Return
  return (
    <div className="p-4">
      {/* 🚀 MODERNIZE HEADER */}
      <h2 className="text-4xl font-extrabold text-indigo-800 mb-8 flex items-center border-b-4 border-indigo-300 pb-2">
        <FaChartBar className="mr-3 text-4xl text-indigo-600" />
        Responsibility Report View
      </h2>

      {/* --- ১. ফিল্টার এরিয়া --- */}
      <div className="bg-white p-6 rounded-xl shadow-2xl mb-8 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-700 mb-6 flex items-center">
          <FaFilter className="mr-2 text-indigo-500" /> Filter Report Data
        </h3>

        {/* Improved grid layout for visual separation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 items-end">
          {/* Report Type Filter (NEW) - 1/6 */}
          <SelectDropdown
            label="Report Type"
            name="reportType"
            value={filters.reportType}
            onChange={handleChange}
            options={reportTypeOptions}
          />

          {/* Year Filter - 2/6 */}
          <SelectDropdown
            label="Year"
            name="year"
            value={filters.year}
            onChange={handleChange}
            options={yearOptions}
          />

          {/* Branch Filter (NEW) - 3/6 */}
          <SelectDropdown
            label="Branch/Campus"
            name="branchId"
            value={filters.branchId}
            onChange={handleChange}
            options={masterData.branches}
            placeholder="All Campuses"
          />

          {/* Responsibility Type Filter - 4/6 */}
          <SelectDropdown
            label="Type"
            name="typeId"
            value={filters.typeId}
            onChange={handleChange}
            options={masterData.types}
            placeholder="All Responsibility Types"
          />

          {/* Class Filter - 5/6 */}
          <SelectDropdown
            label="Class"
            name="classId"
            value={filters.classId}
            onChange={handleChange}
            options={masterData.classes}
            placeholder="All Classes"
          />

          {/* Status Filter - 6/6 */}
          <SelectDropdown
            label="Status"
            name="status"
            value={filters.status}
            onChange={handleChange}
            options={statusOptions}
          />
        </div>

        {/* Fetch button outside the 6-col grid for better layout control */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={fetchReport}
            disabled={isFetchDisabled}
            className="w-full sm:w-1/4 py-3"
            variant="primary"
          >
            <FaSyncAlt className={`mr-2 ${loading ? "animate-spin" : ""}`} />{" "}
            Fetch Data
          </Button>
        </div>
      </div>

      {/* --- ২. রিপোর্ট EXPORT বাটন এবং ডেটা প্রদর্শন --- */}
      <div className="mb-6 flex justify-end space-x-3">
        <Button
          onClick={handleExportExcel}
          disabled={isPDFDownloadDisabled}
          variant="success"
        >
          <FaFileExcel className="mr-2" /> Export to Excel
        </Button>

        {/* ✅ CUSTOM BUTTON replaces PDFDownloadLink and calls handleOpenPDF */}
        <Button
          onClick={handleOpenPDF}
          disabled={isPDFDownloadDisabled || loading}
          loading={loading}
          variant="danger"
        >
          <FaFilePdf className="mr-2" />
          Export to PDF
        </Button>
      </div>

      {/* --- ৩. রিপোর্ট টেবিল --- */}
      {loading ? (
        <div className="text-center p-10 bg-white rounded-xl shadow-md">
          <FaSyncAlt className="animate-spin text-4xl text-indigo-500 mx-auto" />
          <p className="mt-4 text-lg text-gray-600 font-semibold">
            Loading report...
          </p>
        </div>
      ) : (
        <ReportTable
          data={reportData}
          classes={masterData.classes}
          types={masterData.types}
          reportType={filters.reportType}
        />
      )}
    </div>
  );
};

export default ReportViewPage;

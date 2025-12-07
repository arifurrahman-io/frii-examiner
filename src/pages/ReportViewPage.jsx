import React, { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import {
  FaChartBar,
  FaFilter,
  FaSyncAlt,
  FaClipboardList,
  FaSearch,
  FaFilePdf,
  FaCheckCircle,
  FaBuilding,
  FaGraduationCap,
  FaCalendarAlt,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";

import SelectDropdown from "../components/ui/SelectDropdown";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";

import {
  getClasses,
  getResponsibilityTypes,
  getBranches,
  getReportData,
  exportCustomReportToPDF,
} from "../api/apiService";

const ArrayOfData = (data) => Array.isArray(data) && data.length > 0;

// ------------------------------
// Table with pagination & limited columns
// ------------------------------
const ReportTable = ({ data, reportType, rowsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const displayedHeaders = ["Sl.", "CLASS", "SUBJECT", "TEACHER", "CAMPUS"];

  const headerLabel = (key) => {
    switch (key) {
      case "Sl.":
        return "S.L.";
      case "CLASS":
        return "Class";
      case "SUBJECT":
        return "Assigned Subject";
      case "TEACHER":
        return "Teacher Name";
      case "CAMPUS":
        return "Campus";
      default:
        return key;
    }
  };

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  if (!ArrayOfData(data)) {
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

  return (
    <div className="overflow-x-auto bg-white rounded-xl p-5 border border-gray-100">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-indigo-600 to-indigo-500 sticky top-0">
          <tr>
            {displayedHeaders.map((headerKey, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap"
              >
                {headerLabel(headerKey)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-100">
          {paginatedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-indigo-50 transition duration-150"
            >
              {displayedHeaders.map((key, colIndex) => {
                let cellValue = row[key];

                if (key === "Sl.")
                  cellValue = (currentPage - 1) * rowsPerPage + rowIndex + 1;
                if (typeof cellValue === "object" && cellValue !== null) {
                  cellValue =
                    cellValue.name ||
                    cellValue.label ||
                    JSON.stringify(cellValue);
                } else if (
                  cellValue === null ||
                  cellValue === undefined ||
                  cellValue === ""
                ) {
                  cellValue = "-";
                }

                return (
                  <td
                    key={colIndex}
                    className="px-4 py-3 whitespace-nowrap text-sm text-gray-800"
                  >
                    {cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div className="flex justify-between items-center mt-4 px-4">
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex space-x-2">
          <Button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            variant="light"
          >
            <FaAngleLeft />
          </Button>
          <Button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            variant="light"
          >
            <FaAngleRight />
          </Button>
        </div>
      </div>
    </div>
  );
};

// ------------------------------
// Main Page
// ------------------------------
const ReportViewPage = () => {
  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { _id: currentYear, name: `${currentYear}` },
    { _id: currentYear - 1, name: `${currentYear - 1}` },
    { _id: currentYear - 2, name: `${currentYear - 2}` },
  ];

  const reportTypeOptions = [
    {
      _id: "DETAILED_ASSIGNMENT",
      name: "Detailed Assignments (Current Filters)",
    },
    { _id: "YEARLY_SUMMARY", name: "Teacher Yearly Summary (2 Years)" },
  ];

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

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState(null);

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
        setFetchTrigger((p) => p + 1);
      } catch (error) {
        console.error("Master data load error:", error);
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
      setReportData(Array.isArray(data) ? data : []);
      if (!ArrayOfData(data))
        toast.info("No records found matching your filters.");
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
    const { name, value } = e.target;
    setFilters((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "reportType" && value === "YEARLY_SUMMARY") {
        next.typeId = "";
        next.classId = "";
        next.status = "";
      }
      return next;
    });
  };

  const handleFetchData = () => setFetchTrigger((p) => p + 1);
  const isFetchDisabled = loading;

  const handleExportAction = async (exportType) => {
    setExportError(null);

    if (!filters.year) {
      setExportError("Year filter must be selected.");
      return;
    }

    const exportFilters = {
      reportType: filters.reportType,
      year: filters.year,
      typeId: filters.typeId,
      classId: filters.classId,
      branchId: filters.branchId,
    };

    if (exportType === "EXPORT_YEARLY_SUMMARY") {
      exportFilters.reportType = "YEARLY_SUMMARY";
    } else {
      if (!filters.typeId) {
        setExportError(
          "Responsibility Type must be selected for detailed exports."
        );
        return;
      }
      exportFilters.reportType = exportType;

      if (exportType === "EXPORT_CLASS_DETAILED" && !filters.classId) {
        setExportError("Please select Class for Class-Wise export.");
        return;
      } else if (exportType === "EXPORT_BRANCH_DETAILED" && !filters.branchId) {
        setExportError("Please select Branch/Campus for Campus-Wise export.");
        return;
      }
    }

    setExportLoading(true);
    const exportPromise = new Promise((resolve, reject) => {
      try {
        exportCustomReportToPDF(exportFilters);
        resolve();
      } catch (err) {
        console.error("Export trigger error:", err);
        reject(err);
      }
    });

    toast
      .promise(exportPromise, {
        loading: `Preparing ${
          exportType.includes("YEARLY") ? "Yearly" : "Detailed"
        } PDF...`,
        success: "Download started!",
        error: "PDF generation failed. Check server logs.",
      })
      .finally(() => {
        setExportLoading(false);
        setIsExportModalOpen(false);
      });
  };

  const getFilterName = (id, options) => {
    if (!id) return "N/A";
    const found = options.find((o) => o._id === id || o.id === id);
    return found
      ? found.name || found.label || found.title || "Selected"
      : "N/A";
  };

  const selectedYearName = filters.year;
  const selectedTypeName = getFilterName(filters.typeId, masterData.types);
  const selectedBranchName = getFilterName(
    filters.branchId,
    masterData.branches
  );
  const selectedClassName = getFilterName(filters.classId, masterData.classes);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-indigo-800 flex items-center">
          <FaChartBar className="mr-3 text-xl text-indigo-600" />
          {filters.reportType === "YEARLY_SUMMARY"
            ? "Yearly Assignment Summary"
            : "Detailed Assignment Report"}
        </h2>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl mb-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-700 flex items-center">
            <FaFilter className="mr-2 text-indigo-500" /> Filter Report Data
          </h3>
        </div>

        <div className="flex items-center space-x-3 mb-4">
          <Button
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                reportType: "DETAILED_ASSIGNMENT",
              }))
            }
            variant={
              filters.reportType === "DETAILED_ASSIGNMENT" ? "primary" : "light"
            }
          >
            Detailed
          </Button>
          <Button
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                reportType: "YEARLY_SUMMARY",
                typeId: "",
                classId: "",
                status: "",
              }))
            }
            variant={
              filters.reportType === "YEARLY_SUMMARY" ? "primary" : "light"
            }
          >
            Yearly
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-6 items-end">
          <SelectDropdown
            label="Year"
            name="year"
            value={filters.year}
            onChange={handleChange}
            options={yearOptions}
            className="xl:col-span-1"
          />

          <SelectDropdown
            label="Branch/Campus"
            name="branchId"
            value={filters.branchId}
            onChange={handleChange}
            options={masterData.branches}
            placeholder={
              filters.reportType === "YEARLY_SUMMARY"
                ? "All Campuses (For Full Report)"
                : "Select Campus"
            }
            className="xl:col-span-1"
          />

          {filters.reportType === "DETAILED_ASSIGNMENT" && (
            <>
              <SelectDropdown
                label="Type"
                name="typeId"
                value={filters.typeId}
                onChange={handleChange}
                options={masterData.types}
                placeholder="All Responsibility Types"
                className="xl:col-span-1"
              />
              <SelectDropdown
                label="Class"
                name="classId"
                value={filters.classId}
                onChange={handleChange}
                options={masterData.classes}
                placeholder="All Classes"
                className="xl:col-span-1"
              />
            </>
          )}

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

      {/* Export */}
      <div className="mb-6 flex justify-end">
        <Button
          onClick={() => {
            if (
              filters.reportType === "DETAILED_ASSIGNMENT" &&
              !filters.typeId
            ) {
              toast.error(
                "Please select a Responsibility Type filter first for detailed export."
              );
              return;
            }
            setExportError(null);
            setIsExportModalOpen(true);
          }}
          disabled={loading || !filters.year}
          variant="success"
        >
          <FaFilePdf className="mr-2" /> Export Report
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center p-10 bg-white rounded-xl">
          <FaSyncAlt className="animate-spin text-4xl text-indigo-500 mx-auto" />
          <p className="mt-4 text-lg text-gray-600 font-semibold">
            Loading report...
          </p>
        </div>
      ) : (
        <ReportTable
          data={reportData}
          reportType={filters.reportType}
          rowsPerPage={10}
        />
      )}

      {/* Export Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Custom Report Export"
      >
        <div className="p-4 space-y-6">
          {filters.reportType === "DETAILED_ASSIGNMENT" && (
            <>
              <p className="text-md font-semibold text-gray-700">
                Detailed Assignment Report Export (Mandatory Filters: Type)
              </p>
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 text-sm mb-4">
                <p>
                  <strong>Year:</strong> {selectedYearName} |
                  <strong> Type:</strong> {selectedTypeName}
                </p>
                <p>
                  <strong>Branch:</strong> {selectedBranchName} |
                  <strong> Class:</strong> {selectedClassName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleExportAction("EXPORT_BRANCH_DETAILED")}
                  disabled={
                    exportLoading || !filters.branchId || !filters.typeId
                  }
                  variant={
                    filters.branchId && filters.typeId ? "success" : "light"
                  }
                  fullWidth
                >
                  <FaBuilding className="mr-2" /> Campus-Wise List
                </Button>

                <Button
                  onClick={() => handleExportAction("EXPORT_CLASS_DETAILED")}
                  disabled={
                    exportLoading || !filters.classId || !filters.typeId
                  }
                  variant={
                    filters.classId && filters.typeId ? "success" : "light"
                  }
                  fullWidth
                >
                  <FaGraduationCap className="mr-2" /> Class-Wise List
                </Button>
              </div>
            </>
          )}

          {filters.reportType === "YEARLY_SUMMARY" && (
            <>
              <p className="text-md font-semibold text-gray-700">
                Teacher Yearly Assignment Summary (Current Year vs Previous
                Year)
              </p>
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 text-sm mb-4">
                <p>
                  <strong>Base Year:</strong> {selectedYearName}
                </p>
                <p>
                  <strong>Filtered Campus:</strong> {selectedBranchName}
                </p>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => handleExportAction("EXPORT_YEARLY_SUMMARY")}
                  disabled={exportLoading || !filters.year}
                  loading={exportLoading}
                  variant="warning"
                >
                  <FaCalendarAlt className="mr-2" /> Generate Yearly Summary PDF
                </Button>
              </div>
            </>
          )}

          {exportError && (
            <p className="text-sm text-red-600 flex items-center bg-red-50 p-3 rounded-lg border border-red-300">
              <FaCheckCircle className="mr-2 text-red-500" /> {exportError}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ReportViewPage;

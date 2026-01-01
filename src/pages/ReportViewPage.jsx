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
  FaListUl,
  FaTable,
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

// --- 1. Table Component (আপনার পূর্বের Pagination ও Label লজিক সহ) ---
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

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(data.length / rowsPerPage) || 1;

  if (!ArrayOfData(data)) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
        <FaClipboardList className="text-6xl text-gray-400 mx-auto mb-4" />
        <p className="text-lg text-gray-600 font-medium">
          No records found matching criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-indigo-600 to-indigo-500 sticky top-0">
          <tr>
            {displayedHeaders.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap"
              >
                {headerLabel(header)}
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
                } else if (!cellValue) {
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
      <div className="flex justify-between items-center mt-4 px-4">
        <span className="text-sm text-gray-600 font-medium">
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

// --- 2. Main Page Component ---
const ReportViewPage = () => {
  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { _id: currentYear, name: `${currentYear}` },
    { _id: currentYear - 1, name: `${currentYear - 1}` },
    { _id: currentYear - 2, name: `${currentYear - 2}` },
  ];

  const [filters, setFilters] = useState({
    reportType: "DETAILED_ASSIGNMENT",
    year: currentYear,
    typeId: "",
    classId: "",
    branchId: "",
    status: "Assigned",
  });

  // নতুন স্টেটসমূহ
  const [includePrevious, setIncludePrevious] = useState(true);
  const [selectedRespTypes, setSelectedRespTypes] = useState([]);

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

  // আপনার পূর্বের Master Data Fetching লজিক
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [classesRes, typesRes, branchesRes] = await Promise.all([
          getClasses(),
          getResponsibilityTypes(),
          getBranches(),
        ]);
        const types = Array.isArray(typesRes.data) ? typesRes.data : [];
        setMasterData({
          classes: Array.isArray(classesRes.data) ? classesRes.data : [],
          types: types,
          branches: Array.isArray(branchesRes.data) ? branchesRes.data : [],
        });
        // Default: Yearly Summary এর জন্য সব টাইপ সিলেক্ট থাকবে
        setSelectedRespTypes(types.map((t) => t.name));
        setFetchTrigger((p) => p + 1);
      } catch (error) {
        toast.error("Failed to load filter options.");
      }
    };
    fetchMasterData();
  }, []);

  // আপনার পূর্বের Data Fetching লজিক
  const fetchReport = useCallback(async () => {
    if (fetchTrigger === 0) return;
    setLoading(true);
    try {
      const { data } = await getReportData(filters);
      setReportData(Array.isArray(data) ? data : []);
      if (!ArrayOfData(data)) toast("No records found.", { icon: "ℹ️" });
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Error fetching report data.");
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

  const toggleType = (name) => {
    setSelectedRespTypes((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  // আপনার পূর্বের Export লজিক এবং নতুন ফিচারগুলোর সমন্বয়
  const handleExportAction = async (exportType) => {
    setExportError(null);
    if (!filters.year) {
      setExportError("Year filter must be selected.");
      return;
    }

    const exportFilters = {
      ...filters,
      includePrevious: includePrevious.toString(),
    };

    // আপনার ছবির ফরম্যাট অনুযায়ী রুটিন এক্সপোর্ট
    if (exportType === "EXPORT_CAMPUS_ROUTINE") {
      if (!filters.branchId) {
        toast.error("Please select a Campus first.");
        return;
      }
      window.open(
        `/api/reports/export/campus-routine?branchId=${filters.branchId}&year=${filters.year}`,
        "_blank"
      );
      setIsExportModalOpen(false);
      return;
    }

    if (exportType === "EXPORT_YEARLY_SUMMARY") {
      if (selectedRespTypes.length === 0) {
        setExportError("Select at least one column.");
        return;
      }
      exportFilters.reportType = "YEARLY_SUMMARY";
      exportFilters.selectedTypes = selectedRespTypes.join(",");
    } else {
      if (!filters.typeId) {
        setExportError("Responsibility Type required.");
        return;
      }
      exportFilters.reportType = exportType;
      if (exportType === "EXPORT_CLASS_DETAILED" && !filters.classId) {
        setExportError("Select Class.");
        return;
      }
      if (exportType === "EXPORT_BRANCH_DETAILED" && !filters.branchId) {
        setExportError("Select Campus.");
        return;
      }
    }

    setExportLoading(true);
    try {
      await exportCustomReportToPDF(exportFilters);
      toast.success("PDF Download Started!");
      setIsExportModalOpen(false);
    } catch (err) {
      toast.error("PDF generation failed.");
    } finally {
      setExportLoading(false);
    }
  };

  const getFilterName = (id, options) => {
    const found = options.find((o) => o._id === id || o.id === id);
    return found ? found.name || found.label || "Selected" : "N/A";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-black text-indigo-900 flex items-center tracking-tight">
          <FaChartBar className="mr-3 text-indigo-600" />
          {filters.reportType === "YEARLY_SUMMARY"
            ? "Yearly Assignment Summary"
            : "Detailed Assignment Report"}
        </h2>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-2xl mb-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Button
            onClick={() =>
              setFilters((p) => ({ ...p, reportType: "DETAILED_ASSIGNMENT" }))
            }
            variant={
              filters.reportType === "DETAILED_ASSIGNMENT" ? "primary" : "light"
            }
          >
            Detailed View
          </Button>
          <Button
            onClick={() =>
              setFilters((p) => ({
                ...p,
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
            Yearly Summary
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 items-end">
          <SelectDropdown
            label="Academic Year"
            name="year"
            value={filters.year}
            onChange={handleChange}
            options={yearOptions}
          />
          <SelectDropdown
            label="Campus"
            name="branchId"
            value={filters.branchId}
            onChange={handleChange}
            options={masterData.branches}
            placeholder="Select Campus"
          />

          {filters.reportType === "DETAILED_ASSIGNMENT" && (
            <>
              <SelectDropdown
                label="Type"
                name="typeId"
                value={filters.typeId}
                onChange={handleChange}
                options={masterData.types}
                placeholder="All Types"
              />
              <SelectDropdown
                label="Class"
                name="classId"
                value={filters.classId}
                onChange={handleChange}
                options={masterData.classes}
                placeholder="All Classes"
              />
            </>
          )}

          <Button
            onClick={() => setFetchTrigger((p) => p + 1)}
            disabled={loading}
            variant="primary"
            fullWidth
            className="h-11 shadow-md shadow-indigo-100"
          >
            <FaSearch className={`mr-2 ${loading ? "animate-spin" : ""}`} />{" "}
            Fetch Data
          </Button>
        </div>
      </div>

      {/* Export Section */}
      <div className="mb-6 flex justify-end">
        <Button
          onClick={() => setIsExportModalOpen(true)}
          disabled={loading || !filters.year}
          variant="success"
          className="shadow-lg shadow-green-100"
        >
          <FaFilePdf className="mr-2" /> Export Options
        </Button>
      </div>

      {/* Results Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl shadow-sm border border-gray-50">
          <FaSyncAlt className="animate-spin text-5xl text-indigo-500 mb-4" />
          <p className="text-gray-500 font-bold animate-pulse">
            Loading reports...
          </p>
        </div>
      ) : (
        <ReportTable data={reportData} reportType={filters.reportType} />
      )}

      {/* Export Modal (সব ফাংশনালিটির সমন্বয়) */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Management"
      >
        <div className="p-4 space-y-6">
          {filters.reportType === "YEARLY_SUMMARY" ? (
            <div className="space-y-5">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between shadow-inner">
                <div>
                  <p className="text-sm font-bold text-indigo-900">
                    Include Previous Year
                  </p>
                  <p className="text-xs text-indigo-500">
                    Compare with {filters.year - 1}
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="w-6 h-6 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  checked={includePrevious}
                  onChange={(e) => setIncludePrevious(e.target.checked)}
                />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-bold text-gray-700 flex items-center">
                  <FaListUl className="mr-2" /> Select Column Responsibilities:
                </p>
                <div className="grid grid-cols-2 gap-2 p-3 border rounded-xl bg-gray-50 max-h-40 overflow-y-auto">
                  {masterData.types.map((t) => (
                    <label
                      key={t._id}
                      className="flex items-center space-x-2 text-xs font-semibold text-gray-600 cursor-pointer hover:text-indigo-600"
                    >
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedRespTypes.includes(t.name)}
                        onChange={() => toggleType(t.name)}
                      />
                      <span className="uppercase">{t.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button
                onClick={() => handleExportAction("EXPORT_YEARLY_SUMMARY")}
                fullWidth
                variant="warning"
                loading={exportLoading}
                className="py-3 font-bold"
              >
                <FaCalendarAlt className="mr-2" /> Generate Yearly PDF
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleExportAction("EXPORT_BRANCH_DETAILED")}
                  variant="primary"
                >
                  <FaBuilding className="mr-2" /> Campus List
                </Button>
                <Button
                  onClick={() => handleExportAction("EXPORT_CLASS_DETAILED")}
                  variant="primary"
                >
                  <FaGraduationCap className="mr-2" /> Class List
                </Button>
              </div>
              <Button
                onClick={() => handleExportAction("EXPORT_CAMPUS_ROUTINE")}
                variant="light"
                className="border-2 border-dashed border-indigo-200 text-indigo-700 py-3 font-bold hover:bg-indigo-50"
              >
                <FaTable className="mr-2" /> Export Routine (Image Format)
              </Button>
            </div>
          )}
          {exportError && (
            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 flex items-center font-bold">
              <FaCheckCircle className="mr-2 text-red-400" /> {exportError}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ReportViewPage;

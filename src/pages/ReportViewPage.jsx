import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  FaAngleLeft,
  FaAngleRight,
  FaFileExport,
  FaCubes,
  FaTerminal,
  FaShieldAlt,
  FaChevronDown,
} from "react-icons/fa";

import SelectDropdown from "../components/ui/SelectDropdown";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { useAuth } from "../context/AuthContext";

import {
  getClasses,
  getResponsibilityTypes,
  getBranches,
  getReportData,
  exportCustomReportToPDF,
  exportCampusRoutinePDF,
} from "../api/apiService";

const ArrayOfData = (data) => Array.isArray(data) && data.length > 0;
const displayValue = (value, fallback = "-") => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") return value.name || value.label || fallback;
  return value;
};

const DutyTypeMultiSelect = ({
  label,
  types,
  selectedIds,
  onToggle,
  onSelectAll,
  onClear,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCount = selectedIds.length;
  const allSelected = types.length > 0 && selectedCount === types.length;
  const selectedTypes = types.filter((type) => selectedIds.includes(type._id));
  const summaryText = allSelected
    ? "All duty types"
    : selectedCount
    ? `${selectedCount} selected`
    : required
    ? "Select duty types"
    : "All duty types";

  return (
    <div className="relative space-y-1">
      <p className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </p>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className={`flex h-[48px] w-full items-center justify-between gap-3 rounded-xl border bg-white px-3 text-left shadow-sm transition-all ${
          isOpen
            ? "border-indigo-300 ring-4 ring-indigo-50"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-slate-800">
              {summaryText}
            </span>
            {selectedCount > 0 && !allSelected && (
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[9px] font-black uppercase text-indigo-700">
                {selectedCount}
              </span>
            )}
          </div>
          {selectedCount > 0 && !allSelected && (
            <p className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-tight text-slate-400">
              {selectedTypes
                .slice(0, 2)
                .map((type) => type.name)
                .join(", ")}
              {selectedCount > 2 ? ` +${selectedCount - 2}` : ""}
            </p>
          )}
        </div>
        <FaChevronDown className="flex-none text-xs text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-[70] mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/60">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              {summaryText}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSelectAll}
                className="rounded-md px-2 py-1 text-[9px] font-black uppercase tracking-widest text-teal-700 hover:bg-teal-50"
              >
                All
              </button>
              <button
                type="button"
                onClick={onClear}
                className="rounded-md px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-rose-50 hover:text-rose-500"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="grid max-h-56 grid-cols-1 gap-1.5 overflow-y-auto p-2 custom-scrollbar sm:grid-cols-2">
            {types.map((type) => {
              const isSelected = selectedIds.includes(type._id);
              return (
                <button
                  type="button"
                  key={type._id}
                  onClick={() => onToggle(type._id)}
                  className={`flex min-w-0 items-center justify-between gap-2 rounded-xl border px-2.5 py-2 text-left transition-all ${
                    isSelected
                      ? "border-teal-200 bg-teal-50 text-teal-800"
                      : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  <span className="truncate text-[10px] font-black uppercase tracking-tight">
                    {type.name}
                  </span>
                  <span
                    className={`grid h-4 w-4 flex-none place-items-center rounded-md border ${
                      isSelected
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-slate-200 bg-white text-transparent"
                    }`}
                  >
                    <FaCheckCircle size={8} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- 1. Modern Responsive Table/Card Component ---
const ReportTable = ({ data, reportType, rowsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const displayedHeaders =
    reportType === "UNASSIGNED_TEACHERS"
      ? ["Sl.", "TEACHERID", "TEACHER", "CAMPUS", "YEAR", "MISSING_DUTIES"]
      : reportType === "INACTIVE_NO_ROUTINE"
      ? ["Sl.", "TEACHERID", "TEACHER", "CAMPUS", "YEAR", "STATUS", "ROUTINE_STATUS"]
      : ["Sl.", "RESPONSIBILITY_TYPE", "CLASS", "SUBJECT", "TEACHER", "CAMPUS"];

  const headerLabel = (key) => {
    const labels = {
      "Sl.": "S.L.",
      CLASS: "Class Node",
      SUBJECT: "Subject Vector",
      TEACHER: "Teacher Node",
      CAMPUS: "Branch",
      TEACHERID: "Teacher ID",
      YEAR: "Year",
      RESPONSIBILITY_TYPE: "Duty Type",
      MISSING_DUTIES: "Missing Duties",
      STATUS: "Status",
      ROUTINE_STATUS: "Routine",
    };
    return labels[key] || key;
  };

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(data.length / rowsPerPage) || 1;

  if (!ArrayOfData(data)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 sm:py-32 bg-white/40 backdrop-blur-xl rounded-[2rem] sm:rounded-[3rem] border border-dashed border-slate-200 text-center px-4">
        <FaClipboardList className="text-4xl sm:text-6xl text-slate-200 mb-6" />
        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
          Zero data points in current matrix
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm transition-all hover:shadow-indigo-50">
      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-slate-100">
              {displayedHeaders.map((header, index) => (
                <th
                  key={index}
                  className="border border-slate-400 px-5 py-4 text-left text-[9px] font-black uppercase tracking-widest text-slate-700"
                >
                  {headerLabel(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="group transition-all hover:bg-indigo-50/40"
              >
                {displayedHeaders.map((key, colIndex) => {
                  let cellValue = row[key];
                  if (key === "Sl.")
                    cellValue = (currentPage - 1) * rowsPerPage + rowIndex + 1;
                  if (typeof cellValue === "object" && cellValue !== null)
                    cellValue = cellValue.name || cellValue.label || "-";
                  return (
                    <td
                      key={colIndex}
                      className={`border border-slate-300 px-5 py-4 text-[11px] font-bold ${
                        key === "Sl." ? "text-indigo-700" : "text-slate-800"
                      } uppercase tracking-tight`}
                    >
                      {cellValue || "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View: Cards */}
      <div className="divide-y divide-slate-300 md:hidden">
        {paginatedData.map((row, rowIndex) => (
          <div key={rowIndex} className="p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-indigo-400 uppercase">
                Node #{(currentPage - 1) * rowsPerPage + rowIndex + 1}
              </span>
              <span className="px-2 py-0.5 bg-slate-100 text-[8px] font-black text-slate-500 rounded uppercase tracking-tighter">
                {displayValue(row.CAMPUS, "Global")}
              </span>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Teacher Node
              </p>
              <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                {displayValue(row.TEACHER)}
              </p>
            </div>
            {reportType === "UNASSIGNED_TEACHERS" ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Teacher ID
                  </p>
                  <p className="text-[11px] font-bold text-slate-600 uppercase">
                    {displayValue(row.TEACHERID)}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Duty
                  </p>
                  <p className="text-[11px] font-bold text-slate-600 uppercase">
                    {displayValue(row.MISSING_DUTIES)}
                  </p>
                </div>
              </div>
            ) : reportType === "INACTIVE_NO_ROUTINE" ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Teacher ID
                  </p>
                  <p className="text-[11px] font-bold text-slate-600 uppercase">
                    {displayValue(row.TEACHERID)}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Routine
                  </p>
                  <p className="text-[11px] font-bold text-slate-600 uppercase">
                    {displayValue(row.ROUTINE_STATUS)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Duty
                  </p>
                  <p className="text-[11px] font-bold text-slate-600 uppercase">
                    {displayValue(row.RESPONSIBILITY_TYPE)}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Class
                  </p>
                  <p className="text-[11px] font-bold text-slate-600 uppercase">
                    {displayValue(row.CLASS)}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Subject
                  </p>
                  <p className="text-[11px] font-bold text-slate-600 uppercase">
                    {displayValue(row.SUBJECT)}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination Container */}
      <div className="flex flex-col sm:row justify-between items-center mt-6 p-4 border-t border-slate-50 gap-4">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          Buffer Page {currentPage} / {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="h-10 w-10 sm:h-8 sm:w-8 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white disabled:opacity-30 transition-all shadow-sm"
          >
            <FaAngleLeft size={10} />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="h-10 w-10 sm:h-8 sm:w-8 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white disabled:opacity-30 transition-all shadow-sm"
          >
            <FaAngleRight size={10} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 2. Main Page Component ---
const ReportViewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const yearOptions = useMemo(() => {
    const startYear = 2024;
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = startYear; y <= currentYear + 1; y++) {
      years.push({ _id: y, name: `${y}` });
    }
    return years.reverse();
  }, []);

  const [filters, setFilters] = useState({
    reportType: "DETAILED_ASSIGNMENT",
    year: new Date().getFullYear(),
    typeId: "",
    classId: "",
    branchId: "",
    status: "Assigned",
  });

  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.error("Unauthorized Access: Report Matrix restricted.");
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const [includePrevious, setIncludePrevious] = useState(true);
  const [selectedRespTypes, setSelectedRespTypes] = useState([]);
  const [selectedDetailedTypeIds, setSelectedDetailedTypeIds] = useState([]);
  const [selectedUnassignedTypeIds, setSelectedUnassignedTypeIds] = useState(
    []
  );
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
        const types = typesRes.data || [];
        setMasterData({
          classes: classesRes.data || [],
          types: types,
          branches: branchesRes.data || [],
        });
        setSelectedRespTypes(types.map((t) => t.name));
        setFetchTrigger((p) => p + 1);
      } catch (error) {
        toast.error("Master buffer failed.");
      }
    };
    fetchMasterData();
  }, []);

  const fetchReport = useCallback(async () => {
    if (fetchTrigger === 0) return;
    const isUnassignedReport = filters.reportType === "UNASSIGNED_TEACHERS";
    const isDetailedReport = filters.reportType === "DETAILED_ASSIGNMENT";
    if (isUnassignedReport && selectedUnassignedTypeIds.length === 0) {
      setReportData([]);
      return;
    }
    setLoading(true);
    try {
      let reportFilters = filters;
      if (isUnassignedReport) {
        reportFilters = {
          ...filters,
          typeId: "",
          typeIds: selectedUnassignedTypeIds.join(","),
        };
      } else if (isDetailedReport) {
        reportFilters = {
          ...filters,
          typeId: "",
          typeIds: selectedDetailedTypeIds.join(","),
        };
      }
      const { data } = await getReportData(reportFilters);
      setReportData(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Matrix sync failed.");
    } finally {
      setLoading(false);
    }
  }, [filters, fetchTrigger, selectedDetailedTypeIds, selectedUnassignedTypeIds]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport, fetchTrigger]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "reportType" && value === "YEARLY_SUMMARY"
        ? { typeId: "", classId: "", status: "" }
        : {}),
      ...(name === "reportType" && value === "UNASSIGNED_TEACHERS"
        ? { typeId: "", classId: "", status: "" }
        : {}),
      ...(name === "reportType" && value === "INACTIVE_NO_ROUTINE"
        ? { typeId: "", classId: "", status: "" }
        : {}),
    }));
  };

  const toggleTypeId = (setter) => (typeId) => {
    setter((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    );
  };

  const selectAllTypeIds = (setter) => {
    setter(masterData.types.map((type) => type._id));
  };

  const handleExportAction = async (exportType) => {
    setExportError(null);
    const exportFilters = {
      ...filters,
      includePrevious: includePrevious.toString(),
    };

    if (exportType === "EXPORT_CAMPUS_ROUTINE") {
      if (!filters.branchId) return toast.error("Select target campus node.");
      setExportLoading(true);
      try {
        await exportCampusRoutinePDF({
          branchId: filters.branchId,
          year: filters.year,
        });
        toast.success("Campus routine export initialized.");
        setIsExportModalOpen(false);
      } catch (error) {
        toast.error(error.reportMessage || "Export Protocol error.");
      } finally {
        setExportLoading(false);
      }
      return;
    }

    if (exportType === "EXPORT_YEARLY_SUMMARY") {
      if (selectedRespTypes.length === 0)
        return setExportError("Minimum 1 column vector required.");
      exportFilters.reportType = "YEARLY_SUMMARY";
      exportFilters.selectedTypes = selectedRespTypes.join(",");
    } else if (exportType === "EXPORT_UNASSIGNED") {
      if (selectedUnassignedTypeIds.length === 0)
        return setExportError("Minimum 1 duty prototype required.");
      exportFilters.reportType = "UNASSIGNED_TEACHERS";
      exportFilters.typeId = "";
      exportFilters.typeIds = selectedUnassignedTypeIds.join(",");
    } else if (exportType === "EXPORT_INACTIVE_NO_ROUTINE") {
      exportFilters.reportType = "INACTIVE_NO_ROUTINE";
      exportFilters.typeId = "";
    } else {
      exportFilters.reportType = exportType;
      exportFilters.typeId = "";
      exportFilters.typeIds = selectedDetailedTypeIds.join(",");
      if (exportType === "EXPORT_CLASS_DETAILED" && !filters.classId)
        return setExportError("Class node required.");
      if (exportType === "EXPORT_BRANCH_DETAILED" && !filters.branchId)
        return setExportError("Campus node required.");
    }

    setExportLoading(true);
    try {
      await exportCustomReportToPDF(exportFilters);
      toast.success("Report export initialized.");
      setIsExportModalOpen(false);
    } catch (error) {
      toast.error(error.reportMessage || "Export Protocol error.");
    } finally {
      setExportLoading(false);
    }
  };

  if (user?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-transparent pb-10 pt-6 sm:pt-8 px-4 sm:px-8 relative overflow-hidden">

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* --- HEADER --- */}
        <div className="mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="h-12 w-12 sm:h-16 sm:w-16 bg-slate-900 rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center text-indigo-400 shadow-2xl">
              <FaChartBar className="text-xl sm:text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none uppercase mb-1 sm:mb-2">
                Audit Matrix <span className="text-indigo-600">.</span>
              </h1>
              <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.4em] flex items-center gap-2">
                <FaTerminal className="text-indigo-500" /> DUTY REPORTING ENGINE
              </p>
            </div>
          </div>

          <div className="flex bg-white p-1 rounded-2xl sm:rounded-[1.5rem] shadow-xl border border-slate-100 self-start md:self-auto">
            <button
              onClick={() =>
                setFilters((p) => ({
                  ...p,
                  reportType: "DETAILED_ASSIGNMENT",
                  status: "Assigned",
                }))
              }
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                filters.reportType === "DETAILED_ASSIGNMENT"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Detailed
            </button>
            <button
              onClick={() =>
                setFilters((p) => ({
                  ...p,
                  reportType: "UNASSIGNED_TEACHERS",
                  classId: "",
                  status: "",
                }))
              }
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                filters.reportType === "UNASSIGNED_TEACHERS"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Unassigned
            </button>
            <button
              onClick={() =>
                setFilters((p) => ({
                  ...p,
                  reportType: "INACTIVE_NO_ROUTINE",
                  typeId: "",
                  classId: "",
                  status: "",
                }))
              }
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                filters.reportType === "INACTIVE_NO_ROUTINE"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              No Routine
            </button>
            <button
              onClick={() =>
                setFilters((p) => ({
                  ...p,
                  reportType: "YEARLY_SUMMARY",
                  typeId: "",
                  classId: "",
                  status: "",
                }))
              }
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                filters.reportType === "YEARLY_SUMMARY"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* --- DYNAMIC FILTER PANEL --- */}
        <div className="relative z-50 mb-8 overflow-visible rounded-2xl border border-white bg-white/85 p-4 shadow-sm backdrop-blur-xl sm:p-5">
          <div className="relative z-10 grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[0.75fr_1fr_1.25fr_0.85fr_0.75fr]">
            <SelectDropdown
              label="Cycle Year"
              name="year"
              value={filters.year}
              onChange={handleChange}
              options={yearOptions}
              required
            />
            <SelectDropdown
              label="Campus Node"
              name="branchId"
              value={filters.branchId}
              onChange={handleChange}
              options={masterData.branches}
              placeholder="All Sectors"
            />
            {filters.reportType === "DETAILED_ASSIGNMENT" && (
              <DutyTypeMultiSelect
                label="Duty Prototypes"
                types={masterData.types}
                selectedIds={selectedDetailedTypeIds}
                onToggle={toggleTypeId(setSelectedDetailedTypeIds)}
                onSelectAll={() => selectAllTypeIds(setSelectedDetailedTypeIds)}
                onClear={() => setSelectedDetailedTypeIds([])}
              />
            )}
            {filters.reportType === "UNASSIGNED_TEACHERS" && (
              <DutyTypeMultiSelect
                label="Duty Prototypes"
                types={masterData.types}
                selectedIds={selectedUnassignedTypeIds}
                onToggle={toggleTypeId(setSelectedUnassignedTypeIds)}
                onSelectAll={() =>
                  selectAllTypeIds(setSelectedUnassignedTypeIds)
                }
                onClear={() => setSelectedUnassignedTypeIds([])}
                required
              />
            )}
            {filters.reportType === "DETAILED_ASSIGNMENT" && (
              <>
                <SelectDropdown
                  label="Class Cohort"
                  name="classId"
                  value={filters.classId}
                  onChange={handleChange}
                  options={masterData.classes}
                  placeholder="All Levels"
                />
              </>
            )}
            <button
              onClick={() => setFetchTrigger((p) => p + 1)}
              disabled={loading}
              className="h-[48px] w-full rounded-xl bg-slate-900 text-[9px] font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-indigo-600 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} /> Sync
              Matrix
            </button>
          </div>
        </div>

        {/* --- RESULTS --- */}
        <div className="relative z-0 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-indigo-100 rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
            >
              <FaFileExport /> Export Report
            </button>
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 sm:py-40 bg-white/40 backdrop-blur-md rounded-[2rem] sm:rounded-[4rem]">
              <FaSyncAlt className="animate-spin text-5xl sm:text-7xl text-indigo-500/20 mb-6 sm:mb-8" />
              <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] sm:tracking-[0.5em] animate-pulse">
                Decrypting Buffer Matrix
              </p>
            </div>
          ) : filters.reportType === "UNASSIGNED_TEACHERS" &&
            selectedUnassignedTypeIds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 sm:py-32 bg-white/40 backdrop-blur-xl rounded-[2rem] sm:rounded-[3rem] border border-dashed border-slate-200 text-center px-4">
              <FaSearch className="text-4xl sm:text-6xl text-slate-200 mb-6" />
              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                Select at least one duty type to view unassigned teachers
              </p>
            </div>
          ) : (
            <ReportTable data={reportData} reportType={filters.reportType} />
          )}
        </div>

        {/* --- EXPORT MODAL --- */}
        <Modal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          title={
            <div className="flex items-center gap-2 text-sm sm:text-base uppercase font-black text-slate-800 tracking-tighter">
              <FaFileExport className="text-indigo-600" /> Data Export Engine
            </div>
          }
        >
          <div className="p-1 sm:p-2 space-y-6 sm:space-y-8">
            {filters.reportType === "YEARLY_SUMMARY" ? (
              <div className="space-y-6 sm:space-y-8">
                <div className="bg-indigo-50/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-indigo-100 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-[10px] sm:text-[11px] font-black text-indigo-900 uppercase">
                      Archive Comparison
                    </p>
                    <p className="text-[8px] sm:text-[9px] font-bold text-indigo-400 uppercase mt-1 tracking-widest italic truncate">
                      Include {filters.year - 1} session logs
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg text-indigo-600 cursor-pointer"
                    checked={includePrevious}
                    onChange={(e) => setIncludePrevious(e.target.checked)}
                  />
                </div>
                <div className="space-y-4">
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FaCubes className="text-indigo-600" /> Projections:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 p-3 sm:p-4 border border-slate-100 rounded-2xl sm:rounded-[2rem] bg-slate-50/50 max-h-40 sm:max-h-48 overflow-y-auto custom-scrollbar">
                    {masterData.types.map((t) => (
                      <label
                        key={t._id}
                        className="flex items-center gap-3 p-2.5 bg-white rounded-lg sm:rounded-xl cursor-pointer hover:bg-indigo-50 border border-white shadow-sm"
                      >
                        <input
                          type="checkbox"
                          className="rounded text-indigo-600"
                          checked={selectedRespTypes.includes(t.name)}
                          onChange={() =>
                            setSelectedRespTypes((p) =>
                              p.includes(t.name)
                                ? p.filter((x) => x !== t.name)
                                : [...p, t.name]
                            )
                          }
                        />
                        <span className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase truncate">
                          {t.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => handleExportAction("EXPORT_YEARLY_SUMMARY")}
                  fullWidth
                  variant="primary"
                  loading={exportLoading}
                  className="py-4 sm:py-5 rounded-xl sm:rounded-2xl uppercase font-black text-[10px] tracking-widest bg-slate-900"
                >
                  Execute Export
                </Button>
              </div>
            ) : filters.reportType === "UNASSIGNED_TEACHERS" ? (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-indigo-50/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-indigo-100">
                  <p className="text-[10px] sm:text-[11px] font-black text-indigo-900 uppercase">
                    Unassigned teacher list
                  </p>
                  <p className="text-[8px] sm:text-[9px] font-bold text-indigo-400 uppercase mt-1 tracking-widest italic">
                    Year and selected duty types are taken from the active filters
                  </p>
                </div>
                <Button
                  onClick={() => handleExportAction("EXPORT_UNASSIGNED")}
                  fullWidth
                  variant="primary"
                  loading={exportLoading}
                  className="py-4 sm:py-5 rounded-xl sm:rounded-2xl uppercase font-black text-[10px] tracking-widest bg-slate-900"
                >
                  Execute Export
                </Button>
              </div>
            ) : filters.reportType === "INACTIVE_NO_ROUTINE" ? (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-indigo-50/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-indigo-100">
                  <p className="text-[10px] sm:text-[11px] font-black text-indigo-900 uppercase">
                    Teachers without routine
                  </p>
                  <p className="text-[8px] sm:text-[9px] font-bold text-indigo-400 uppercase mt-1 tracking-widest italic">
                    Year and campus are taken from the active filters
                  </p>
                </div>
                <Button
                  onClick={() =>
                    handleExportAction("EXPORT_INACTIVE_NO_ROUTINE")
                  }
                  fullWidth
                  variant="primary"
                  loading={exportLoading}
                  className="py-4 sm:py-5 rounded-xl sm:rounded-2xl uppercase font-black text-[10px] tracking-widest bg-slate-900"
                >
                  Execute Export
                </Button>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <button
                    onClick={() => handleExportAction("EXPORT_BRANCH_DETAILED")}
                    className="p-6 sm:p-8 bg-slate-50 hover:bg-white border border-slate-100 text-slate-900 rounded-[1.5rem] sm:rounded-[2.5rem] flex flex-col items-center gap-2 sm:gap-3 uppercase font-black text-[9px] sm:text-[10px] tracking-widest transition-all"
                  >
                    <FaBuilding size={20} className="text-indigo-600" /> Branch
                    Map
                  </button>
                  <button
                    onClick={() => handleExportAction("EXPORT_CLASS_DETAILED")}
                    className="p-6 sm:p-8 bg-slate-50 hover:bg-white border border-slate-100 text-slate-900 rounded-[1.5rem] sm:rounded-[2.5rem] flex flex-col items-center gap-2 sm:gap-3 uppercase font-black text-[9px] sm:text-[10px] tracking-widest transition-all"
                  >
                    <FaGraduationCap size={20} className="text-indigo-600" />{" "}
                    Level Map
                  </button>
                </div>
                <button
                  onClick={() => handleExportAction("EXPORT_CAMPUS_ROUTINE")}
                  className="w-full py-4 sm:py-5 border-2 border-dashed border-indigo-100 text-indigo-600 rounded-2xl sm:rounded-3xl uppercase font-black text-[9px] sm:text-[10px] tracking-widest flex items-center justify-center gap-3"
                >
                  <FaTerminal /> Initial Campus Routine Index
                </button>
              </div>
            )}
            {exportError && (
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest text-center">
                {exportError}
              </p>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ReportViewPage;

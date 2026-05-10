import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaAngleLeft,
  FaAngleRight,
  FaBookOpen,
  FaBuilding,
  FaCalendarCheck,
  FaChartBar,
  FaCheck,
  FaCheckCircle,
  FaChevronDown,
  FaClipboardList,
  FaFileExport,
  FaGraduationCap,
  FaSearch,
  FaShieldAlt,
  FaSyncAlt,
  FaTable,
  FaTasks,
  FaUserClock,
  FaUserTie,
} from "react-icons/fa";

import SelectDropdown from "../components/ui/SelectDropdown";
import Modal from "../components/ui/Modal";
import { useAuth } from "../context/AuthContext";

import {
  exportCampusRoutinePDF,
  exportCustomReportToPDF,
  getBranches,
  getClasses,
  getReportData,
  getResponsibilityTypes,
} from "../api/apiService";

const hasRows = (data) => Array.isArray(data) && data.length > 0;

const displayValue = (value, fallback = "-") => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") return value.name || value.label || fallback;
  return value;
};

const reportTypes = [
  {
    id: "DETAILED_ASSIGNMENT",
    label: "Detailed",
    description: "Assignment level duty records",
    icon: FaTable,
  },
  {
    id: "UNASSIGNED_TEACHERS",
    label: "Unassigned",
    description: "Teachers missing selected duties",
    icon: FaUserTie,
  },
  {
    id: "INACTIVE_NO_ROUTINE",
    label: "No Routine",
    description: "Inactive teachers without routines",
    icon: FaUserClock,
  },
  {
    id: "YEARLY_SUMMARY",
    label: "Yearly",
    description: "Annual responsibility summary",
    icon: FaChartBar,
  },
];

const getReportTitle = (reportType) =>
  reportTypes.find((item) => item.id === reportType)?.label || "Report";

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
    <div className="relative space-y-1.5">
      <p className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </p>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className={`flex h-[48px] w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 text-left transition-colors ${
          isOpen
            ? "border-slate-700 ring-2 ring-slate-200"
            : "border-slate-300 hover:border-slate-400"
        }`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-slate-900">
              {summaryText}
            </span>
            {selectedCount > 0 && !allSelected && (
              <span className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">
                {selectedCount}
              </span>
            )}
          </div>
          {selectedCount > 0 && !allSelected && (
            <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
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
        <div className="absolute left-0 right-0 top-full z-[70] mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <span className="text-xs font-semibold text-slate-500">
              {summaryText}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSelectAll}
                className="rounded-md px-2 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50"
              >
                All
              </button>
              <button
                type="button"
                onClick={onClear}
                className="rounded-md px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="grid max-h-56 grid-cols-1 gap-1.5 overflow-y-auto p-2 sm:grid-cols-2">
            {types.map((type) => {
              const isSelected = selectedIds.includes(type._id);
              return (
                <button
                  type="button"
                  key={type._id}
                  onClick={() => onToggle(type._id)}
                  className={`flex min-w-0 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                    isSelected
                      ? "border-teal-200 bg-teal-50 text-teal-800"
                      : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  <span className="truncate text-xs font-semibold">
                    {type.name}
                  </span>
                  <span
                    className={`grid h-5 w-5 flex-none place-items-center rounded-md border ${
                      isSelected
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-slate-200 bg-white text-transparent"
                    }`}
                  >
                    <FaCheckCircle size={10} />
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

const ReportTypeTabs = ({ activeType, onChange }) => (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
    {reportTypes.map((item) => {
      const Icon = item.icon;
      const active = activeType === item.id;
      return (
        <button
          type="button"
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`rounded-lg border p-4 text-left transition-all ${
            active
              ? "border-slate-900 bg-slate-900 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div
              className={`grid h-10 w-10 place-items-center rounded-lg ${
                active ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              <Icon size={16} />
            </div>
            {active && <FaCheck className="mt-1 text-xs text-white/80" />}
          </div>
          <p
            className={`mt-4 text-sm font-semibold ${
              active ? "text-white" : "text-slate-950"
            }`}
          >
            {item.label}
          </p>
          <p
            className={`mt-1 text-xs font-medium ${
              active ? "text-white/70" : "text-slate-500"
            }`}
          >
            {item.description}
          </p>
        </button>
      );
    })}
  </div>
);

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      </div>
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-700">
        <Icon size={16} />
      </div>
    </div>
  </div>
);

const getHeaders = (reportType) => {
  if (reportType === "UNASSIGNED_TEACHERS") {
    return ["Sl.", "TEACHERID", "TEACHER", "CAMPUS", "YEAR", "MISSING_DUTIES"];
  }

  if (reportType === "INACTIVE_NO_ROUTINE") {
    return [
      "Sl.",
      "TEACHERID",
      "TEACHER",
      "CAMPUS",
      "YEAR",
      "STATUS",
      "ROUTINE_STATUS",
    ];
  }

  return ["Sl.", "RESPONSIBILITY_TYPE", "CLASS", "SUBJECT", "TEACHER", "CAMPUS"];
};

const headerLabel = (key) => {
  const labels = {
    "Sl.": "S.L.",
    CLASS: "Class",
    SUBJECT: "Subject",
    TEACHER: "Teacher",
    CAMPUS: "Campus",
    TEACHERID: "Teacher ID",
    YEAR: "Year",
    RESPONSIBILITY_TYPE: "Duty Type",
    MISSING_DUTIES: "Missing Duties",
    STATUS: "Status",
    ROUTINE_STATUS: "Routine",
  };
  return labels[key] || key;
};

const ReportTable = ({ data, reportType, rowsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const displayedHeaders = getHeaders(reportType);
  const totalPages = Math.ceil(data.length / rowsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (activePage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, activePage, rowsPerPage]);

  if (!hasRows(data)) {
    return (
      <div className="grid min-h-[320px] place-items-center rounded-lg border border-dashed border-slate-300 bg-white px-4 text-center">
        <div>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-slate-100 text-slate-400">
            <FaClipboardList size={24} />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-600">
            No records found
          </p>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Adjust the filters and sync the report again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {displayedHeaders.map((header) => (
                <th
                  key={header}
                  className="px-5 py-4 text-left text-xs font-semibold text-slate-600"
                >
                  {headerLabel(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="transition-colors hover:bg-slate-50">
                {displayedHeaders.map((key) => {
                  let cellValue = row[key];
                  if (key === "Sl.") {
                    cellValue = (activePage - 1) * rowsPerPage + rowIndex + 1;
                  }

                  return (
                    <td
                      key={key}
                      className={`px-5 py-4 text-sm font-medium ${
                        key === "Sl." ? "text-teal-700" : "text-slate-800"
                      }`}
                    >
                      {displayValue(cellValue)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {paginatedData.map((row, rowIndex) => (
          <div key={rowIndex} className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-teal-700">
                Record {(activePage - 1) * rowsPerPage + rowIndex + 1}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                {displayValue(row.CAMPUS, "All campuses")}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Teacher</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {displayValue(row.TEACHER)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {displayedHeaders
                .filter((key) => !["Sl.", "TEACHER", "CAMPUS"].includes(key))
                .slice(0, 4)
                .map((key) => (
                  <div key={key} className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-500">
                      {headerLabel(key)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {displayValue(row[key])}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-medium text-slate-500">
          Page {activePage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            disabled={activePage === 1}
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <FaAngleLeft size={12} />
          </button>
          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) => Math.min(page + 1, totalPages))
            }
            disabled={activePage === totalPages}
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <FaAngleRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ReportViewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const yearOptions = useMemo(() => {
    const startYear = 2024;
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = startYear; year <= currentYear + 1; year += 1) {
      years.push({ _id: year, name: `${year}` });
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
  const [includePrevious, setIncludePrevious] = useState(true);
  const [selectedRespTypes, setSelectedRespTypes] = useState([]);
  const [selectedDetailedTypeIds, setSelectedDetailedTypeIds] = useState([]);
  const [selectedUnassignedTypeIds, setSelectedUnassignedTypeIds] = useState([]);
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
    if (user && user.role !== "admin") {
      toast.error("Reports are restricted to admins.");
      navigate("/");
    }
  }, [user, navigate]);

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
          types,
          branches: branchesRes.data || [],
        });
        setSelectedRespTypes(types.map((type) => type.name));
        setFetchTrigger((value) => value + 1);
      } catch (error) {
        toast.error("Failed to load report filters.");
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
      toast.error("Failed to sync report.");
    } finally {
      setLoading(false);
    }
  }, [filters, fetchTrigger, selectedDetailedTypeIds, selectedUnassignedTypeIds]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport, fetchTrigger]);

  const setReportType = (reportType) => {
    setFilters((prev) => ({
      ...prev,
      reportType,
      ...(reportType === "DETAILED_ASSIGNMENT"
        ? { status: "Assigned" }
        : { typeId: "", classId: "", status: "" }),
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
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
      if (!filters.branchId) {
        setExportError("Select a campus before exporting routine index.");
        return;
      }
      setExportLoading(true);
      try {
        await exportCampusRoutinePDF({
          branchId: filters.branchId,
          year: filters.year,
        });
        toast.success("Campus routine export initialized.");
        setIsExportModalOpen(false);
      } catch (error) {
        toast.error(error.reportMessage || "Export failed.");
      } finally {
        setExportLoading(false);
      }
      return;
    }

    if (exportType === "EXPORT_YEARLY_SUMMARY") {
      if (selectedRespTypes.length === 0) {
        setExportError("Select at least one duty type.");
        return;
      }
      exportFilters.reportType = "YEARLY_SUMMARY";
      exportFilters.selectedTypes = selectedRespTypes.join(",");
    } else if (exportType === "EXPORT_UNASSIGNED") {
      if (selectedUnassignedTypeIds.length === 0) {
        setExportError("Select at least one duty type.");
        return;
      }
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
      if (exportType === "EXPORT_CLASS_DETAILED" && !filters.classId) {
        setExportError("Select a class before exporting class detail.");
        return;
      }
      if (exportType === "EXPORT_BRANCH_DETAILED" && !filters.branchId) {
        setExportError("Select a campus before exporting campus detail.");
        return;
      }
    }

    setExportLoading(true);
    try {
      await exportCustomReportToPDF(exportFilters);
      toast.success("Report export initialized.");
      setIsExportModalOpen(false);
    } catch (error) {
      toast.error(error.reportMessage || "Export failed.");
    } finally {
      setExportLoading(false);
    }
  };

  const selectedBranch = masterData.branches.find(
    (branch) => String(branch._id) === String(filters.branchId)
  );
  const selectedClass = masterData.classes.find(
    (item) => String(item._id) === String(filters.classId)
  );

  if (user?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-10 pt-5 text-slate-900 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-[1440px] space-y-6">
        <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                <FaShieldAlt size={12} />
                Admin reporting
              </div>
              <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
                Reports
              </h1>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
                Review duty coverage, unassigned teachers, campus routines, and
                yearly responsibility summaries from one focused workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              <FaFileExport size={14} />
              Export Report
            </button>
          </div>
        </header>

        <ReportTypeTabs activeType={filters.reportType} onChange={setReportType} />

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Filter report
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {getReportTitle(filters.reportType)} report for {filters.year}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFetchTrigger((value) => value + 1)}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} />
              Sync Report
            </button>
          </div>

          <div className="relative z-50 grid grid-cols-1 items-end gap-4 md:grid-cols-2 xl:grid-cols-5">
            <SelectDropdown
              label="Year"
              name="year"
              value={filters.year}
              onChange={handleChange}
              options={yearOptions}
              required
            />
            <SelectDropdown
              label="Campus"
              name="branchId"
              value={filters.branchId}
              onChange={handleChange}
              options={masterData.branches}
              placeholder="All campuses"
            />
            {filters.reportType === "DETAILED_ASSIGNMENT" && (
              <DutyTypeMultiSelect
                label="Duty types"
                types={masterData.types}
                selectedIds={selectedDetailedTypeIds}
                onToggle={toggleTypeId(setSelectedDetailedTypeIds)}
                onSelectAll={() => selectAllTypeIds(setSelectedDetailedTypeIds)}
                onClear={() => setSelectedDetailedTypeIds([])}
              />
            )}
            {filters.reportType === "UNASSIGNED_TEACHERS" && (
              <DutyTypeMultiSelect
                label="Duty types"
                types={masterData.types}
                selectedIds={selectedUnassignedTypeIds}
                onToggle={toggleTypeId(setSelectedUnassignedTypeIds)}
                onSelectAll={() => selectAllTypeIds(setSelectedUnassignedTypeIds)}
                onClear={() => setSelectedUnassignedTypeIds([])}
                required
              />
            )}
            {filters.reportType === "DETAILED_ASSIGNMENT" && (
              <SelectDropdown
                label="Class"
                name="classId"
                value={filters.classId}
                onChange={handleChange}
                options={masterData.classes}
                placeholder="All classes"
              />
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard icon={FaClipboardList} label="Rows Found" value={reportData.length} />
          <StatCard
            icon={FaBuilding}
            label="Campus"
            value={selectedBranch?.name || "All"}
          />
          <StatCard
            icon={FaCalendarCheck}
            label="Year"
            value={filters.year}
          />
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Report results
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {selectedClass ? `${selectedClass.name} class filter active` : "Filtered output is ready for review"}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
              <FaTasks />
              {getReportTitle(filters.reportType)}
            </span>
          </div>

          {loading ? (
            <div className="grid min-h-[360px] place-items-center rounded-lg border border-slate-200 bg-white">
              <div className="text-center">
                <FaSyncAlt className="mx-auto animate-spin text-4xl text-teal-600/40" />
                <p className="mt-4 text-sm font-semibold text-slate-500">
                  Syncing report data...
                </p>
              </div>
            </div>
          ) : filters.reportType === "UNASSIGNED_TEACHERS" &&
            selectedUnassignedTypeIds.length === 0 ? (
            <div className="grid min-h-[320px] place-items-center rounded-lg border border-dashed border-slate-300 bg-white px-4 text-center">
              <div>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-slate-100 text-slate-400">
                  <FaSearch size={24} />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-600">
                  Select at least one duty type
                </p>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Unassigned teacher reports need a duty type target.
                </p>
              </div>
            </div>
          ) : (
            <ReportTable data={reportData} reportType={filters.reportType} />
          )}
        </section>

        <Modal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          title="Export Report"
        >
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">
                {getReportTitle(filters.reportType)} export
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Export uses your current year, campus, class, and duty filters.
              </p>
            </div>

            {filters.reportType === "YEARLY_SUMMARY" ? (
              <div className="space-y-5">
                <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Include previous year
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Compare against {Number(filters.year) - 1}.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded accent-teal-700"
                    checked={includePrevious}
                    onChange={(event) => setIncludePrevious(event.target.checked)}
                  />
                </label>

                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-700">
                    Summary columns
                  </p>
                  <div className="grid max-h-52 grid-cols-1 gap-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-2">
                    {masterData.types.map((type) => (
                      <label
                        key={type._id}
                        className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3"
                      >
                        <input
                          type="checkbox"
                          className="rounded accent-teal-700"
                          checked={selectedRespTypes.includes(type.name)}
                          onChange={() =>
                            setSelectedRespTypes((prev) =>
                              prev.includes(type.name)
                                ? prev.filter((name) => name !== type.name)
                                : [...prev, type.name]
                            )
                          }
                        />
                        <span className="truncate text-sm font-semibold text-slate-700">
                          {type.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleExportAction("EXPORT_YEARLY_SUMMARY")}
                  disabled={exportLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaFileExport />
                  {exportLoading ? "Exporting..." : "Export Yearly Summary"}
                </button>
              </div>
            ) : filters.reportType === "UNASSIGNED_TEACHERS" ? (
              <button
                type="button"
                onClick={() => handleExportAction("EXPORT_UNASSIGNED")}
                disabled={exportLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaFileExport />
                {exportLoading ? "Exporting..." : "Export Unassigned Teachers"}
              </button>
            ) : filters.reportType === "INACTIVE_NO_ROUTINE" ? (
              <button
                type="button"
                onClick={() => handleExportAction("EXPORT_INACTIVE_NO_ROUTINE")}
                disabled={exportLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaFileExport />
                {exportLoading ? "Exporting..." : "Export No Routine Report"}
              </button>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleExportAction("EXPORT_BRANCH_DETAILED")}
                  disabled={exportLoading}
                  className="flex min-h-[116px] flex-col items-start justify-between rounded-lg border border-slate-200 bg-white p-4 text-left transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaBuilding className="text-teal-700" />
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Campus detail
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Requires campus filter
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportAction("EXPORT_CLASS_DETAILED")}
                  disabled={exportLoading}
                  className="flex min-h-[116px] flex-col items-start justify-between rounded-lg border border-slate-200 bg-white p-4 text-left transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaGraduationCap className="text-teal-700" />
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Class detail
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Requires class filter
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportAction("EXPORT_CAMPUS_ROUTINE")}
                  disabled={exportLoading}
                  className="sm:col-span-2 flex items-center justify-center gap-2 rounded-lg border border-dashed border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaBookOpen />
                  Export Campus Routine Index
                </button>
              </div>
            )}

            {exportError && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600">
                {exportError}
              </p>
            )}
          </div>
        </Modal>
      </main>
    </div>
  );
};

export default ReportViewPage;

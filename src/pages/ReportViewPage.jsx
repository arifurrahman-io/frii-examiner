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
  FaFileExport,
  FaCubes,
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

// --- 1. Modern Table Component ---
const ReportTable = ({ data, reportType, rowsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const displayedHeaders = ["Sl.", "CLASS", "SUBJECT", "TEACHER", "CAMPUS"];

  const headerLabel = (key) => {
    const labels = {
      "Sl.": "S.L.",
      CLASS: "Class",
      SUBJECT: "Assigned Subject",
      TEACHER: "Teacher Name",
      CAMPUS: "Campus",
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
      <div className="flex flex-col items-center justify-center py-32 bg-white/40 backdrop-blur-xl rounded-[3rem] border-2 border-dashed border-slate-200 opacity-60">
        <FaClipboardList className="text-8xl text-slate-200 mb-6" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">
          No Records found in Matrix
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white overflow-hidden transition-all hover:shadow-indigo-50">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/50">
              {displayedHeaders.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100"
                >
                  {headerLabel(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="group hover:bg-indigo-50/30 transition-all"
              >
                {displayedHeaders.map((key, colIndex) => {
                  let cellValue = row[key];
                  if (key === "Sl.")
                    cellValue = (currentPage - 1) * rowsPerPage + rowIndex + 1;
                  if (typeof cellValue === "object" && cellValue !== null) {
                    cellValue = cellValue.name || cellValue.label || "-";
                  } else if (!cellValue) cellValue = "-";

                  return (
                    <td
                      key={colIndex}
                      className={`px-6 py-5 text-xs font-bold ${
                        key === "Sl." ? "text-indigo-400" : "text-slate-600"
                      } uppercase tracking-tight`}
                    >
                      {cellValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modern Pagination */}
      <div className="flex justify-between items-center mt-6 p-4 border-t border-slate-50">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Node {currentPage} / {totalPages}
        </span>
        <div className="flex gap-3">
          <Button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-xl px-4 py-2 border-slate-100 hover:bg-white hover:text-indigo-600 shadow-sm"
          >
            <FaAngleLeft />
          </Button>
          <Button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="rounded-xl px-4 py-2 border-slate-100 hover:bg-white hover:text-indigo-600 shadow-sm"
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
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2].map(
    (y) => ({ _id: y, name: `${y}` })
  );

  const [filters, setFilters] = useState({
    reportType: "DETAILED_ASSIGNMENT",
    year: currentYear,
    typeId: "",
    classId: "",
    branchId: "",
    status: "Assigned",
  });
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
        toast.error("Configuration buffer failed.");
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
    } catch (error) {
      toast.error("Failed to sync report matrix.");
    } finally {
      setLoading(false);
    }
  }, [filters, fetchTrigger]);

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
    }));
  };

  const toggleType = (name) =>
    setSelectedRespTypes((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );

  const handleExportAction = async (exportType) => {
    setExportError(null);
    if (!filters.year) return setExportError("Year filter required.");

    const exportFilters = {
      ...filters,
      includePrevious: includePrevious.toString(),
    };

    if (exportType === "EXPORT_CAMPUS_ROUTINE") {
      if (!filters.branchId) return toast.error("Campus ID required.");
      window.open(
        `/api/reports/export/campus-routine?branchId=${filters.branchId}&year=${filters.year}`,
        "_blank"
      );
      setIsExportModalOpen(false);
      return;
    }

    if (exportType === "EXPORT_YEARLY_SUMMARY") {
      if (selectedRespTypes.length === 0)
        return setExportError("Minimum 1 column required.");
      exportFilters.reportType = "YEARLY_SUMMARY";
      exportFilters.selectedTypes = selectedRespTypes.join(",");
    } else {
      if (!filters.typeId) return setExportError("Duty type required.");
      exportFilters.reportType = exportType;
      if (exportType === "EXPORT_CLASS_DETAILED" && !filters.classId)
        return setExportError("Class required.");
      if (exportType === "EXPORT_BRANCH_DETAILED" && !filters.branchId)
        return setExportError("Campus required.");
    }

    setExportLoading(true);
    try {
      await exportCustomReportToPDF(exportFilters);
      toast.success("PDF Initialized.");
      setIsExportModalOpen(false);
    } catch {
      toast.error("Export Protocol Failed.");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 px-4 sm:px-8 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* --- DYNAMIC HEADER --- */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
              <FaChartBar size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
                Report Matrix <span className="text-indigo-600">.</span>
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">
                {filters.reportType === "YEARLY_SUMMARY"
                  ? "Yearly Session Aggregation"
                  : "Detailed Allocation Intelligence"}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl backdrop-blur-sm border border-slate-200/50">
              <button
                onClick={() =>
                  setFilters((p) => ({
                    ...p,
                    reportType: "DETAILED_ASSIGNMENT",
                  }))
                }
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filters.reportType === "DETAILED_ASSIGNMENT"
                    ? "bg-white text-indigo-600 shadow-md scale-105"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Detailed
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
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filters.reportType === "YEARLY_SUMMARY"
                    ? "bg-white text-indigo-600 shadow-md scale-105"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Summary
              </button>
            </div>
            <Button
              onClick={() => setIsExportModalOpen(true)}
              className="bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl px-6 font-black text-[10px] tracking-[0.2em] shadow-xl shadow-slate-200 flex items-center gap-3"
            >
              <FaFilePdf size={14} /> EXPORT
            </Button>
          </div>
        </div>

        {/* --- FILTER PANEL --- */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(79,70,229,0.05)] border border-white mb-10 overflow-hidden relative transition-all hover:shadow-indigo-100">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 items-end relative z-10">
            <SelectDropdown
              label="Cycle Year"
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
              placeholder="All Campus"
            />
            {filters.reportType === "DETAILED_ASSIGNMENT" && (
              <>
                <SelectDropdown
                  label="Duty Type"
                  name="typeId"
                  value={filters.typeId}
                  onChange={handleChange}
                  options={masterData.types}
                  placeholder="All Prototypes"
                />
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
            <Button
              onClick={() => setFetchTrigger((p) => p + 1)}
              disabled={loading}
              variant="primary"
              className="h-[52px] rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-100 font-black text-[11px] tracking-widest uppercase flex items-center justify-center gap-3"
            >
              <FaSearch className={loading ? "animate-spin" : ""} /> Sync Matrix
            </Button>
          </div>
        </div>

        {/* --- RESULTS AREA --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 bg-white/40 backdrop-blur-md rounded-[4rem]">
            <FaSyncAlt className="animate-spin text-6xl text-indigo-500/20 mb-6" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">
              Synchronizing Intelligence Buffer
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <ReportTable data={reportData} reportType={filters.reportType} />
          </div>
        )}

        {/* --- EXPORT MODAL --- */}
        <Modal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          title={
            <div className="flex items-center gap-3 uppercase font-black text-slate-800 tracking-tighter">
              <FaFileExport className="text-indigo-600" /> Data Export Engine
            </div>
          }
        >
          <div className="p-4 space-y-8">
            {filters.reportType === "YEARLY_SUMMARY" ? (
              <div className="space-y-8">
                <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 flex items-center justify-between shadow-inner">
                  <div>
                    <p className="text-[11px] font-black text-indigo-900 uppercase">
                      Dual Session Comparison
                    </p>
                    <p className="text-[9px] font-bold text-indigo-400 uppercase mt-1 tracking-widest">
                      Include {filters.year - 1} archival data
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-6 h-6 rounded-lg border-indigo-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    checked={includePrevious}
                    onChange={(e) => setIncludePrevious(e.target.checked)}
                  />
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FaCubes className="text-indigo-600" /> Column Projection
                    Configuration:
                  </p>
                  <div className="grid grid-cols-2 gap-3 p-4 border border-slate-100 rounded-[2rem] bg-slate-50/50 max-h-48 overflow-y-auto no-scrollbar">
                    {masterData.types.map((t) => (
                      <label
                        key={t._id}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100 shadow-sm"
                      >
                        <input
                          type="checkbox"
                          className="rounded text-indigo-600"
                          checked={selectedRespTypes.includes(t.name)}
                          onChange={() => toggleType(t.name)}
                        />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">
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
                  className="py-4 rounded-2xl shadow-xl shadow-indigo-100 uppercase font-black tracking-widest"
                >
                  <FaFilePdf size={14} className="mr-2" /> Generate Aggregated
                  PDF
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleExportAction("EXPORT_BRANCH_DETAILED")}
                    className="p-6 bg-slate-50 hover:bg-white border-slate-100 text-slate-900 rounded-[2rem] shadow-sm flex flex-col items-center gap-3 uppercase font-black text-[10px] tracking-widest hover:shadow-xl"
                  >
                    <FaBuilding size={24} className="text-indigo-600" /> Campus
                    View
                  </Button>
                  <Button
                    onClick={() => handleExportAction("EXPORT_CLASS_DETAILED")}
                    className="p-6 bg-slate-50 hover:bg-white border-slate-100 text-slate-900 rounded-[2rem] shadow-sm flex flex-col items-center gap-3 uppercase font-black text-[10px] tracking-widest hover:shadow-xl"
                  >
                    <FaGraduationCap size={24} className="text-indigo-600" />{" "}
                    Class View
                  </Button>
                </div>
                <Button
                  onClick={() => handleExportAction("EXPORT_CAMPUS_ROUTINE")}
                  variant="secondary"
                  className="w-full py-4 border-2 border-dashed border-indigo-200 text-indigo-600 rounded-2xl uppercase font-black text-[10px] tracking-widest flex items-center justify-center gap-3"
                >
                  <FaTable /> Initial Campus Routine Map
                </Button>
              </div>
            )}
            {exportError && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-3 animate-bounce">
                <FaCheckCircle size={14} /> {exportError}
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ReportViewPage;

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
} from "../api/apiService";

const ArrayOfData = (data) => Array.isArray(data) && data.length > 0;

// --- 1. Modern Responsive Table/Card Component ---
const ReportTable = ({ data, rowsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const displayedHeaders = ["Sl.", "CLASS", "SUBJECT", "TEACHER", "CAMPUS"];

  const headerLabel = (key) => {
    const labels = {
      "Sl.": "S.L.",
      CLASS: "Class Node",
      SUBJECT: "Subject Vector",
      TEACHER: "Teacher Node",
      CAMPUS: "Branch",
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
    <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] sm:rounded-[3rem] p-2 sm:p-4 shadow-sm border border-white overflow-hidden transition-all hover:shadow-indigo-50">
      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/50">
              {displayedHeaders.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100"
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
                  if (typeof cellValue === "object" && cellValue !== null)
                    cellValue = cellValue.name || cellValue.label || "-";
                  return (
                    <td
                      key={colIndex}
                      className={`px-6 py-5 text-[11px] font-bold ${
                        key === "Sl." ? "text-indigo-400" : "text-slate-600"
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
      <div className="md:hidden divide-y divide-slate-100">
        {paginatedData.map((row, rowIndex) => (
          <div key={rowIndex} className="p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-indigo-400 uppercase">
                Node #{(currentPage - 1) * rowsPerPage + rowIndex + 1}
              </span>
              <span className="px-2 py-0.5 bg-slate-100 text-[8px] font-black text-slate-500 rounded uppercase tracking-tighter">
                {row.CAMPUS?.name || "Global"}
              </span>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Teacher Node
              </p>
              <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                {row.TEACHER?.name || "-"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Class
                </p>
                <p className="text-[11px] font-bold text-slate-600 uppercase">
                  {row.CLASS?.name || "-"}
                </p>
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Subject
                </p>
                <p className="text-[11px] font-bold text-slate-600 uppercase">
                  {row.SUBJECT?.name || "-"}
                </p>
              </div>
            </div>
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
    setLoading(true);
    try {
      const { data } = await getReportData(filters);
      setReportData(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Matrix sync failed.");
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

  const handleExportAction = async (exportType) => {
    setExportError(null);
    const exportFilters = {
      ...filters,
      includePrevious: includePrevious.toString(),
    };

    if (exportType === "EXPORT_CAMPUS_ROUTINE") {
      if (!filters.branchId) return toast.error("Select target campus node.");
      window.open(
        `/api/reports/export/campus-routine?branchId=${filters.branchId}&year=${filters.year}`,
        "_blank"
      );
      setIsExportModalOpen(false);
      return;
    }

    if (exportType === "EXPORT_YEARLY_SUMMARY") {
      if (selectedRespTypes.length === 0)
        return setExportError("Minimum 1 column vector required.");
      exportFilters.reportType = "YEARLY_SUMMARY";
      exportFilters.selectedTypes = selectedRespTypes.join(",");
    } else {
      if (!filters.typeId) return setExportError("Duty prototype required.");
      exportFilters.reportType = exportType;
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
    } catch {
      toast.error("Export Protocol error.");
    } finally {
      setExportLoading(false);
    }
  };

  if (user?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 pt-20 sm:pt-10 px-4 sm:px-8 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

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
                setFilters((p) => ({ ...p, reportType: "DETAILED_ASSIGNMENT" }))
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
        <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-white mb-8 sm:mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full -mr-40 -mt-40 blur-3xl"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-8 items-end relative z-10">
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
              <>
                <SelectDropdown
                  label="Protocol Prototype"
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
            <button
              onClick={() => setFetchTrigger((p) => p + 1)}
              disabled={loading}
              className="h-[48px] sm:h-[52px] w-full rounded-xl sm:rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-black text-[9px] sm:text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-xl"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} /> Sync
              Matrix
            </button>
          </div>
        </div>

        {/* --- RESULTS --- */}
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 relative">
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
          ) : (
            <ReportTable data={reportData} />
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
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ReportViewPage;

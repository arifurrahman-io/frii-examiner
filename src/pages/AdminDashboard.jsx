import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBookOpen,
  FaBuilding,
  FaCalendarCheck,
  FaChartBar,
  FaChartPie,
  FaChevronRight,
  FaClipboard,
  FaExclamationTriangle,
  FaLayerGroup,
  FaLock,
  FaMedal,
  FaRegClock,
  FaShieldAlt,
  FaSyncAlt,
  FaTasks,
  FaTimes,
  FaTrashAlt,
  FaUserTie,
  FaUsers,
} from "react-icons/fa";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import {
  deleteRoutinesByYear,
  getAssignmentByBranch,
  getAssignmentByDutyType,
  getDashboardSummary,
  getRecentGrantedLeaves,
  getTopResponsibleTeachers,
} from "../api/apiService";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const CHART_COLORS = [
  "#075753",
  "#1F9F98",
  "#8FCFC8",
];

const GRAPH_THEME = {
  deep: "#075753",
  teal: "#1F9F98",
  mint: "#8FCFC8",
  tint: "#DFF4F1",
  soft: "#F3FBFA",
};

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, index) => currentYear - index);

const formatNumber = (value) => new Intl.NumberFormat("en").format(value || 0);

const getTotalFromSeries = (items = []) =>
  items.reduce((total, item) => total + Number(item.count || item.value || 0), 0);

const getChartData = (data = []) =>
  data
    .filter((item) => Number(item.count) > 0)
    .map((item, index) => ({
      name: item.name,
      value: Number(item.count),
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-[#d4e0dc] bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-[#0f172a]">{item.name}</p>
      <p className="mt-1 text-xs font-semibold text-[#334155]">
        {formatNumber(item.value)} assignments
      </p>
    </div>
  );
};

const KpiCard = ({ title, value, icon: Icon, caption }) => (
  <div className="min-h-[128px] rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex h-full flex-col justify-between gap-5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-semibold text-slate-600">{title}</p>
        <div className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-slate-100 text-slate-700">
          <Icon size={17} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-semibold text-slate-950">
          {formatNumber(value)}
        </p>
        <p className="mt-1 text-xs font-medium text-slate-500">{caption}</p>
      </div>
    </div>
  </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle, action }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-slate-100 text-slate-700">
          <Icon size={16} />
        </div>
      )}
      <div>
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
    {action}
  </div>
);

const EmptyState = ({ label }) => (
  <div className="grid h-full min-h-[160px] place-items-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 text-center">
    <p className="text-sm font-semibold text-slate-500">{label}</p>
  </div>
);

const ActionTile = ({ icon: Icon, title, path, subtitle, featured = false }) => (
  <Link
    to={path}
    className={`group flex min-h-[118px] flex-col justify-between rounded-lg border p-4 shadow-sm transition-all hover:-translate-y-0.5 ${
      featured
        ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
        : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div
        className={`grid h-10 w-10 place-items-center rounded-lg ${
          featured ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"
        }`}
      >
        <Icon size={17} />
      </div>
      <FaChevronRight
        className={`mt-1 text-xs transition-transform group-hover:translate-x-0.5 ${
          featured ? "text-white/70" : "text-slate-400"
        }`}
      />
    </div>
    <div>
      <h3
        className={`text-sm font-semibold ${
          featured ? "text-white" : "text-slate-950"
        }`}
      >
        {title}
      </h3>
      <p
        className={`mt-1 text-xs font-medium ${
          featured ? "text-white/70" : "text-slate-500"
        }`}
      >
        {subtitle}
      </p>
    </div>
  </Link>
);

const TeacherRanking = ({ teachers }) => {
  const highest = Math.max(...teachers.map((teacher) => teacher.totalDuties || 0), 1);

  if (!teachers.length) {
    return <EmptyState label="No responsibility ranking is available yet." />;
  }

  return (
    <div className="space-y-3">
      {teachers.map((teacher, index) => {
        const width = `${Math.max(
          8,
          Math.round(((teacher.totalDuties || 0) / highest) * 100)
        )}%`;

        return (
          <div
            key={`${teacher.name}-${index}`}
            className="rounded-lg border border-slate-200 bg-white p-3"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {teacher.name}
                </p>
                <p className="text-xs font-medium text-slate-500">
                  {formatNumber(teacher.totalDuties)} assigned duties
                </p>
              </div>
              {index === 0 && <FaMedal className="flex-none text-amber-500" />}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-slate-900" style={{ width }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const LeaveTimeline = ({ leaves, onViewAll }) => {
  if (!leaves.length) {
    return <EmptyState label="No recent granted leave logs found." />;
  }

  return (
    <>
      <div className="space-y-1">
        {leaves.slice(0, 5).map((leave, index) => (
          <div
            key={`${leave.teacher?.name || "leave"}-${index}`}
            className="flex gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-slate-50"
          >
            <div className="mt-1.5 h-2 w-2 flex-none rounded-full bg-rose-500" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-950">
                {leave.teacher?.name || "Unknown teacher"}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {leave.responsibilityType?.name || "Standard leave"}
              </p>
            </div>
          </div>
        ))}
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
        >
          View all leave
          <FaChevronRight className="text-xs" />
        </button>
      )}
    </>
  );
};

const AssignmentPerformancePanel = ({ data, total, selectedYear }) => {
  const chartData = useMemo(() => {
    const source = getChartData(data);

    if (!source.length) return [];

    if (source.length === 1) {
      return [
        { name: "Start", value: Math.max(1, Math.round(source[0].value * 0.42)) },
        { name: source[0].name, value: source[0].value },
        { name: "Close", value: Math.max(1, Math.round(source[0].value * 0.68)) },
      ];
    }

    return source.map((item, index) => ({
      name: item.name,
      value: item.value + (index % 2 === 0 ? 2 : -1),
    }));
  }, [data]);
  const sourceData = useMemo(() => getChartData(data), [data]);
  const peak = sourceData.reduce(
    (currentPeak, item) => (item.value > currentPeak.value ? item : currentPeak),
    { name: "None", value: 0 }
  );
  const average = sourceData.length ? Math.round(total / sourceData.length) : 0;
  const share = total ? Math.round((peak.value / total) * 100) : 0;
  const balance = sourceData.length
    ? Math.max(0, 100 - Math.round((peak.value / Math.max(average, 1)) * 12))
    : 0;

  if (!chartData.length) {
    return <EmptyState label="No assignment performance data available yet." />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#bedbd3] bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[#1f2937]">
            Assignment Performance
          </h3>
          <p className="mt-2 text-3xl font-semibold text-[#111827]">
            {share}%
          </p>
        </div>
        <div className="rounded-lg border border-[#bedbd3] bg-white px-3 py-2 text-xs font-semibold text-[#111827] shadow-sm">
          {selectedYear}
        </div>
      </div>

      <div className="mb-1 flex justify-center">
        <div className="rounded-lg bg-white/90 px-3 py-2 text-center shadow-sm ring-1 ring-[#bedbd3]">
          <p className="text-[10px] font-semibold text-[#6b7280]">
            Average Load
          </p>
          <p className="text-xs font-semibold text-[#111827]">
            {formatNumber(average)} duties{" "}
            <span className="text-[#1F9F98]">+{Math.max(1, balance)}%</span>
          </p>
        </div>
      </div>

      <div className="h-[170px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 22, right: 8, bottom: 4, left: 8 }}
          >
            <defs>
              <linearGradient id="assignmentPerformanceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={GRAPH_THEME.teal} stopOpacity={0.34} />
                <stop offset="100%" stopColor={GRAPH_THEME.teal} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={GRAPH_THEME.teal}
              strokeWidth={3}
              fill="url(#assignmentPerformanceFill)"
              dot={false}
              activeDot={{ r: 4, fill: GRAPH_THEME.teal, stroke: "#ffffff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-1 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#111827]">
            {formatNumber(total)}
          </p>
          <p className="text-[11px] font-semibold text-[#6b7280]">
            Total Duties
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-[#111827]">
            {peak.name}
          </p>
          <p className="text-[11px] font-semibold text-[#6b7280]">
            Highest Load
          </p>
        </div>
      </div>
    </div>
  );
};

const DangerZone = ({
  year,
  deleting,
  responsibilities,
  onDelete,
}) => (
  <div className="rounded-lg border border-rose-200 bg-white p-5">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-rose-50 text-rose-600">
          <FaExclamationTriangle size={17} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-950">
            Delete complete routine
          </h3>
          <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
            This removes every routine entry for {year}. Current dashboard total:
            {" "}
            {formatNumber(responsibilities)} ongoing duties.
          </p>
        </div>
      </div>
      <button
        onClick={onDelete}
        disabled={deleting}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FaTrashAlt size={13} />
        {deleting ? "Deleting..." : `Delete ${year}`}
      </button>
    </div>
  </div>
);

const RoutineDeleteConfirmModal = ({
  isOpen,
  year,
  responsibilities,
  password,
  error,
  deleting,
  onClose,
  onConfirm,
  onPasswordChange,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-routine-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-slate-950/45 backdrop-blur-sm"
        onClick={deleting ? undefined : onClose}
        aria-label="Close routine delete confirmation"
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-rose-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="h-1.5 bg-rose-600" />
        <div className="p-6 sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 flex-none place-items-center rounded-lg bg-rose-50 text-rose-600">
                <FaTrashAlt size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-rose-600">
                  Critical admin action
                </p>
                <h2
                  id="delete-routine-title"
                  className="mt-1 text-xl font-semibold text-slate-950"
                >
                  Delete {year} routine entries?
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close modal"
            >
              <FaTimes size={14} />
            </button>
          </div>

          <p className="text-sm font-medium leading-6 text-slate-600">
            This will permanently remove every routine record for the selected
            academic year. The dashboard will refresh after deletion.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <FaCalendarCheck size={12} />
                Selected year
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {year}
              </p>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600">
                <FaTasks size={12} />
                Entries at risk
              </div>
              <p className="mt-2 text-2xl font-semibold text-rose-700">
                {formatNumber(responsibilities)}
              </p>
            </div>
          </div>

          <div className="mt-5 flex gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3">
            <FaExclamationTriangle className="mt-0.5 flex-none text-rose-600" />
            <p className="text-sm font-medium leading-5 text-rose-700">
              This action cannot be undone from the dashboard.
            </p>
          </div>

          <div className="mt-5">
            <label
              htmlFor="routine-delete-password"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"
            >
              <FaLock size={13} className="text-slate-500" />
              Confirm with your admin password
            </label>
            <input
              id="routine-delete-password"
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              disabled={deleting}
              autoComplete="current-password"
              className={`w-full rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-slate-50 ${
                error ? "border-rose-300" : "border-slate-300"
              }`}
              placeholder="Enter admin password"
            />
            {error && (
              <p className="mt-2 text-sm font-semibold text-rose-600">
                {error}
              </p>
            )}
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Keep routine
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={deleting || !password.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <FaSyncAlt className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <FaTrashAlt size={13} />
                  Delete routine
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const isHeadTeacher = user?.role === "head_teacher";
  const isIncharge = user?.role === "incharge";
  const assignedCampusName = user?.campus?.name || "Assigned shift";
  const workspaceLabel = isAdmin
    ? "Admin workspace"
    : isHeadTeacher
      ? "Headmaster workspace"
      : "Incharge workspace";
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);
  const [deletingRoutineYear, setDeletingRoutineYear] = useState(false);
  const [routineDeleteModalOpen, setRoutineDeleteModalOpen] = useState(false);
  const [routineDeletePassword, setRoutineDeletePassword] = useState("");
  const [routineDeletePasswordError, setRoutineDeletePasswordError] = useState("");
  const [data, setData] = useState({
    totals: { teachers: 0, branches: 0, responsibilities: 0 },
    topTeachers: [],
    dutyTypeData: [],
    branchData: [],
    recentLeaves: [],
  });

  const dashboardTitle = isIncharge
    ? `${assignedCampusName} dashboard`
    : "School operations dashboard";
  const dashboardDescription = isIncharge
    ? `Monitor teacher capacity, duty distribution, and leave movement for your assigned shift in ${selectedYear}.`
    : `Monitor teacher capacity, routine coverage, duty distribution, and recent leave movement for ${selectedYear}.`;

  const fetchData = useCallback(async (year) => {
    setLoading(true);
    try {
      const [summary, topT, dutyT, branchT, leaves] = await Promise.all([
        getDashboardSummary(year),
        getTopResponsibleTeachers(year),
        getAssignmentByDutyType(year),
        getAssignmentByBranch(year),
        getRecentGrantedLeaves(year),
      ]);

      setData({
        totals: {
          teachers: summary.data.totalTeachers || 0,
          branches: summary.data.totalBranches || 0,
          responsibilities: summary.data.totalResponsibilities || 0,
        },
        topTeachers: topT.data || [],
        dutyTypeData: dutyT.data || [],
        branchData: branchT.data || [],
        recentLeaves: leaves.data || [],
      });
    } catch (error) {
      toast.error("Dashboard sync failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear, fetchData]);

  const handleDeleteRoutineYear = async () => {
    const password = routineDeletePassword;

    if (!password.trim()) {
      setRoutineDeletePasswordError("Enter your admin password to continue.");
      return;
    }

    setRoutineDeletePasswordError("");
    setDeletingRoutineYear(true);
    try {
      const { data: result } = await deleteRoutinesByYear(selectedYear, password);
      toast.success(
        `${result.assignmentsDeleted || 0} routine entries deleted for ${selectedYear}.`
      );
      fetchData(selectedYear);
      setRoutineDeleteModalOpen(false);
      setRoutineDeletePassword("");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete yearly routines.";
      setRoutineDeletePasswordError(message);
      toast.error(message);
    } finally {
      setDeletingRoutineYear(false);
    }
  };

  const closeRoutineDeleteModal = () => {
    if (deletingRoutineYear) return;
    setRoutineDeleteModalOpen(false);
    setRoutineDeletePassword("");
    setRoutineDeletePasswordError("");
  };

  const dutyTotal = useMemo(
    () => getTotalFromSeries(data.dutyTypeData),
    [data.dutyTypeData]
  );
  const branchTotal = useMemo(
    () => getTotalFromSeries(data.branchData),
    [data.branchData]
  );

  const quickActions = useMemo(() => {
    if (isAdmin) {
      return [
          {
            icon: FaBuilding,
            title: "Branches",
            subtitle: "Campus and shift setup",
            path: "/setup/branch",
          },
          {
            icon: FaUsers,
            title: "Classes",
            subtitle: "Class directory",
            path: "/setup/class",
          },
          {
            icon: FaBookOpen,
            title: "Subjects",
            subtitle: "Subject catalog",
            path: "/setup/subject",
          },
          {
            icon: FaTasks,
            title: "Duty Types",
            subtitle: "Responsibility labels",
            path: "/setup/responsibility",
          },
          {
            icon: FaUserTie,
            title: "Teachers",
            subtitle: "Staff records",
            path: "/teachers",
          },
          {
            icon: FaCalendarCheck,
            title: "Routines",
            subtitle: "Schedule planning",
            path: "/routine",
          },
          {
            icon: FaClipboard,
            title: "Assign",
            subtitle: "Duty allocation",
            path: "/assign",
          },
          {
            icon: FaChartBar,
            title: "Reports",
            subtitle: "Export analytics",
            path: "/report",
            featured: true,
          },
        ];
    }

    if (isHeadTeacher) {
      return [
        {
          icon: FaUserTie,
          title: "Teachers",
          subtitle: "School-wide staff review",
          path: "/teachers",
        },
        {
          icon: FaChartBar,
          title: "Performance",
          subtitle: "School-wide ratings",
          path: "/performance-report",
          featured: true,
        },
      ];
    }

    return [
      {
        icon: FaUserTie,
        title: "Shift Teachers",
        subtitle: assignedCampusName,
        path: "/teachers",
      },
      {
        icon: FaChartBar,
        title: "Shift Performance",
        subtitle: "Ratings in your shift",
        path: "/performance-report",
      },
      {
        icon: FaCalendarCheck,
        title: "Shift Routine",
        subtitle: "Daily schedule sync",
        path: "/routine",
      },
      {
        icon: FaClipboard,
        title: "Assign Duty",
        subtitle: "Local allocation",
        path: "/assign",
        featured: true,
      },
    ];
  }, [assignedCampusName, isAdmin, isHeadTeacher]);

  if (loading && !data.totals.teachers) {
    return (
      <div className="grid min-h-screen place-items-center bg-white">
        <LoadingSpinner size="h-16 w-16" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-10 pt-5 text-slate-900 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-[1440px] space-y-6">
        <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                <FaShieldAlt size={12} />
                {workspaceLabel}
              </div>
              <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
                {dashboardTitle}
              </h1>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
                {dashboardDescription}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <FaCalendarCheck className="text-slate-500" />
                <select
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(Number(event.target.value))}
                  className="min-h-0 cursor-pointer border-none bg-transparent text-sm font-semibold outline-none"
                  aria-label="Select dashboard year"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => fetchData(selectedYear)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-70"
                disabled={loading}
              >
                <FaSyncAlt className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <KpiCard
            title="Staff members"
            value={data.totals.teachers}
            icon={FaUserTie}
            caption="Active teacher profiles"
          />
          <KpiCard
            title={isIncharge ? "Assigned shift" : "Campuses"}
            value={isIncharge ? 1 : data.totals.branches}
            icon={FaBuilding}
            caption={
              isIncharge ? assignedCampusName : "Branches under management"
            }
          />
          <KpiCard
            title="Ongoing duties"
            value={data.totals.responsibilities}
            icon={FaTasks}
            caption="Routine responsibilities this year"
          />
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="space-y-6 xl:col-span-8">
            <section className="space-y-4">
              <SectionHeader
                icon={FaChartPie}
                title="Load distribution"
                subtitle={
                  isIncharge
                    ? `Responsibility spread inside ${assignedCampusName}.`
                    : "Responsibility spread by duty type and campus."
                }
                action={
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                    <FaRegClock />
                    {loading ? "Syncing" : "Live snapshot"}
                  </div>
                }
              />

              <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
                <div className="space-y-5">
                  <DutyDonutPanel
                    data={data.dutyTypeData}
                    title="Duty type"
                    total={dutyTotal}
                  />
                  <AssignmentPerformancePanel
                    data={isAdmin ? data.branchData : data.dutyTypeData}
                    total={isAdmin ? branchTotal : dutyTotal}
                    selectedYear={selectedYear}
                  />
                </div>
                <CampusBarPanel
                  data={data.branchData}
                  title={isIncharge ? "Assigned shift load" : "Campus load"}
                  total={branchTotal}
                  groupLabel={isIncharge ? "shift" : "campuses"}
                />
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeader
                icon={FaLayerGroup}
                title="Quick actions"
                subtitle="Jump into the workflows used most often."
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {quickActions.map((action) => (
                  <ActionTile key={action.title} {...action} />
                ))}
              </div>
            </section>

            {isAdmin && (
              <DangerZone
                year={selectedYear}
                deleting={deletingRoutineYear}
                responsibilities={data.totals.responsibilities}
                onDelete={() => {
                  setRoutineDeletePassword("");
                  setRoutineDeletePasswordError("");
                  setRoutineDeleteModalOpen(true);
                }}
              />
            )}
          </section>

          <aside className="space-y-6 xl:col-span-4">
            <section className="space-y-4">
              <SectionHeader
                icon={FaMedal}
                title="Responsibility ranking"
                subtitle="Teachers carrying the highest assigned load."
              />
              <TeacherRanking teachers={data.topTeachers} />
            </section>

            <section className="space-y-4">
              <SectionHeader
                icon={FaCalendarCheck}
                title="Recent leave"
                subtitle="Latest granted leave records."
              />
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <LeaveTimeline
                  leaves={data.recentLeaves}
                  onViewAll={
                    isAdmin || isIncharge
                      ? () => navigate("/leaves/granted")
                      : undefined
                  }
                />
              </div>
            </section>
          </aside>
        </div>
      </main>

      <RoutineDeleteConfirmModal
        isOpen={routineDeleteModalOpen}
        year={selectedYear}
        responsibilities={data.totals.responsibilities}
        password={routineDeletePassword}
        error={routineDeletePasswordError}
        deleting={deletingRoutineYear}
        onClose={closeRoutineDeleteModal}
        onConfirm={handleDeleteRoutineYear}
        onPasswordChange={(value) => {
          setRoutineDeletePassword(value);
          if (routineDeletePasswordError) setRoutineDeletePasswordError("");
        }}
      />
    </div>
  );
};

const DutyDonutPanel = ({ data, title, total }) => {
  const chartData = useMemo(() => {
    return getChartData(data);
  }, [data]);

  return (
    <div className="rounded-lg border border-[#d5e4df] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[#0f172a]">{title}</h3>
          <p className="mt-1 text-sm font-semibold text-[#475569]">
            {formatNumber(total)} assignments tracked
          </p>
        </div>
        <span className="rounded-lg px-2.5 py-1 text-xs font-semibold text-[#0f172a]" style={{ backgroundColor: GRAPH_THEME.soft }}>
          {chartData.length} groups
        </span>
      </div>

      {chartData.length ? (
        <>
          <div className="relative h-[245px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius="66%"
                  outerRadius="92%"
                  paddingAngle={5}
                  animationDuration={800}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="#ffffff" strokeWidth={4} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="text-3xl font-semibold text-[#0f172a]">
                  {formatNumber(total)}
                </p>
                <p className="text-xs font-semibold text-[#64748b]">
                  total duties
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {chartData.map((item) => {
              const percent = total ? Math.round((item.value / total) * 100) : 0;
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[#e2ece8] px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-3 w-3 flex-none rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate text-sm font-semibold text-[#0f172a]">
                      {item.name}
                    </span>
                  </div>
                  <span className="flex-none text-xs font-semibold text-[#475569]">
                    {formatNumber(item.value)} | {percent}%
                  </span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <EmptyState label={`No ${title.toLowerCase()} data yet.`} />
      )}
    </div>
  );
};

const CampusBarPanel = ({ data, title, total, groupLabel = "campuses" }) => {
  const chartData = useMemo(() => {
    return getChartData(data).sort((left, right) => right.value - left.value);
  }, [data]);
  const chartHeight = Math.max(300, chartData.length * 42 + 44);

  return (
    <div className="rounded-lg border border-[#d5e4df] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[#0f172a]">{title}</h3>
          <p className="mt-1 text-sm font-semibold text-[#475569]">
            {formatNumber(total)} assignments tracked
          </p>
        </div>
        <span className="rounded-lg px-2.5 py-1 text-xs font-semibold text-[#0f172a]" style={{ backgroundColor: GRAPH_THEME.tint }}>
          {chartData.length} {groupLabel}
        </span>
      </div>

      {chartData.length ? (
        <>
          <div style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 42, bottom: 4, left: 8 }}
                barCategoryGap={12}
              >
                <CartesianGrid horizontal={false} stroke="#e7efec" />
                <XAxis type="number" hide domain={[0, "dataMax"]} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={96}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#0f172a", fontSize: 12, fontWeight: 700 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="right"
                    formatter={(value) => formatNumber(value)}
                    style={{
                      fill: "#0f172a",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {chartData.slice(0, 4).map((item) => (
              <div
                key={item.name}
                className="rounded-lg px-3 py-2"
                style={{ backgroundColor: `${item.color}18` }}
              >
                <p className="truncate text-xs font-semibold text-[#475569]">
                  {item.name}
                </p>
                <p className="mt-1 text-lg font-semibold text-[#0f172a]">
                  {formatNumber(item.value)}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState label={`No ${title.toLowerCase()} data yet.`} />
      )}
    </div>
  );
};

export default AdminDashboard;

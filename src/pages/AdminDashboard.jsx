import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaUsers,
  FaBookOpen,
  FaTasks,
  FaUserTie,
  FaChartBar,
  FaCalendarCheck,
  FaSyncAlt,
  FaMedal,
  FaClipboard,
  FaChartPie,
  FaShieldAlt,
  FaChevronRight,
  FaTrashAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getDashboardSummary,
  getTopResponsibleTeachers,
  getRecentGrantedLeaves,
  getAssignmentByDutyType,
  getAssignmentByBranch,
  deleteRoutinesByYear,
} from "../api/apiService";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const COLORS = ["#0D746F", "#1F9F98", "#8FCFC8", "#DFF4F1", "#075753"];

// --- 1. REFINED KPI COMPONENT ---
const KpiCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-colors hover:border-slate-300">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-500">
          {title}
        </p>
        <h3 className="text-3xl font-semibold text-slate-950">{value}</h3>
      </div>
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-700">
        <Icon size={18} />
      </div>
    </div>
  </div>
);

// --- 2. STREAMLINED CONTROL CENTER ---
const ActionTile = ({
  icon: Icon,
  title,
  path,
  subtitle,
  variant = "light",
}) => (
  <Link
    to={path}
    className={`p-4 rounded-xl border transition-colors duration-150 flex flex-col items-start gap-3 group ${
      variant === "dark"
        ? "bg-slate-900 border-slate-900 hover:bg-slate-800"
        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
    }`}
  >
    <div
      className={`p-3 rounded-xl transition-colors ${
        variant === "dark"
          ? "bg-white/10 text-white"
          : "bg-slate-100 text-slate-700"
      }`}
    >
      <Icon size={18} />
    </div>
    <div>
      <h4
        className={`text-sm font-semibold ${variant === "dark" ? "text-white" : "text-slate-900"}`}
      >
        {title}
      </h4>
      <p
        className={`text-xs font-medium ${variant === "dark" ? "text-slate-400" : "text-slate-500"}`}
      >
        {subtitle}
      </p>
    </div>
  </Link>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [deletingRoutineYear, setDeletingRoutineYear] = useState(false);
  const [data, setData] = useState({
    totals: { teachers: 0, branches: 0, responsibilities: 0 },
    topTeachers: [],
    dutyTypeData: [],
    branchData: [],
    recentLeaves: [],
  });

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
        topTeachers: topT.data,
        dutyTypeData: dutyT.data,
        branchData: branchT.data,
        recentLeaves: leaves.data,
      });
    } catch (error) {
      toast.error("Intelligence sync failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear, fetchData]);

  const handleDeleteRoutineYear = async () => {
    const confirmed = window.confirm(
      `Delete every routine entry for ${selectedYear}? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingRoutineYear(true);
    try {
      const { data: result } = await deleteRoutinesByYear(selectedYear);
      toast.success(
        `${result.assignmentsDeleted || 0} routine entries deleted for ${selectedYear}.`
      );
      fetchData(selectedYear);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete yearly routines."
      );
    } finally {
      setDeletingRoutineYear(false);
    }
  };

  if (loading && !data.totals.teachers)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="text-7xl" />
      </div>
    );

  return (
    <div className="min-h-screen bg-transparent text-slate-900 pb-10 pt-6 px-4 lg:px-8">
      {/* Background Subtle Texture */}

      <main className="max-w-[1500px] mx-auto space-y-6 relative z-10">
        {/* --- EXECUTIVE HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {isAdmin ? "Admin workspace" : "Incharge workspace"}
              </h1>
            </div>
            <p className="text-sm font-medium text-slate-500">
              Operational overview for {selectedYear}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5">
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
              <FaCalendarCheck className="text-slate-500" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="min-h-0 bg-transparent border-none text-sm font-medium outline-none cursor-pointer"
              >
                {[2026, 2025, 2024].map((y) => (
                  <option key={y} value={y} className="text-slate-900">
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => fetchData(selectedYear)}
              className="p-2.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        {/* --- MAIN GRID SYSTEM --- */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* LEFT CONTENT: KPIs, Charts, Control Center */}
          <section className="xl:col-span-8 space-y-6">
            {/* KPI GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KpiCard
                title="Staff Members"
                value={data.totals.teachers}
                icon={FaUserTie}
                colorClass="bg-indigo-600"
              />
              <KpiCard
                title="Campuses"
                value={isAdmin ? data.totals.branches : "1"}
                icon={FaBuilding}
                colorClass="bg-emerald-500"
              />
              <KpiCard
                title="Ongoing Duties"
                value={data.totals.responsibilities}
                icon={FaTasks}
                colorClass="bg-amber-500"
              />
            </div>

            {/* DISTRIBUTION ANALYTICS */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center">
                  <FaChartPie size={16} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    Load Distribution
                  </h3>
                  <p className="text-sm font-medium text-slate-500">
                    Responsibility and campus totals
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[280px]">
                  <DutyChart
                    data={data.dutyTypeData}
                    title="By Responsibility Type"
                  />
                </div>
                {isAdmin && (
                  <div className="h-[280px] md:border-l border-slate-200 md:pl-6">
                    <DutyChart data={data.branchData} title="By Campus Load" />
                  </div>
                )}
              </div>
            </div>

            {/* CONTROL HUB */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <FaShieldAlt className="text-slate-500" /> Quick actions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {isAdmin ? (
                  <>
                    <ActionTile
                      icon={FaBuilding}
                      title="Branches"
                      subtitle="Campus setup"
                      path="/setup/branch"
                    />
                    <ActionTile
                      icon={FaUsers}
                      title="Classes"
                      subtitle="Class setup"
                      path="/setup/class"
                    />
                    <ActionTile
                      icon={FaBookOpen}
                      title="Subjects"
                      subtitle="Subject setup"
                      path="/setup/subject"
                    />
                    <ActionTile
                      icon={FaTasks}
                      title="Duty Types"
                      subtitle="Duty setup"
                      path="/setup/responsibility"
                    />
                    <ActionTile
                      icon={FaUserTie}
                      title="Teachers"
                      subtitle="Workforce"
                      path="/teachers"
                    />
                    <ActionTile
                      icon={FaCalendarCheck}
                      title="Routines"
                      subtitle="Schedules"
                      path="/routine"
                    />
                    <ActionTile
                      icon={FaClipboard}
                      title="Assign"
                      subtitle="Duty allocation"
                      path="/assign"
                    />
                    <ActionTile
                      icon={FaChartBar}
                      title="Analytics"
                      subtitle="Reports"
                      path="/report"
                      variant="dark"
                    />
                  </>
                ) : (
                  <>
                    <ActionTile
                      icon={FaUserTie}
                      title="Teacher List"
                      subtitle="Campus staff"
                      path="/teachers"
                    />
                    <ActionTile
                      icon={FaCalendarCheck}
                      title="Master Routine"
                      subtitle="Daily Sync"
                      path="/routine"
                    />
                    <ActionTile
                      icon={FaShieldAlt}
                      title="Master Setup"
                      subtitle="Metadata"
                      path="/setup/branch"
                      variant="dark"
                    />
                  </>
                )}
              </div>

              {isAdmin && (
                <div className="rounded-xl border border-rose-200 bg-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
                      <FaExclamationTriangle size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        Delete Complete Routine
                      </h4>
                      <p className="text-xs font-medium text-slate-500">
                        Purge all routine entries for {selectedYear} session.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDeleteRoutineYear}
                    disabled={deletingRoutineYear}
                    className="flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaTrashAlt />
                    {deletingRoutineYear ? "Deleting..." : `Delete ${selectedYear}`}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT CONTENT: Sidebar - Ranking & Leaves */}
          <aside className="xl:col-span-4 space-y-6">
            {/* TOP PERFORMANCE */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold mb-5">
                Responsibility ranking
              </h3>
              <div className="space-y-2">
                {data.topTeachers.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 cursor-default"
                  >
                    <span className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center font-semibold text-slate-600 text-xs">
                      0{i + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold truncate">
                        {t.name}
                      </h4>
                      <p className="text-xs font-medium text-slate-500">
                        {t.totalDuties} Assigned Tasks
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LEAVE ARCHIVE */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold">
                  Recent leave
                </h3>
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-medium">
                  Logs
                </span>
              </div>
              <div className="space-y-4">
                {data.recentLeaves.slice(0, 5).map((leave, i) => (
                  <div key={i} className="flex gap-4 group cursor-default">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold leading-none">
                        {leave.teacher?.name}
                      </h4>
                      <p className="text-xs font-medium text-slate-500">
                        {leave.responsibilityType?.name || "Standard Leave"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/leaves/granted")}
                className="w-full mt-6 py-2.5 rounded-lg border border-slate-300 text-slate-800 font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                View all leave{" "}
                <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

// --- CHART COMPONENT (MEMOIZED) ---
const DutyChart = ({ data, title }) => {
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((item, index) => ({
      name: item.name,
      value: Number(item.count),
      color: COLORS[index % COLORS.length],
    }));
  }, [data]);

  if (!chartData.length)
    return (
      <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400">
        No data yet
      </div>
    );

  return (
    <div className="h-full flex flex-col">
      <h4 className="text-xs font-medium text-slate-500 mb-4 text-center">
        {title}
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="95%"
            paddingAngle={4}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #bedbd3",
              boxShadow: "none",
              fontSize: "11px",
              fontWeight: "600",
            }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{
              fontSize: "10px",
              fontWeight: "600",
              paddingTop: "20px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminDashboard;

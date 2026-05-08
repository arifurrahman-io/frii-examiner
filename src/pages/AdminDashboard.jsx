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

const COLORS = [
  "#0F766E",
  "#0284C7",
  "#F59E0B",
  "#E11D48",
  "#14B8A6",
  "#64748B",
];

// --- 1. REFINED KPI COMPONENT ---
const KpiCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="relative group overflow-hidden bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
    <div
      className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700 ${colorClass}`}
    ></div>
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {title}
        </p>
        <h3 className="text-3xl font-black text-slate-900">{value}</h3>
      </div>
      <div className={`p-4 rounded-2xl text-white shadow-lg ${colorClass}`}>
        <Icon size={24} />
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
    className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col items-start gap-3 group ${
      variant === "dark"
        ? "bg-slate-900 border-slate-800 hover:bg-indigo-600 hover:border-indigo-500"
        : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5"
    }`}
  >
    <div
      className={`p-3 rounded-xl transition-colors ${
        variant === "dark"
          ? "bg-white/10 text-white group-hover:bg-white group-hover:text-indigo-600"
          : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
      }`}
    >
      <Icon size={18} />
    </div>
    <div>
      <h4
        className={`text-sm font-black uppercase tracking-tight ${variant === "dark" ? "text-white" : "text-slate-800"}`}
      >
        {title}
      </h4>
      <p
        className={`text-[10px] font-bold uppercase opacity-60 ${variant === "dark" ? "text-slate-400 group-hover:text-indigo-100" : "text-slate-400"}`}
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
    <div className="min-h-screen bg-transparent text-slate-900 pb-12 pt-6 sm:pt-8 px-4 lg:px-12">
      {/* Background Subtle Texture */}

      <main className="max-w-[1700px] mx-auto space-y-8 relative z-10">
        {/* --- EXECUTIVE HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-indigo-600 rounded-full" />
              <h1 className="text-xl lg:text-2xl font-black tracking-tighter uppercase italic">
                {isAdmin ? "Admin workspace" : "Incharge workspace"}
              </h1>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em] pl-5">
              Operational overview for {selectedYear}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-100 p-2 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 rounded-xl text-white">
              <FaCalendarCheck className="text-indigo-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent border-none text-[11px] font-black uppercase outline-none cursor-pointer"
              >
                {[2026, 2025, 2024].map((y) => (
                  <option key={y} value={y} className="text-slate-900">
                    {y} Session
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => fetchData(selectedYear)}
              className="p-3 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        {/* --- MAIN GRID SYSTEM --- */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* LEFT CONTENT: KPIs, Charts, Control Center */}
          <section className="xl:col-span-8 space-y-8">
            {/* KPI GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <FaChartPie size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    Load Distribution
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Real-time load balancing analytics
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="h-[320px]">
                  <DutyChart
                    data={data.dutyTypeData}
                    title="By Responsibility Type"
                  />
                </div>
                {isAdmin && (
                  <div className="h-[320px] md:border-l border-slate-50 md:pl-12">
                    <DutyChart data={data.branchData} title="By Campus Load" />
                  </div>
                )}
              </div>
            </div>

            {/* CONTROL HUB */}
            <div className="bg-slate-50 rounded-[3rem] p-10 space-y-8">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                <FaShieldAlt className="text-indigo-600" /> Operational Control
                Hub
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                <div className="rounded-3xl border border-red-100 bg-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-2xl bg-red-50 text-red-600">
                      <FaExclamationTriangle size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">
                        Delete Complete Routine
                      </h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Purge all routine entries for {selectedYear} session.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDeleteRoutineYear}
                    disabled={deletingRoutineYear}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaTrashAlt />
                    {deletingRoutineYear ? "Deleting..." : `Delete ${selectedYear}`}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT CONTENT: Sidebar - Ranking & Leaves */}
          <aside className="xl:col-span-4 space-y-8">
            {/* TOP PERFORMANCE */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm relative overflow-hidden">
              <FaMedal className="absolute -right-4 -top-4 text-amber-500/10 text-8xl" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8">
                Responsibility ranking
              </h3>
              <div className="space-y-4">
                {data.topTeachers.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-default"
                  >
                    <span className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center font-black text-indigo-600 text-xs">
                      0{i + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-[13px] font-black uppercase truncate">
                        {t.name}
                      </h4>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase">
                        {t.totalDuties} Assigned Tasks
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LEAVE ARCHIVE */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black uppercase tracking-[0.3em]">
                  Recent leave
                </h3>
                <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">
                  Recent Logs
                </span>
              </div>
              <div className="space-y-6">
                {data.recentLeaves.slice(0, 5).map((leave, i) => (
                  <div key={i} className="flex gap-4 group cursor-default">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    <div className="space-y-1">
                      <h4 className="text-[13px] font-black leading-none group-hover:text-rose-600 transition-colors">
                        {leave.teacher?.name}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {leave.responsibilityType?.name || "Standard Leave"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/leaves/granted")}
                className="w-full mt-10 py-4 rounded-2xl border-2 border-slate-100 text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all flex items-center justify-center gap-2 group"
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
      <div className="h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest opacity-20 italic">
        Awaiting Buffer...
      </div>
    );

  return (
    <div className="h-full flex flex-col">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">
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
              border: "none",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              fontSize: "11px",
              fontWeight: "900",
              textTransform: "uppercase",
            }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{
              fontSize: "10px",
              fontWeight: "800",
              textTransform: "uppercase",
              paddingTop: "20px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect, useCallback } from "react";
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
  FaCalendarTimes,
  FaChartPie,
  FaLaptopCode,
  FaArrowRight,
  FaWalking,
  FaChevronDown,
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
} from "../api/apiService";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const COLORS = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

// --- 1. MODERN KPI CARD COMPONENT ---
const IconKpiCard = ({ title, value, icon: Icon, colorClass, gradient }) => (
  <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl p-7 rounded-[2.5rem] border border-white shadow-[0_20px_50px_rgba(79,70,229,0.04)] transition-all duration-500 hover:shadow-indigo-100 hover:-translate-y-1 group">
    <div
      className={`absolute -right-4 -top-4 w-28 h-28 rounded-full opacity-[0.03] transition-transform group-hover:scale-150 duration-700 ${gradient}`}
    ></div>
    <div className="flex items-center justify-between relative z-10">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
          {title}
        </p>
        <h3 className="text-4xl font-black text-slate-900 tracking-tight">
          {value}
        </h3>
      </div>
      <div
        className={`h-16 w-16 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:rotate-12 ${gradient} text-white shadow-indigo-200`}
      >
        <Icon size={28} />
      </div>
    </div>
  </div>
);

// --- 2. CONTROL CENTER CARD ---
const ControlCard = ({ icon: Icon, title, path, subtitle }) => (
  <Link
    to={path}
    className="group flex flex-col p-6 bg-slate-50/50 hover:bg-indigo-600 rounded-[2rem] border border-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-200"
  >
    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 group-hover:bg-white/20 group-hover:text-white transition-all mb-4 shadow-sm">
      <Icon size={20} />
    </div>
    <span className="text-sm font-black text-slate-800 group-hover:text-white uppercase tracking-tighter mb-1">
      {title}
    </span>
    <span className="text-[9px] font-bold text-slate-400 group-hover:text-indigo-100 uppercase tracking-widest">
      {subtitle}
    </span>
  </Link>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [totals, setTotals] = useState({
    teachers: 0,
    branches: 0,
    responsibilities: 0,
  });
  const [topTeachers, setTopTeachers] = useState([]);
  const [dutyTypeData, setDutyTypeData] = useState([]);
  const [branchData, setBranchData] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async (year) => {
    setLoading(true);
    try {
      const [summary, topT, dutyT, branchT, leaves] = await Promise.all([
        getDashboardSummary(year),
        getTopResponsibleTeachers(year),
        getAssignmentByDutyType(year),
        getAssignmentByBranch(year),
        getRecentGrantedLeaves(year),
      ]);

      setTotals({
        teachers: summary.data.totalTeachers || 0,
        branches: summary.data.totalBranches || 0,
        responsibilities: summary.data.totalResponsibilities || 0,
      });
      setTopTeachers(topT.data);
      setDutyTypeData(dutyT.data);
      setBranchData(branchT.data);
      setRecentLeaves(leaves.data);
    } catch (error) {
      toast.error("Failed to sync dashboard analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(selectedYear);
  }, [selectedYear, fetchDashboardData]);

  if (loading && !totals.teachers)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="text-7xl" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 px-4 sm:px-8 relative overflow-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* --- HEADER & YEAR FILTER --- */}
        <div className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="h-8 w-1.5 bg-indigo-600 rounded-full"></span>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                System Console
              </h1>
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] ml-5">
              Operational Intelligence for {selectedYear} Session
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white p-3 rounded-[2rem] shadow-xl shadow-indigo-100/20 border border-indigo-50">
            <div className="flex items-center gap-3 px-4 py-2 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <FaCalendarCheck size={14} />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent border-none text-xs font-black uppercase tracking-widest focus:ring-0 cursor-pointer outline-none"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y} className="text-slate-900">
                    {y} Session
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => fetchDashboardData(selectedYear)}
              className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-10">
          {/* --- LEFT COLUMN: ANALYTICS --- */}
          <div className="col-span-12 lg:col-span-8 space-y-10">
            {/* KPI ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <IconKpiCard
                title="Teaching Staff"
                value={totals.teachers}
                icon={FaUserTie}
                gradient="bg-gradient-to-br from-indigo-600 to-violet-600"
              />
              <IconKpiCard
                title="Active Branches"
                value={totals.branches}
                icon={FaBuilding}
                gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
              />
              <IconKpiCard
                title="Session Duties"
                value={totals.responsibilities}
                icon={FaTasks}
                gradient="bg-gradient-to-br from-blue-500 to-sky-600"
              />
            </div>

            {/* ANALYTICS CHARTS */}
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 group">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
                    <FaChartPie size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
                      Duty Matrix Analysis
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                      Load distribution by category & branch
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                <div className="h-[350px]">
                  <DutyChart
                    data={dutyTypeData}
                    title="Responsibility Segmentation"
                  />
                </div>
                <div className="h-[350px] xl:border-l border-slate-50 xl:pl-16">
                  <DutyChart
                    data={branchData}
                    title="Campus Operational Load"
                  />
                </div>
              </div>
            </div>

            {/* CONTROL CENTER */}
            {/* --- CONTROL CENTER (Quick Access Grid) --- */}
            <div className="bg-slate-950 p-12 rounded-[4rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20 group">
              {/* Premium Background Gradients */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/10 via-transparent to-violet-600/10 opacity-50"></div>
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] group-hover:bg-indigo-500/20 transition-colors duration-1000"></div>

              <div className="flex items-center justify-between mb-12 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="h-12 w-1.5 bg-indigo-500 rounded-full"></div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight uppercase leading-none mb-2">
                      Control Center
                    </h3>
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.5em]">
                      System Governance & Infrastructure
                    </p>
                  </div>
                </div>
                <FaLaptopCode className="text-white/5 text-7xl absolute right-10 top-0 rotate-12" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 relative z-10">
                {[
                  {
                    icon: FaBuilding,
                    title: "Branches",
                    path: "/setup/branch",
                    subtitle: "Manage Campus",
                  },
                  {
                    icon: FaUsers,
                    title: "Classes",
                    path: "/setup/class",
                    subtitle: "Academic Levels",
                  },
                  {
                    icon: FaBookOpen,
                    title: "Subjects",
                    path: "/setup/subject",
                    subtitle: "Curriculum",
                  },
                  {
                    icon: FaTasks,
                    title: "Duty Types",
                    path: "/setup/responsibility",
                    subtitle: "Role Definition",
                  },
                  {
                    icon: FaUserTie,
                    title: "Teachers",
                    path: "/teachers",
                    subtitle: "Staff Directory",
                  },
                  {
                    icon: FaCalendarCheck,
                    title: "Routines",
                    path: "/routine",
                    subtitle: "Daily Schedules",
                  },
                  {
                    icon: FaClipboard,
                    title: "Assignments",
                    path: "/assign",
                    subtitle: "Allocate Duties",
                  },
                  {
                    icon: FaChartBar,
                    title: "Reporting",
                    path: "/report",
                    subtitle: "Data Insights",
                  },
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.path}
                    className="group/btn flex flex-col p-6 bg-white/5 hover:bg-indigo-600 rounded-[2rem] border border-white/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(79,70,229,0.3)]"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-indigo-400 group-hover/btn:bg-white group-hover/btn:text-indigo-600 transition-all duration-500 mb-4">
                      <item.icon size={22} />
                    </div>
                    <span className="text-sm font-black text-white uppercase tracking-tighter mb-1">
                      {item.title}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 group-hover/btn:text-indigo-100 uppercase tracking-widest transition-colors">
                      {item.subtitle}
                    </span>

                    <div className="mt-6 flex items-center gap-2 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500">
                      <span className="text-[10px] font-black text-white uppercase">
                        Initialize
                      </span>
                      <FaArrowRight size={10} className="text-white" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: SIDEBAR --- */}
          <div className="col-span-12 lg:col-span-4 space-y-10">
            {/* TOP PERFORMERS */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 relative group">
              <FaMedal className="absolute top-8 right-10 text-yellow-400/20 text-6xl group-hover:scale-125 transition-transform" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em] mb-10">
                Neural Rank: Duties
              </h3>
              <div className="space-y-5">
                {topTeachers.length > 0 ? (
                  topTeachers.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center p-5 bg-slate-50/50 rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-300"
                    >
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center font-black text-indigo-600 shadow-sm mr-5 border border-slate-100">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase leading-none mb-1.5">
                          {t.name}
                        </p>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                          {t.totalDuties} ACTIVE RESPONSIBILITIES
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-10 text-slate-300 font-bold uppercase text-[10px]">
                    No Ranking Data
                  </p>
                )}
              </div>
            </div>

            {/* RECENT LEAVES */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em]">
                  Leave Dossier
                </h3>
                <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[9px] font-black rounded-lg uppercase">
                  Recent
                </span>
              </div>
              <div className="space-y-6 mb-10">
                {recentLeaves.length > 0 ? (
                  recentLeaves.slice(0, 5).map((leave, i) => (
                    <div key={i} className="flex items-start gap-5 group">
                      <div className="mt-1 h-2 w-2 rounded-full bg-rose-500 group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-none mb-1.5">
                          {leave.teacher?.name}
                        </p>
                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">
                          {leave.responsibilityType?.name || "Standard Leave"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-10 text-slate-300 font-bold uppercase text-[10px]">
                    No Recent Logs
                  </p>
                )}
              </div>
              <Button
                onClick={() => navigate("/leaves/granted")}
                variant="secondary"
                className="w-full rounded-[1.5rem] py-5 font-black text-[10px] uppercase tracking-[0.2em] border-slate-100 hover:bg-rose-500 hover:text-white transition-all duration-500 shadow-sm"
              >
                View Neural Archive
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CHART INTERNAL COMPONENT ---
const DutyChart = ({ data, title }) => {
  if (!data || data.length === 0)
    return (
      <div className="h-full flex items-center justify-center text-slate-200 font-black uppercase text-[10px] tracking-widest">
        Awaiting Data Buffer
      </div>
    );
  const chartData = data.map((item, index) => ({
    name: item.name,
    value: Number(item.count),
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="h-full flex flex-col">
      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 text-center">
        {title}
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={95}
            paddingAngle={8}
            animationBegin={0}
            animationDuration={1500}
          >
            {chartData.map((e, i) => (
              <Cell key={i} fill={e.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "24px",
              border: "none",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              fontSize: "12px",
              fontWeight: "900",
              textTransform: "uppercase",
              padding: "15px",
            }}
            itemStyle={{ color: "#1e293b" }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{
              paddingTop: "20px",
              fontSize: "10px",
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminDashboard;

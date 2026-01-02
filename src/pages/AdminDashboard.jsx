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
  FaShieldAlt,
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
const IconKpiCard = ({ title, value, icon: Icon, gradient }) => (
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
const ControlCard = ({ icon: Icon, title, path, subtitle, dark = false }) => (
  <Link
    to={path}
    className={`group flex flex-col p-6 rounded-[2rem] border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
      dark
        ? "bg-white/5 border-white/5 hover:bg-indigo-600 hover:shadow-indigo-900/40"
        : "bg-slate-50/50 border-white hover:bg-indigo-600 hover:shadow-indigo-200"
    }`}
  >
    <div
      className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all mb-4 shadow-sm ${
        dark
          ? "bg-white/10 text-indigo-400 group-hover:bg-white group-hover:text-indigo-600"
          : "bg-white text-indigo-600 group-hover:bg-white/20 group-hover:text-white"
      }`}
    >
      <Icon size={20} />
    </div>
    <span
      className={`text-sm font-black uppercase tracking-tighter mb-1 ${
        dark ? "text-white" : "text-slate-800 group-hover:text-white"
      }`}
    >
      {title}
    </span>
    <span
      className={`text-[9px] font-bold uppercase tracking-widest ${
        dark
          ? "text-slate-500 group-hover:text-indigo-100"
          : "text-slate-400 group-hover:text-indigo-100"
      }`}
    >
      {subtitle}
    </span>
  </Link>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
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
      // Incharge এর জন্য backend এ Token থেকে campusId filtering হবে
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
      toast.error("Protocol Error: Intelligence sync failed.");
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
    <div className="min-h-screen bg-[#F8FAFC] pb-20 pt-24 px-4 sm:px-8 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* --- HEADER & ROLE BADGE --- */}
        <div className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <span className="h-8 w-1.5 bg-indigo-600 rounded-full"></span>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
                {isAdmin ? "Admin Console" : "Incharge Workspace"}
              </h1>
              <span
                className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  isAdmin
                    ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                    : "bg-emerald-50 text-emerald-600 border-emerald-100"
                }`}
              >
                {isAdmin
                  ? "Global Access"
                  : `${user?.campus?.name || "Campus"} Node`}
              </span>
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] ml-6">
              Neural Sync: {selectedYear} Session Intelligence
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white p-3 rounded-[2rem] shadow-xl shadow-indigo-100/20 border border-indigo-50">
            <div className="flex items-center gap-3 px-4 py-2 bg-indigo-600 rounded-2xl text-white shadow-lg">
              <FaCalendarCheck size={14} />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent border-none text-xs font-black uppercase tracking-widest focus:ring-0 cursor-pointer outline-none"
              >
                {[2024, 2025, 2026].map((y) => (
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
          {/* --- LEFT COLUMN --- */}
          <div className="col-span-12 lg:col-span-8 space-y-10">
            {/* KPI ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <IconKpiCard
                title={isAdmin ? "Total Staff" : "Campus Staff"}
                value={totals.teachers}
                icon={FaUserTie}
                gradient="bg-gradient-to-br from-indigo-600 to-violet-600"
              />
              <IconKpiCard
                title={isAdmin ? "Active Branches" : "Node Status"}
                value={isAdmin ? totals.branches : "Active"}
                icon={FaBuilding}
                gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
              />
              <IconKpiCard
                title="Active Duties"
                value={totals.responsibilities}
                icon={FaTasks}
                gradient="bg-gradient-to-br from-blue-500 to-sky-600"
              />
            </div>

            {/* CHARTS (Only show branch chart to Admin) */}
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-5 mb-12">
                <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                  <FaChartPie size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
                    Load Distribution Matrix
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                    Operational analytics for {selectedYear}
                  </p>
                </div>
              </div>

              <div
                className={`grid grid-cols-1 ${
                  isAdmin ? "xl:grid-cols-2" : ""
                } gap-16`}
              >
                <div className="h-[350px]">
                  <DutyChart
                    data={dutyTypeData}
                    title="Responsibility Segmentation"
                  />
                </div>
                {isAdmin && (
                  <div className="h-[350px] xl:border-l border-slate-50 xl:pl-16">
                    <DutyChart
                      data={branchData}
                      title="Campus Operational Load"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* --- ROLE BASED ACTION ZONE --- */}
            {isAdmin ? (
              /* ADMIN CONTROL CENTER */
              <div className="bg-slate-950 p-12 rounded-[4rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20 group">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/10 via-transparent to-violet-600/10 opacity-50"></div>
                <h3 className="text-xl font-black mb-10 flex items-center gap-4 uppercase tracking-[0.4em] relative z-10">
                  <FaShieldAlt className="text-indigo-400" /> Master Control
                  Center
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 relative z-10">
                  <ControlCard
                    icon={FaBuilding}
                    title="Branches"
                    subtitle="Campus Setup"
                    path="/setup/branch"
                    dark
                  />
                  <ControlCard
                    icon={FaUsers}
                    title="Classes"
                    subtitle="Levels"
                    path="/setup/class"
                    dark
                  />
                  <ControlCard
                    icon={FaBookOpen}
                    title="Subjects"
                    subtitle="Curriculum"
                    path="/setup/subject"
                    dark
                  />
                  <ControlCard
                    icon={FaTasks}
                    title="Duty Types"
                    subtitle="Protocols"
                    path="/setup/responsibility"
                    dark
                  />
                  <ControlCard
                    icon={FaUserTie}
                    title="Teachers"
                    subtitle="Add"
                    path="/teachers"
                    dark
                  />
                  <ControlCard
                    icon={FaCalendarCheck}
                    title="Routines"
                    subtitle="Schedules"
                    path="/routine"
                    dark
                  />
                  <ControlCard
                    icon={FaClipboard}
                    title="Assignments"
                    subtitle="Allocation"
                    path="/assign"
                    dark
                  />
                  <ControlCard
                    icon={FaChartBar}
                    title="Reporting"
                    subtitle="Intelligence"
                    path="/report"
                    dark
                  />
                </div>
              </div>
            ) : (
              /* INCHARGE WORKSPACE (No Assign, No Report, No Control Center) */
              <div className="bg-indigo-600 p-12 rounded-[4rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-200 group">
                <FaLaptopCode className="absolute right-10 top-10 text-white/5 text-8xl rotate-12" />
                <h3 className="text-xl font-black mb-10 flex items-center gap-4 uppercase tracking-[0.4em] relative z-10">
                  Campus Management
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
                  <ControlCard
                    icon={FaUserTie}
                    title="Faculty List"
                    subtitle="My Campus Teachers"
                    path="/teachers"
                  />
                  <ControlCard
                    icon={FaCalendarCheck}
                    title="Master Routine"
                    subtitle="View & Setup"
                    path="/routine"
                  />
                  <ControlCard
                    icon={FaShieldAlt}
                    title="Master Setup"
                    subtitle="Metadata Entry"
                    path="/setup/branch"
                  />
                </div>
              </div>
            )}
          </div>

          {/* --- RIGHT COLUMN: SIDEBAR --- */}
          <div className="col-span-12 lg:col-span-4 space-y-10">
            {/* TOP PERFORMERS */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 relative group">
              <FaMedal className="absolute top-8 right-10 text-yellow-400/20 text-6xl" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em] mb-10">
                Neural Rank: Duties
              </h3>
              <div className="space-y-5">
                {topTeachers.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center p-5 bg-slate-50/50 rounded-3xl hover:bg-white hover:shadow-xl transition-all"
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
                ))}
              </div>
            </div>

            {/* RECENT LEAVES (Only show to Admin if needed, or filter for Incharge) */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em]">
                  Leave Archive
                </h3>
                <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[9px] font-black rounded-lg uppercase">
                  Recent
                </span>
              </div>
              <div className="space-y-6 mb-10">
                {recentLeaves.slice(0, 5).map((leave, i) => (
                  <div key={i} className="flex items-start gap-5 group">
                    <div className="mt-1 h-2 w-2 rounded-full bg-rose-500 group-hover:scale-150 transition-all shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                    <div>
                      <p className="text-sm font-black text-slate-800 leading-none mb-1.5">
                        {leave.teacher?.name}
                      </p>
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">
                        {leave.responsibilityType?.name || "Leave Logged"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {isAdmin && (
                <Button
                  onClick={() => navigate("/leaves/granted")}
                  variant="secondary"
                  className="w-full rounded-[1.5rem] py-5 font-black text-[10px] uppercase tracking-[0.2em] border-slate-100 hover:bg-rose-500 hover:text-white transition-all duration-500 shadow-sm"
                >
                  Access All Archives
                </Button>
              )}
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
        Awaiting Buffer
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
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{
              paddingTop: "20px",
              fontSize: "10px",
              fontWeight: "900",
              textTransform: "uppercase",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminDashboard;

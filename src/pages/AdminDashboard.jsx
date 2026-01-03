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
  <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl p-5 sm:p-7 rounded-[2rem] sm:rounded-[2.5rem] border border-white shadow-[0_20px_50px_rgba(79,70,229,0.04)] transition-all duration-500 hover:shadow-indigo-100 hover:-translate-y-1 group">
    <div
      className={`absolute -right-4 -top-4 w-20 h-20 sm:w-28 sm:h-28 rounded-full opacity-[0.03] transition-transform group-hover:scale-150 duration-700 ${gradient}`}
    ></div>
    <div className="flex items-center justify-between relative z-10">
      <div>
        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 sm:mb-2">
          {title}
        </p>
        <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {value}
        </h3>
      </div>
      <div
        className={`h-12 w-12 sm:h-16 sm:w-16 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:rotate-12 ${gradient} text-white shadow-indigo-200`}
      >
        <Icon className="text-xl sm:text-2xl" />
      </div>
    </div>
  </div>
);

// --- 2. CONTROL CENTER CARD ---
const ControlCard = ({ icon: Icon, title, path, subtitle, dark = false }) => (
  <Link
    to={path}
    className={`group flex flex-col p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
      dark
        ? "bg-white/5 border-white/5 hover:bg-indigo-600 hover:shadow-indigo-900/40"
        : "bg-slate-50/50 border-white hover:bg-indigo-600 hover:shadow-indigo-200"
    }`}
  >
    <div
      className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all mb-3 sm:mb-4 shadow-sm ${
        dark
          ? "bg-white/10 text-indigo-400 group-hover:bg-white group-hover:text-indigo-600"
          : "bg-white text-indigo-600 group-hover:bg-white/20 group-hover:text-white"
      }`}
    >
      <Icon size={18} />
    </div>
    <span
      className={`text-[12px] sm:text-sm font-black uppercase tracking-tighter mb-1 ${
        dark ? "text-white" : "text-slate-800 group-hover:text-white"
      }`}
    >
      {title}
    </span>
    <span
      className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-widest ${
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
    <div className="min-h-screen bg-[#F8FAFC] pb-10 sm:pb-20 pt-20 sm:pt-24 px-4 sm:px-8 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* --- HEADER --- */}
        <div className="mb-8 sm:mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-2">
              <span className="h-6 sm:h-8 w-1 sm:w-1.5 bg-indigo-600 rounded-full"></span>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
                {isAdmin ? "Admin Console" : "Incharge Workspace"}
              </h1>
              <span
                className={`px-3 sm:px-4 py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border ${
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
            <p className="text-slate-400 font-bold text-[9px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.4em] ml-5 sm:ml-6">
              Session: {selectedYear}{" "}
            </p>
          </div>

          <div className="flex items-center mx-auto md:mx-0 self-start lg:self-center gap-3 bg-white p-2 sm:p-3 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl shadow-indigo-100/20 border border-indigo-50">
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-indigo-600 rounded-xl sm:rounded-2xl text-white shadow-lg">
              <FaCalendarCheck size={12} />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent border-none text-[10px] sm:text-xs font-black uppercase tracking-widest focus:ring-0 cursor-pointer outline-none"
              >
                {/* 🚀 ২০২৪ থেকে বর্তমান বছর পর্যন্ত ডাইনামিক লুপ */}
                {Array.from(
                  { length: new Date().getFullYear() - 2024 + 1 },
                  (_, i) => 2024 + i
                )
                  .reverse()
                  .map((y) => (
                    <option key={y} value={y} className="text-slate-900">
                      {y} Session
                    </option>
                  ))}
              </select>
            </div>
            <button
              onClick={() => fetchDashboardData(selectedYear)}
              className="p-2 sm:p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 sm:gap-10">
          {/* --- LEFT COLUMN --- */}
          <div className="col-span-12 lg:col-span-8 space-y-6 sm:space-y-10">
            {/* KPI ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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

            {/* CHARTS */}
            <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 sm:gap-5 mb-8 sm:mb-12">
                <div className="h-10 w-10 sm:h-14 sm:w-14 bg-indigo-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                  <FaChartPie className="text-xl sm:text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter">
                    Load Distribution Matrix
                  </h3>
                  <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                    Operational analytics for {selectedYear}
                  </p>
                </div>
              </div>

              <div
                className={`grid grid-cols-1 ${
                  isAdmin ? "xl:grid-cols-2" : ""
                } gap-10 sm:gap-16`}
              >
                <div className="h-[300px] sm:h-[350px]">
                  <DutyChart
                    data={dutyTypeData}
                    title="Responsibility Segmentation"
                  />
                </div>
                {isAdmin && (
                  <div className="h-[300px] sm:h-[350px] xl:border-l border-slate-50 xl:pl-16">
                    <DutyChart
                      data={branchData}
                      title="Campus Operational Load"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ACTION ZONE */}
            <div
              className={`${
                isAdmin ? "bg-slate-950" : "bg-indigo-600"
              } p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[4rem] text-white relative overflow-hidden shadow-2xl group`}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
              <h3 className="text-lg sm:text-xl font-black mb-6 sm:mb-10 flex items-center gap-4 uppercase tracking-[0.3em] sm:tracking-[0.4em] relative z-10">
                <FaShieldAlt
                  className={isAdmin ? "text-indigo-400" : "text-white/80"}
                />{" "}
                {isAdmin ? "Master Control Center" : "Campus Management"}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-5 relative z-10">
                {isAdmin ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <ControlCard
                      icon={FaUserTie}
                      title="Teacher List"
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
                  </>
                )}
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: SIDEBAR --- */}
          <div className="col-span-12 lg:col-span-4 space-y-6 sm:gap-10">
            {/* RANKING */}
            <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden group">
              <FaMedal className="absolute top-6 sm:top-8 right-6 sm:right-10 text-yellow-400/10 text-5xl sm:text-6xl" />
              <h3 className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-8 sm:mb-10">
                Neural Rank: Duties
              </h3>
              <div className="space-y-4 sm:space-y-5">
                {topTeachers.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center p-4 sm:p-5 bg-slate-50/50 rounded-[1.5rem] sm:rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100"
                  >
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-white flex items-center justify-center font-black text-indigo-600 shadow-sm mr-3 sm:mr-5 border border-slate-100 flex-shrink-0 text-xs sm:text-base">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-black text-slate-800 uppercase leading-none mb-1 sm:mb-1.5 truncate">
                        {t.name}
                      </p>
                      <p className="text-[8px] sm:text-[10px] font-bold text-indigo-500 uppercase tracking-widest truncate">
                        {t.totalDuties} RESPONSIBILITIES
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LEAVES */}
            <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between mb-8 sm:mb-10">
                <h3 className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-[0.3em] sm:tracking-[0.4em]">
                  Leave Archive
                </h3>
                <span className="px-2 py-1 bg-rose-50 text-rose-600 text-[8px] sm:text-[9px] font-black rounded uppercase">
                  Recent
                </span>
              </div>
              <div className="space-y-5 sm:space-y-6 mb-8 sm:mb-10">
                {recentLeaves.slice(0, 5).map((leave, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 sm:gap-5 group"
                  >
                    <div className="mt-1 h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full bg-rose-500 group-hover:scale-150 transition-all shadow-[0_0_10px_rgba(239,68,68,0.5)] flex-shrink-0"></div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-black text-slate-800 leading-none mb-1 sm:mb-1.5 truncate">
                        {leave.teacher?.name}
                      </p>
                      <p className="text-[9px] sm:text-[10px] font-bold text-rose-500 uppercase tracking-tighter truncate">
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
                  className="w-full rounded-2xl sm:rounded-[1.5rem] py-4 sm:py-5 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] border-slate-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
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
      <h4 className="text-[9px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 sm:mb-8 text-center">
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
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={5}
            animationDuration={1000}
          >
            {chartData.map((e, i) => (
              <Cell key={i} fill={e.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "15px",
              border: "none",
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              fontSize: "10px",
              fontWeight: "900",
              textTransform: "uppercase",
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{
              paddingTop: "10px",
              fontSize: "9px",
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

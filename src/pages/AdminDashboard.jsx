import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaUsers,
  FaBookOpen,
  FaClipboardList,
  FaUserTie,
  FaTasks,
  FaChartBar,
  FaCalendarCheck,
  FaSyncAlt,
  FaMedal,
  FaClipboard,
  FaCalendarTimes,
  FaChartPie,
  FaLaptopCode,
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

// --- 1. PROFESSIONAL & SUBDUED COLOR PALETTE ---
const COLORS = [
  "#4F46E5", // Indigo 600
  "#0D9488", // Teal 600
  "#06B6D4", // Cyan 500
  "#F59E0B", // Amber 500
  "#64748B", // Slate 500
  "#A78BFA", // Violet 400
];

// --- 2. KPI CONFIGURATION (Muted Colors) ---
const KPI_CONFIG = [
  {
    title: "Total Teachers",
    key: "teachers",
    icon: FaUserTie,
    colorClass: "text-indigo-600",
    bgClass: "border-indigo-200",
  },
  {
    title: "Total Branches",
    key: "branches",
    icon: FaBuilding,
    colorClass: "text-slate-600",
    bgClass: "border-slate-200",
  },
  {
    title: "Total Classes",
    key: "classes",
    icon: FaUsers,
    colorClass: "text-teal-600",
    bgClass: "border-teal-200",
  },
  {
    title: "Total Subjects",
    key: "subjects",
    icon: FaBookOpen,
    colorClass: "text-amber-600",
    bgClass: "border-amber-200",
  },
  {
    title: "Active Duties",
    key: "responsibilities",
    icon: FaTasks,
    colorClass: "text-sky-600",
    bgClass: "border-sky-200",
  },
];

// --- 3. KPI CARD COMPONENT (Minimal Shadow/Color) ---
const IconKpiCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
  // Uses responsive grid columns defined in the main component
  <div
    className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 transition duration-200 hover:shadow-md`}
  >
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm text-gray-500 font-semibold uppercase tracking-wide">
          {title}
        </span>
        <h3 className="text-3xl font-bold text-gray-800 leading-tight mt-1">
          {value}
        </h3>
      </div>
      <div className={`p-3 rounded-full ${colorClass} bg-gray-100`}>
        <Icon className={`text-2xl ${colorClass}`} />
      </div>
    </div>
  </div>
);

// --- 4. CHART COMPONENT (Remains Functional) ---
const DutyChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
        <FaChartPie className="text-3xl mb-1" />
        <p className="text-sm">No assignments found.</p>
      </div>
    );
  }

  const chartData = data.map((item, index) => ({
    name: item.name,
    value: Number(item.count),
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="h-full flex flex-col">
      <h4 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">
        {title}
      </h4>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="40%"
            cy="50%"
            outerRadius={75}
            fill="#8884d8"
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value, "Assignments"]} />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{ paddingLeft: "15px", fontSize: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- 5. QUICK ACCESS CARD COMPONENT (Neutral Look) ---
const QuickAccessCard = ({ icon: Icon, title, path }) => (
  // Uses responsive grid columns defined in the main component
  <Link
    to={path}
    className="text-sm p-4 bg-white hover:bg-gray-100 rounded-lg font-semibold flex items-center transition-all duration-200 border border-gray-200 shadow-sm"
  >
    <Icon className="mr-3 text-lg text-indigo-600" />
    <span className="text-gray-700">{title}</span>
  </Link>
);

// --- 6. MAIN DASHBOARD COMPONENT ---
const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [totals, setTotals] = useState({
    branches: 0,
    classes: 0,
    subjects: 0,
    responsibilities: 0,
    teachers: 0,
    totalGrantedLeaves: 0,
  });
  const [topTeachers, setTopTeachers] = useState([]);
  const [dutyTypeData, setDutyTypeData] = useState([]);
  const [branchData, setBranchData] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [summaryRes, topTeachersRes, dutyTypeRes, branchRes, leavesRes] =
          await Promise.all([
            getDashboardSummary(),
            getTopResponsibleTeachers(),
            getAssignmentByDutyType(),
            getAssignmentByBranch(),
            getRecentGrantedLeaves(),
          ]);

        setTotals({
          branches: summaryRes.data.totalBranches || 0,
          classes: summaryRes.data.totalClasses || 0,
          subjects: summaryRes.data.totalSubjects || 0,
          responsibilities: summaryRes.data.totalResponsibilities || 0,
          teachers: summaryRes.data.totalTeachers || 0,
          totalGrantedLeaves: summaryRes.data.totalGrantedLeaves || 0,
        });

        setTopTeachers(topTeachersRes.data);
        setDutyTypeData(dutyTypeRes.data);
        setBranchData(branchRes.data);
        setRecentLeaves(leavesRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
        toast.error("Failed to load dashboard data totals.");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleViewAllLeaves = () => {
    navigate("/leaves/granted");
    toast.success("Redirecting to Granted Leaves Report.");
  };

  if (loading) {
    return (
      <div className="text-center p-20">
        <LoadingSpinner size="text-5xl" message="Loading Dashboard Data..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* PROFESSIONAL HEADING (Responsive font size) */}
      <h2 className="text-2xl sm:text-3xl text-center font-bold text-gray-900 mb-10 leading-tight border-b-2 border-indigo-100 pb-3">
        Administration Dashboard
        {/* <span className="text-indigo-600">({user?.name || "Admin"})</span> */}
      </h2>

      {/* Main Grid: Stacks on mobile, splits on large screens */}
      <div className="grid grid-cols-12 gap-8">
        {/* --- A. KPI ROW (Responsive 1/2/5 columns) --- */}
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-4">
          {KPI_CONFIG.map((kpi) => (
            <IconKpiCard
              key={kpi.key}
              title={kpi.title}
              value={totals[kpi.key]}
              icon={kpi.icon}
              colorClass={kpi.colorClass}
              bgClass={kpi.bgClass}
            />
          ))}
        </div>

        {/* --- B. MAIN ANALYTICS & ACTIVITY (Left Column: Full on mobile, 8/12 on large) --- */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* DUAL CHART CONTAINER (Responsive 1/2 columns) */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 relative">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center border-b pb-3">
              <FaChartBar className="mr-3 text-indigo-500" /> Duty Assignment
              Analysis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {/* 1. Responsibility Name Analysis (Border only on medium screens) */}
              <div className="h-80 md:border-r md:border-gray-100 md:pr-4 pr-0">
                <DutyChart
                  data={dutyTypeData}
                  title="Responsibility Name-wise Distribution"
                />
              </div>

              {/* 2. Branch Wise Analysis (Padding only on medium screens) */}
              <div className="h-80 md:pl-4 pl-0">
                <DutyChart
                  data={branchData}
                  title="Assignment Load by Branch"
                />
              </div>
            </div>
          </div>

          {/* Master Setup Quick Access Links (Responsive 2/3/4 columns) */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-xl font-bold text-gray-700 mb-6 flex items-center">
              <FaClipboard className="mr-2 text-indigo-500" /> Master Setup
              Quick Access
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              <QuickAccessCard
                icon={FaBuilding}
                title="Branches Setup"
                path="/setup/branch"
              />
              <QuickAccessCard
                icon={FaUsers}
                title="Classes Setup"
                path="/setup/class"
              />
              <QuickAccessCard
                icon={FaBookOpen}
                title="Subjects Setup"
                path="/setup/subject"
              />
              <QuickAccessCard
                icon={FaTasks}
                title="Duty Types Setup"
                path="/setup/responsibility"
              />
              <QuickAccessCard
                icon={FaUserTie}
                title="Teachers List"
                path="/teachers"
              />
              <QuickAccessCard
                icon={FaCalendarCheck}
                title="Routine Setup"
                path="/routine"
              />
              <QuickAccessCard
                icon={FaLaptopCode}
                title="Assign Duties"
                path="/assign"
              />
              <QuickAccessCard
                icon={FaChartBar}
                title="View Reports"
                path="/report"
              />
            </div>
          </div>
        </div>

        {/* --- C. SIDEBAR (Right Column: Full on mobile, 4/12 on large) --- */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Top Teachers List */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-fit">
            <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center border-b pb-2">
              <FaMedal className="mr-2 text-yellow-600" /> Top Responsible
              Keepers
            </h3>

            <div className="space-y-3">
              {topTeachers.length > 0 ? (
                topTeachers.map((t, index) => (
                  <div
                    key={t.teacherId}
                    className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition"
                  >
                    <span className="font-semibold text-gray-800 flex items-center">
                      <span className="text-lg w-6 font-bold text-indigo-600 mr-2">
                        {index + 1}.
                      </span>{" "}
                      {t.name}
                    </span>
                    <span className="text-indigo-600 font-bold text-xs bg-indigo-100 px-2 py-0.5 rounded-full">
                      {t.totalDuties} Duties
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic p-4 text-center bg-gray-50 rounded-lg">
                  No assigned duties found.
                </p>
              )}
            </div>
          </div>

          {/* Granted Leaves Card */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center border-b pb-2">
              <FaCalendarTimes className="mr-2 text-red-600" /> Recent Granted
              Leaves ({recentLeaves.length})
            </h3>

            {/* Use overflow-x-auto for horizontal table scrolling on small screens */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">
                      S.N.
                    </th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">
                      Teacher
                    </th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">
                      Duty
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {recentLeaves.length > 0 ? (
                    recentLeaves.map((leave, index) => (
                      <tr key={leave._id} className="hover:bg-red-50">
                        <td className="px-2 py-2 whitespace-nowrap">
                          {index + 1}.
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-gray-800">
                          {leave.teacher?.name}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-red-600 font-medium">
                          {leave.responsibilityType?.name || "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center py-4 text-gray-500 italic"
                      >
                        No granted leaves recorded recently.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Button
              onClick={handleViewAllLeaves}
              fullWidth
              variant="secondary"
              className="mt-4 text-sm"
            >
              View Full Granted List
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

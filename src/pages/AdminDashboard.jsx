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
  getAssignmentByDutyType, // Data for Responsibility Name-wise
  getAssignmentByBranch, // Data for Branch-wise
} from "../api/apiService";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";

const COLORS = [
  "#6366F1",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
];

// --- NEW/UPDATED: Chart Component (Uses 'name' for label) ---
const DutyChart = ({ data, title }) => {
  // Added 'title' prop
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
        <FaChartPie className="text-3xl mb-1" />
        <p className="text-sm">No assignments found.</p>
      </div>
    );
  }

  // Prepare data for Recharts (Using generic 'name' field)
  const chartData = data.map((item, index) => ({
    name: item.name,
    value: Number(item.count),
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="h-full flex flex-col">
      <h4 className="text-md font-semibold text-gray-700 mb-2 border-b pb-1">
        {title}
      </h4>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={75} // Reduced size for side-by-side view
            fill="#8884d8"
            labelLine={false}
            // label
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            layout="vertical" // Changed layout for better fit
            align="right"
            verticalAlign="middle"
            wrapperStyle={{ paddingLeft: "10px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- 1. KPI CARD COMPONENT (Omitted for brevity) ---
const KpiCard = ({ title, value, growth, unit = "" }) => (
  <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 transition-shadow duration-200">
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm text-gray-500">{title}</span>
      <span
        className={`text-xs font-semibold flex items-center ${
          growth >= 0 ? "text-green-600" : "text-red-600"
        }`}
      >
        {growth >= 0 ? "▲" : "▼"} {Math.abs(growth)}%
      </span>
    </div>
    <h3 className="text-4xl font-extrabold text-indigo-700 leading-tight">
      {value}
      {unit}
    </h3>
    <p className="text-xs text-gray-400">since last month</p>
  </div>
);

// --- 2. QUICK ACCESS CARD COMPONENT (Helper) ---
const QuickAccessCard = ({ icon: Icon, title, path }) => (
  <Link
    to={path}
    className="text-sm p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-semibold flex items-center transition-colors"
  >
    <Icon className="mr-2 text-indigo-600" /> {title}
  </Link>
);

// --- 3. MAIN DASHBOARD COMPONENT ---
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

  // States for dual charting
  const [dutyTypeData, setDutyTypeData] = useState([]);
  const [branchData, setBranchData] = useState([]);

  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // Fetch all data concurrently
        const [summaryRes, topTeachersRes, dutyTypeRes, branchRes, leavesRes] =
          await Promise.all([
            getDashboardSummary(),
            getTopResponsibleTeachers(),
            getAssignmentByDutyType(),
            getAssignmentByBranch(),
            getRecentGrantedLeaves(),
          ]);

        // 1. Set KPI Totals
        setTotals({
          branches: summaryRes.data.totalBranches || 0,
          classes: summaryRes.data.totalClasses || 0,
          subjects: summaryRes.data.totalSubjects || 0,
          responsibilities: summaryRes.data.totalResponsibilities || 0,
          teachers: summaryRes.data.totalTeachers || 0,
          totalGrantedLeaves: summaryRes.data.totalGrantedLeaves || 0,
        });

        // 2. Set Lists and Analytics
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
    // Navigate to the new dedicated page /leaves/granted
    navigate("/leaves/granted");
    toast.success("Redirecting to Granted Leaves Report.");
  };

  if (loading) {
    return (
      <div className="text-center p-20">
        <FaSyncAlt className="animate-spin text-5xl text-indigo-600 mx-auto" />
        <p className="mt-4 text-xl text-gray-600 font-semibold">
          Loading Dashboard Data...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Modern Gradient Heading */}
      <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600 mb-10 leading-tight">
        Welcome, {user?.name || "Admin"}! 👋
      </h2>

      <div className="grid grid-cols-12 gap-8">
        {/* --- A. KPI ROW (Full Width - 12/12) --- */}
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-4">
          <KpiCard
            title="Total Teachers"
            value={totals.teachers}
            growth={3.5}
          />
          <KpiCard
            title="Total Branches"
            value={totals.branches}
            growth={1.2}
          />
          <KpiCard title="Total Classes" value={totals.classes} growth={0} />
          <KpiCard
            title="Total Subjects"
            value={totals.subjects}
            growth={-2.1}
          />
          <KpiCard
            title="Active Duties"
            value={totals.responsibilities}
            growth={4.8}
          />
        </div>

        {/* --- B. MAIN ANALYTICS & ACTIVITY (Left Column - 8/12) --- */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* ✅ DUAL CHART CONTAINER */}
          <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 relative">
            <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
              <FaChartBar className="mr-2 text-indigo-500" /> Duty Assignment
              Analytics
            </h3>

            {/* Render two charts side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {/* 1. Responsibility Name Analysis */}
              <div className="h-80">
                <DutyChart
                  data={dutyTypeData}
                  title="Responsibility Name-wise"
                />
              </div>

              {/* 2. Branch Wise Analysis */}
              <div className="h-80">
                <DutyChart data={branchData} title="Branch Wise Analysis" />
              </div>
            </div>
          </div>

          {/* Master Setup Quick Access Links */}
          <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
              <FaClipboard className="mr-2 text-indigo-500" /> Master Setup
              Quick Access
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickAccessCard
                icon={FaBuilding}
                title="Branches"
                path="/setup/branch"
              />
              <QuickAccessCard
                icon={FaUsers}
                title="Classes"
                path="/setup/class"
              />
              <QuickAccessCard
                icon={FaBookOpen}
                title="Subjects"
                path="/setup/subject"
              />
              <QuickAccessCard
                icon={FaUserTie}
                title="Teachers"
                path="/teachers"
              />
              <QuickAccessCard
                icon={FaTasks}
                title="Assign Duties"
                path="/assign"
              />
              <QuickAccessCard
                icon={FaCalendarCheck}
                title="Routines"
                path="/routine"
              />
            </div>
          </div>
        </div>

        {/* --- C. TOP RESPONSIBLE TEACHERS SIDEBAR (Right Column - 4/12) --- */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 h-fit">
            <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
              <FaMedal className="mr-2 text-yellow-600" /> Top Responsible
              Keepers
            </h3>

            {/* List of Teachers (Ranked by Total Duties) */}
            <div className="space-y-3">
              {topTeachers.length > 0 ? (
                topTeachers.map((t, index) => (
                  <div
                    key={t.teacherId}
                    className="flex justify-between items-center p-2 border-b last:border-b-0"
                  >
                    <span className="font-semibold text-gray-800">
                      {index + 1}. {t.name}
                    </span>
                    <span className="text-indigo-600 font-bold">
                      {t.totalDuties} Duties
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No assigned duties found.
                </p>
              )}
            </div>
          </div>

          {/* Granted Leaves Card (Table and Redirection) */}
          <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
              <FaCalendarTimes className="mr-2 text-indigo-500" /> Recent
              Granted Leaves ({recentLeaves.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">
                      S.N.
                    </th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">
                      Teacher
                    </th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">
                      Campus
                    </th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">
                      Responsibility
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {recentLeaves.length > 0 ? (
                    recentLeaves.map((leave, index) => (
                      <tr key={leave._id}>
                        <td className="px-2 py-2 whitespace-nowrap">
                          {index + 1}.
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          {leave.teacher?.name}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          {leave.teacher?.campus?.name || "N/A"}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          {leave.responsibilityType?.name || "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
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

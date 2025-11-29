import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaCalendarTimes, FaFileExcel } from "react-icons/fa";
import {
  getAllGrantedLeavesForReport,
  exportLeavesReportToExcel, // ✅ Export function imported
} from "../api/apiService";
import LoadingSpinner from "../components/ui/LoadingSpinner"; // Assuming this is the correct component name

const GrantedLeavesPage = () => {
  const [leavesData, setLeavesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaves = async () => {
      setLoading(true);
      try {
        // Fetch data from the base /api/leaves endpoint with status=Granted
        const { data } = await getAllGrantedLeavesForReport();
        setLeavesData(data);
      } catch (error) {
        toast.error("Failed to fetch Granted Leaves report data.");
        setLeavesData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, []);

  // ✅ HANDLER: Function to export the granted leaves list
  const handleExportExcel = () => {
    toast.promise(
      new Promise((resolve) => {
        exportLeavesReportToExcel(); // Trigger the backend Excel download route
        resolve();
      }),
      {
        loading: "Preparing Granted Leaves Excel file...",
        success: "Download started!",
        error: "Download failed. Check Admin rights or server logs.",
      }
    );
  };

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-3xl font-bold text-indigo-800 mb-8 flex items-center">
          <FaCalendarTimes className="mr-3" />
          Granted Leaves Report
        </h2>
        {/* Placeholder for LoadingSpinner */}
        <div className="text-center p-20">
          <LoadingSpinner message="Loading all granted leave records..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold text-indigo-800 mb-8 flex items-center">
        <FaCalendarTimes className="mr-3" />
        Granted Leaves Report ({leavesData.length})
      </h2>

      {/* --- Export and Actions Area --- */}
      <div className="mb-6 flex justify-end space-x-3">
        <button
          onClick={handleExportExcel} // ✅ Use the new handler
          className="p-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
          disabled={leavesData.length === 0}
        >
          <FaFileExcel className="mr-2" /> Export to Excel
        </button>
      </div>

      {/* --- Report Table --- */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-2xl border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-indigo-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                S.N.
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                Teacher's Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                Campus
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                Leave Responsibility
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                Year
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                Date Granted
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leavesData.length > 0 ? (
              leavesData.map((leave, index) => (
                <tr key={leave._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                    {leave.teacher?.name} ({leave.teacher?.teacherId})
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                    {leave.teacher?.campus?.name || "N/A"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                    {leave.responsibilityType?.name || "N/A"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                    {leave.year}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                    {leave.reason || "N/A"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                    {new Date(leave.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center text-gray-500 py-10 bg-white"
                >
                  No granted leave records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GrantedLeavesPage;

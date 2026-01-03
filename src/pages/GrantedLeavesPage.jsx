import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FaCalendarTimes,
  FaSearch,
  FaUniversity,
  FaHistory,
  FaUserAlt,
} from "react-icons/fa";
import { getAllGrantedLeavesForReport } from "../api/apiService";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const GrantedLeavesPage = () => {
  const [leavesData, setLeavesData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaves = async () => {
      setLoading(true);
      try {
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

  const filteredLeaves = leavesData.filter(
    (leave) =>
      leave.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.teacher?.teacherId?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <LoadingSpinner message="Accessing Leave Archive..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 px-4 sm:px-6 lg:px-8 pt-20 sm:pt-10 relative overflow-hidden">
      {/* Background Subtle Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* --- HEADER & SEARCH BAR --- */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 sm:mb-10">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <div className="flex items-center gap-3 sm:gap-4 mb-2">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-rose-100 text-rose-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm">
                <FaCalendarTimes className="text-xl sm:text-2xl" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                Leave Archive <span className="text-rose-500">.</span>
              </h1>
            </div>
            <p className="text-slate-400 font-bold text-[9px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] ml-1 sm:ml-16">
              Neural Database: {leavesData.length} Granted Records
            </p>
          </div>

          {/* Search Input */}
          <div className="relative group w-full lg:w-96 animate-in fade-in slide-in-from-right duration-700">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search Teacher Name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 sm:py-4 bg-white border border-slate-100 rounded-xl sm:rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all font-bold text-sm outline-none"
            />
          </div>
        </div>

        {/* --- REPORT AREA --- */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm border border-white overflow-hidden">
          {/* Desktop Table View (Visible on MD and up) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    S.N.
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    Teacher Intel
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    Station
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    Leave Scope
                  </th>
                  <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    Session
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    Reason
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLeaves.length > 0
                  ? filteredLeaves.map((leave, index) => (
                      <tr
                        key={leave._id}
                        className="group hover:bg-indigo-50/30 transition-all"
                      >
                        <td className="px-6 py-4 text-xs font-black text-slate-300 group-hover:text-indigo-400">
                          {String(index + 1).padStart(2, "0")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs uppercase shadow-inner">
                              {leave.teacher?.name?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-slate-800 uppercase tracking-tighter truncate max-w-[150px]">
                                {leave.teacher?.name}
                              </p>
                              <p className="text-[10px] font-bold text-indigo-400 uppercase">
                                ID: {leave.teacher?.teacherId}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-500">
                            <FaUniversity
                              className="text-slate-300"
                              size={12}
                            />
                            <span className="text-xs font-bold uppercase truncate max-w-[100px]">
                              {leave.teacher?.campus?.name || "Global"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1.5 bg-rose-50 text-rose-600 text-[10px] font-black rounded-lg uppercase border border-rose-100">
                            {leave.responsibilityType?.name || "Standard"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                            {leave.year}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-slate-500 font-medium line-clamp-1 italic max-w-xs group-hover:line-clamp-none transition-all">
                            {leave.reason || "Not specified"}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-slate-400">
                            <FaHistory size={10} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                              {new Date(leave.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (Visible on small screens) */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredLeaves.length > 0
              ? filteredLeaves.map((leave, index) => (
                  <div
                    key={leave._id}
                    className="p-5 space-y-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">
                          {leave.teacher?.name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 uppercase tracking-tighter">
                            {leave.teacher?.name}
                          </h4>
                          <p className="text-[10px] font-bold text-indigo-500 uppercase">
                            ID: {leave.teacher?.teacherId}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-slate-300">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[10px] font-bold uppercase tracking-widest">
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-slate-400 mb-1">Session</p>
                        <p className="text-slate-700">{leave.year}</p>
                      </div>
                      <div className="p-2 bg-rose-50 rounded-lg border border-rose-100">
                        <p className="text-rose-400 mb-1">Leave Type</p>
                        <p className="text-rose-600">
                          {leave.responsibilityType?.name || "Standard"}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                        Reason Narrative
                      </p>
                      <p className="text-xs text-slate-600 italic leading-relaxed">
                        {leave.reason || "No narrative provided"}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-50 text-[9px] font-black uppercase text-slate-400">
                      <div className="flex items-center gap-1">
                        <FaUniversity size={10} />{" "}
                        {leave.teacher?.campus?.name || "Global"}
                      </div>
                      <div className="flex items-center gap-1">
                        <FaHistory size={10} />{" "}
                        {new Date(leave.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </div>
                    </div>
                  </div>
                ))
              : null}
          </div>

          {/* Empty State */}
          {filteredLeaves.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center opacity-30 grayscale">
              <FaCalendarTimes size={80} className="text-slate-200 mb-4" />
              <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">
                No Archival Data Found
              </p>
            </div>
          )}
        </div>

        {/* --- FOOTER INFO --- */}
        <div className="mt-8 flex justify-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] text-center">
            Authorized Data Entry Only • Neural Matrix V2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default GrantedLeavesPage;

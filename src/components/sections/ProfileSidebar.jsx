import React from "react";
import {
  FaPhoneAlt,
  FaUniversity,
  FaTrashAlt,
  FaFingerprint,
  FaHistory,
  FaStar,
} from "react-icons/fa";

const ProfileSidebar = ({
  teacherDetails,
  grantedLeaves,
  isAdmin,
  handleLeaveDelete,
  handleReportDelete,
}) => (
  <div className="lg:col-span-4 space-y-8 no-print animate-in fade-in slide-in-from-left duration-700">
    {/* --- ১. Personal Intel Card --- */}
    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>

      <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
        <div className="p-2 bg-indigo-500 rounded-lg text-white shadow-lg shadow-indigo-200">
          <FaFingerprint size={12} />
        </div>
        Identity Intel
      </h3>

      <div className="space-y-4 relative z-10">
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-white border border-slate-100 rounded-2xl transition-all hover:shadow-md hover:border-indigo-100">
          <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-500">
            <FaPhoneAlt size={14} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
              Secure Line
            </p>
            <p className="text-sm font-bold text-slate-700">
              {teacherDetails.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-white border border-slate-100 rounded-2xl transition-all hover:shadow-md hover:border-indigo-100">
          <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-500">
            <FaUniversity size={14} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
              Current Station
            </p>
            <p className="text-sm font-bold text-slate-700">
              {teacherDetails.campus?.name}
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* --- ২. Leave History Card --- */}
    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>

      <h3 className="text-[11px] font-black text-rose-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
        <div className="p-2 bg-rose-500 rounded-lg text-white shadow-lg shadow-rose-200">
          <FaHistory size={12} />
        </div>
        Leave Archive
      </h3>

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {grantedLeaves.length > 0 ? (
          grantedLeaves.map((leave) => (
            <div
              key={leave._id}
              className="p-5 bg-white border border-slate-100 rounded-[1.5rem] relative group transition-all hover:border-rose-100 hover:shadow-sm"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="px-2 py-0.5 bg-rose-50 text-[9px] font-black text-rose-600 rounded uppercase">
                  Session {leave.year}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => handleLeaveDelete(leave._id)}
                    className="h-7 w-7 bg-rose-50 text-rose-400 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all duration-300"
                  >
                    <FaTrashAlt size={10} />
                  </button>
                )}
              </div>
              <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">
                "{leave.reason}"
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-10 opacity-30">
            <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
              <FaHistory />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase">
              No Archive Nodes
            </p>
          </div>
        )}
      </div>
    </div>

    {/* --- ৩. Performance Reviews Card --- */}
    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>

      <h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
        <div className="p-2 bg-emerald-500 rounded-lg text-white shadow-lg shadow-emerald-200">
          <FaStar size={12} />
        </div>
        Appraisal Log
      </h3>

      <div className="space-y-6 relative">
        {teacherDetails.reports?.length > 0 ? (
          teacherDetails.reports.map((report) => (
            <div
              key={report._id}
              className="pl-6 border-l-2 border-emerald-100 relative group"
            >
              <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm transition-transform group-hover:scale-125"></div>

              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">
                  Session {report.year}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => handleReportDelete(report._id)}
                    className="h-6 w-6 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <FaTrashAlt size={10} />
                  </button>
                )}
              </div>

              <div className="p-4 bg-white/50 border border-slate-50 rounded-2xl shadow-sm transition-all hover:bg-white hover:border-emerald-100">
                <p className="text-[11px] text-slate-600 font-bold leading-relaxed italic">
                  "{report.performanceReport}"
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 opacity-30">
            <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
              <FaStar />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase">
              Pending Appraisal
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default ProfileSidebar;

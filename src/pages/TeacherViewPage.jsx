import React, { useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaAddressBook,
  FaBuilding,
  FaFileExcel,
  FaUserPlus,
  FaSearch,
  FaUsers,
  FaCloudUploadAlt,
  FaShieldAlt,
} from "react-icons/fa";

// Core Components
import TeacherSearchList from "../components/lists/TeacherSearchList";
import AddTeacherForm from "../components/forms/AddTeacherForm";
import TeacherProfile from "../components/views/TeacherProfile";
import BulkUploadSection from "../components/sections/BulkUploadSection";
import { useAuth } from "../context/AuthContext";

const TeacherViewPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isProfileView = !!id;
  const [viewMode, setViewMode] = useState("list");
  const [refreshList, setRefreshList] = useState(0);

  const isAdmin = user?.role === "admin";
  const isIncharge = user?.role === "incharge";

  // --- Success Handler ---
  const handleSaveSuccess = () => {
    toast.success("Staff profile synchronized successfully.");
    setViewMode("list");
    setRefreshList((prev) => prev + 1);
  };

  // --- 🛡️ PROFILE VIEW CASE ---
  if (isProfileView) {
    return (
      <div className="animate-in fade-in duration-700">
        <TeacherProfile teacherId={id} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 flex-none place-items-center rounded-lg bg-slate-900 text-white">
              <FaUsers />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Teacher Directory
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {isAdmin
                  ? "Manage teachers across all branches and shifts"
                  : `${user?.campus?.name || "Campus"} Teachers' Directory`}
              </p>
            </div>
          </div>

          <div className="flex w-full gap-2 rounded-lg border border-slate-200 bg-white p-1 sm:w-auto">
            <button
              onClick={() => setViewMode("list")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors sm:flex-none ${
                viewMode === "list"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <FaSearch size={12} /> Directory
              </span>
            </button>

            <button
              onClick={() => setViewMode("add")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors sm:flex-none ${
                viewMode === "add"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <FaUserPlus size={12} /> Add Teacher
              </span>
            </button>
          </div>
        </div>

        {viewMode === "list" ? (
          <TeacherSearchList key={refreshList} />
        ) : (
          <div
            className={`grid grid-cols-1 gap-6 ${
              isAdmin ? "xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.8fr)]" : ""
            }`}
          >
            <section className="border border-slate-200 bg-white p-5">
              <div className="mb-5 flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-teal-700">
                  <FaAddressBook />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {isIncharge
                      ? "Campus Teacher Registration"
                      : "Teacher Registration"}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {isAdmin ? "All branches and shifts" : user?.campus?.name}
                  </p>
                </div>
              </div>

              <AddTeacherForm onSaveSuccess={handleSaveSuccess} />
            </section>

            {isAdmin && (
              <aside className="space-y-6">
                <section className="border border-slate-200 bg-white p-5">
                  <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-teal-700">
                        <FaCloudUploadAlt />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          Bulk Add
                        </h2>
                        <p className="text-sm text-slate-500">
                          Spreadsheet import
                        </p>
                      </div>
                    </div>

                    <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-500 sm:flex">
                      <FaShieldAlt />
                      Admin only
                    </div>
                  </div>

                  <BulkUploadSection onUploadSuccess={handleSaveSuccess} />
                </section>

                <section className="border border-slate-200 bg-white p-5">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-500">
                      <FaFileExcel />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        Import format
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Required columns: teacherId, name, phone, campus, and
                        designation. Campus values should match Branch/Shift
                        setup names.
                      </p>
                    </div>
                  </div>
                </section>
              </aside>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherViewPage;

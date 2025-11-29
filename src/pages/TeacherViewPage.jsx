import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaUserPlus, FaSearch } from "react-icons/fa";

// Core Components (Imported and refactored)
import TeacherSearchList from "../components/lists/TeacherSearchList";
import AddTeacherForm from "../components/forms/AddTeacherForm";
import TeacherProfile from "../components/views/TeacherProfile";
import BulkUploadSection from "../components/sections/BulkUploadSection";

// --- D. মেইন পেজ কম্পোনেন্ট যা ভিউ নির্ধারণ করে ---
const TeacherViewPage = () => {
  const { id } = useParams();
  const isProfileView = !!id;

  const [viewMode, setViewMode] = useState("list");
  const [refreshList, setRefreshList] = useState(0);
  const navigate = useNavigate(); // Ensuring navigate is available

  useEffect(() => {
    if (!isProfileView) {
      setViewMode("list");
    }
  }, [isProfileView]);

  const handleSaveSuccess = () => {
    toast.success("Teacher data saved successfully. Updating list...");
    setViewMode("list");
    setRefreshList((prev) => prev + 1);
  };

  // If ID exists in URL, show the profile view
  if (isProfileView) {
    return (
      <div className="p-4">
        <TeacherProfile teacherId={id} />
      </div>
    );
  }

  // Otherwise, show the list/add view
  return (
    <div className="p-4">
      {/* 🚀 MODERNIZE HEADER */}
      <h1 className="text-4xl font-extrabold text-indigo-800 mb-6 flex items-center border-b-4 border-indigo-300 pb-2">
        <FaUserPlus className="mr-3 text-4xl text-indigo-600" />
        Teacher Management
      </h1>

      {/* --- টগল বাটন/ট্যাব (List/Add) --- */}
      <div className="flex space-x-4 mb-6 border-b pb-2">
        <button
          onClick={() => setViewMode("list")}
          className={`py-2 px-4 rounded-t-lg font-semibold transition ${
            viewMode === "list"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FaSearch className="inline mr-2" /> View & Search Teachers
        </button>
        <button
          onClick={() => setViewMode("add")}
          className={`py-2 px-4 rounded-t-lg font-semibold transition ${
            viewMode === "add"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FaUserPlus className="inline mr-2" /> Add New Teacher
        </button>
      </div>

      {/* --- কন্টেন্ট রেন্ডারিং: ম্যানুয়াল ও বাল্ক পাশাপাশি --- */}
      {viewMode === "list" ? (
        <TeacherSearchList key={refreshList} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* বাম দিকে: ম্যানুয়াল এন্ট্রি ফর্ম */}
          <div>
            <AddTeacherForm onSaveSuccess={handleSaveSuccess} />
          </div>

          {/* ডান দিকে: বাল্ক আপলোড সেকশন */}
          <div>
            <BulkUploadSection onSaveSuccess={handleSaveSuccess} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherViewPage;

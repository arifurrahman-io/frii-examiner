import React, { useState } from "react";
import { useParams } from "react-router-dom";
import MasterEntryForm from "../components/forms/MasterEntryForm";
import MasterList from "../components/lists/MasterList";
import { FaCog, FaLink, FaLayerGroup, FaBook, FaTasks } from "react-icons/fa"; // Added specific icons

const MasterSetupPage = () => {
  const { type } = useParams(); // URL প্যারামিটার থেকে 'type' আনা হবে (e.g., /setup/branch -> type='branch')
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Dynamic Title Generation & Icon Selection
  const getPageConfig = (t) => {
    switch (t) {
      case "branch":
        return { title: "Branch / Campus Setup", icon: FaLink };
      case "class":
        return { title: "Class Setup", icon: FaLayerGroup };
      case "subject":
        return { title: "Subject Setup", icon: FaBook };
      case "responsibility":
        return { title: "Responsibility Type Setup", icon: FaTasks };
      default:
        return { title: "Master Data Setup", icon: FaCog };
    }
  };

  const pageConfig = getPageConfig(type);

  // সেভ সফল হলে তালিকা রিফ্রেশ করার জন্য ফাংশন
  const handleSaveSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // অবৈধ 'type' এর জন্য (Enhanced 404/Error UI)
  const validTypes = ["branch", "class", "subject", "responsibility"];
  if (!validTypes.includes(type)) {
    return (
      <div className="text-center p-12 bg-white rounded-xl shadow-2xl border border-red-300 max-w-lg mx-auto mt-20">
        <h2 className="text-3xl font-bold text-red-700 mb-4">
          Error: Invalid Setup Type
        </h2>
        <p className="text-gray-600">
          Please navigate to a valid setup page (e.g., /setup/branch).
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* 🚀 PROFESSIONAL HEADER: Large, prominent, and clean */}
      <h2 className="text-2xl font-extrabold text-indigo-800 mb-10 flex items-center border-b-4 border-indigo-200 pb-3">
        <pageConfig.icon className="mr-4 text-2xl text-indigo-600" />
        {pageConfig.title}
      </h2>

      {/* --- Responsive Grid Container (2/5 for form, 3/5 for list on large screens) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* বাম কলাম: ফর্ম (lg: 2/5 অংশ) */}
        <div className="lg:col-span-2">
          {/* MasterEntryForm is wrapped in a Card-like style internally */}
          <MasterEntryForm type={type} onSaveSuccess={handleSaveSuccess} />
        </div>

        {/* ডান কলাম: তালিকা (lg: 3/5 অংশ) */}
        <div className="lg:col-span-3">
          {/* MasterList now internally uses a grid-cols-2 for its list items */}
          <MasterList type={type} refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

export default MasterSetupPage;

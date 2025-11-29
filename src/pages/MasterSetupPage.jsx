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

  // অবৈধ 'type' এর জন্য
  const validTypes = ["branch", "class", "subject", "responsibility"];
  if (!validTypes.includes(type)) {
    return (
      <div className="text-center p-10 bg-white rounded-xl shadow-lg border border-red-200">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Error: Invalid Setup Type
        </h2>
        <p className="text-gray-600">
          Please navigate to a valid setup page (e.g., /setup/branch).
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* 🚀 MODERNIZE HEADER */}
      <h2 className="text-4xl font-extrabold text-indigo-800 mb-8 flex items-center border-b-4 border-indigo-300 pb-2">
        <pageConfig.icon className="mr-3 text-4xl text-indigo-600" />
        {pageConfig.title}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* বাম কলাম: ফর্ম (lg: 2/5 অংশ) - Uses the component's internal modern styling */}
        <div className="lg:col-span-2">
          <MasterEntryForm type={type} onSaveSuccess={handleSaveSuccess} />
        </div>

        {/* ডান কলাম: তালিকা (lg: 3/5 অংশ) - Uses the component's internal modern styling */}
        <div className="lg:col-span-3">
          <MasterList type={type} refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

export default MasterSetupPage;

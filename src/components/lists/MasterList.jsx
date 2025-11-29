import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaList,
  FaSave,
  FaTimes,
  FaTag,
} from "react-icons/fa";
import {
  getMasterDataList,
  deleteMasterData,
  updateMasterData,
} from "../../api/apiService";

// মাস্টার ডেটার প্রকারভেদ অনুযায়ী হেডিং সেট করা
const getTitles = (type) => {
  switch (type) {
    case "branch":
      return { header: "Campus/Branch List", column: "Branch Name" };
    case "class":
      return { header: "Class List", column: "Class Name" };
    case "subject":
      return { header: "Subject List", column: "Subject Name" };
    case "responsibility":
      return { header: "Responsibility Type List", column: "Type Name" };
    default:
      return { header: "Master List", column: "Name" };
  }
};

const MasterList = ({ type, refreshTrigger }) => {
  // নিশ্চিত করা হচ্ছে যে list সবসময় একটি অ্যারে
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  const titles = getTitles(type);

  // --- ১. ডেটা ফেচ করা ---
  useEffect(() => {
    const fetchList = async () => {
      setLoading(true);
      try {
        const { data } = await getMasterDataList(type);
        // ✅ ডেটা অ্যারে না হলে, খালি অ্যারে সেট করুন
        setList(Array.isArray(data) ? data : []);
      } catch (error) {
        // 403 Forbidden বা অন্য API ত্রুটি হ্যান্ডেল করা
        const msg =
          error.response?.data?.message ||
          `Failed to fetch ${type} list. Check login status.`;
        toast.error(msg);
        setList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [type, refreshTrigger]);

  // --- ২. ডেটা মুছে ফেলা ---
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this ${titles.column}? This action cannot be undone.`
      )
    )
      return;

    try {
      await deleteMasterData(type, id);
      toast.success(`${titles.column} deleted successfully!`);
      // তালিকা লোকালি আপডেট করা
      setList(list.filter((item) => item._id !== id));
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        `Deletion failed. Check admin privileges or dependencies.`;
      toast.error(msg);
    }
  };

  // --- ৩. ডেটা এডিট করা ---
  const handleUpdate = async (id) => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    try {
      // 1. বর্তমানে এডিট হওয়া আইটেমটি খুঁজে বের করা
      const currentItem = list.find((item) => item._id === id);

      // 2. ডায়নামিক ও শর্তসাপেক্ষ পেলোড তৈরি করা
      const updatePayload = { name: editName };

      // Responsibility Type এর জন্য Category যোগ করা
      if (type === "responsibility" && currentItem?.category) {
        updatePayload.category = currentItem.category;
      }

      // Class এর জন্য Level যোগ করা
      if (type === "class" && currentItem?.level) {
        updatePayload.level = currentItem.level;
      }

      // Subject এর জন্য Code যোগ করা
      if (type === "subject" && currentItem?.code) {
        updatePayload.code = currentItem.code;
      }

      // 3. API কল (PUT /api/resource/:id)
      const { data } = await updateMasterData(type, id, updatePayload);

      toast.success(`${titles.column} updated successfully!`);

      // 4. তালিকা লোকালি আপডেট করা
      setList(list.map((item) => (item._id === id ? data : item)));

      setEditId(null);
      setEditName("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || `Failed to update ${type}.`;
      toast.error(errorMessage);
    }
  };

  // --- ৪. এডিট মোড চালু করা ---
  const startEdit = (item) => {
    setEditId(item._id);
    setEditName(item.name);
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-lg border border-gray-200">
        <FaSyncAlt className="animate-spin text-3xl text-indigo-500 mx-auto" />
        <p className="mt-2 text-gray-600">Loading {titles.header}...</p>
      </div>
    );
  }

  return (
    // ❌ REMOVED: shadow-2xl. Use stronger border for separation.
    <div className="bg-white p-6 rounded-xl border border-gray-300">
      <h2 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center border-b-2 border-indigo-100 pb-3">
        <FaList className="mr-3 text-indigo-600" />
        {titles.header} ({list.length})
      </h2>

      <ul className="space-y-3">
        {Array.isArray(list) && list.length > 0 ? (
          list.map((item) => (
            <li
              key={item._id}
              // ❌ REMOVED: bg-gray-50/hover:bg-gray-100. Use clean border and brighter hover.
              className="flex justify-between items-center p-3 border rounded-lg border-gray-300 hover:border-indigo-500 transition duration-150"
            >
              {editId === item._id ? (
                // A. এডিট মোড
                <div className="flex-1 mr-4">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    // 🚀 MODERNIZE: Clear focus styling
                    className="w-full p-2 border-indigo-400 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 focus:ring-1"
                  />
                </div>
              ) : (
                // B. ডিসপ্লে মোড
                <span className="font-medium text-gray-800 flex-1 flex flex-wrap items-center space-x-2">
                  <span className="text-base font-semibold">{item.name}</span>

                  {/* 🚀 MODERNIZE: Info Tags/Pills for additional data */}
                  {item.level && (
                    <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      Level: {item.level}
                    </span>
                  )}
                  {item.code && (
                    <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                      Code: {item.code}
                    </span>
                  )}
                  {item.category && (
                    <span className="text-xs font-semibold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full flex items-center">
                      <FaTag className="w-2.5 h-2.5 mr-1" />
                      {item.category}
                    </span>
                  )}
                </span>
              )}

              {/* অ্যাকশন বাটন */}
              <div className="flex space-x-2">
                {editId === item._id ? (
                  <>
                    <button
                      onClick={() => handleUpdate(item._id)}
                      // 🚀 MODERNIZE: Strong Save Button
                      className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                      title="Save Changes"
                    >
                      <FaSave />
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      // 🚀 MODERNIZE: Neutral Cancel Button
                      className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
                      title="Cancel Edit"
                    >
                      <FaTimes />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(item)}
                      // 🚀 MODERNIZE: Warning/Edit Button
                      className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      // 🚀 MODERNIZE: Danger/Delete Button
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))
        ) : (
          <p className="text-center text-gray-500 italic p-4 border rounded-lg border-gray-300">
            No {type} entries found. Please add a new one.
          </p>
        )}
      </ul>
    </div>
  );
};

export default MasterList;

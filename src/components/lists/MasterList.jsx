import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaSave,
  FaTimes,
  FaTag,
  FaDatabase,
  FaCheck,
  FaFingerprint,
} from "react-icons/fa";
import {
  getMasterDataList,
  deleteMasterData,
  updateMasterData,
} from "../../api/apiService";

const getTitles = (type) => {
  switch (type) {
    case "branch":
      return { header: "Campus Infrastructure", column: "Branch" };
    case "class":
      return { header: "Academic Cohorts", column: "Class" };
    case "subject":
      return { header: "Curriculum Matrix", column: "Subject" };
    case "responsibility":
      return { header: "Duty Protocols", column: "Type" };
    default:
      return { header: "System Records", column: "Name" };
  }
};

const MasterList = ({ type, refreshTrigger }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  const titles = getTitles(type);

  useEffect(() => {
    const fetchList = async () => {
      setLoading(true);
      try {
        const { data } = await getMasterDataList(type);
        setList(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(`Failed to sync ${type} matrix.`);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [type, refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm(`Permanently remove this ${titles.column}?`)) return;
    try {
      await deleteMasterData(type, id);
      toast.success("Record deleted.");
      setList(list.filter((item) => item._id !== id));
    } catch (error) {
      toast.error("Deletion failed. Check dependencies.");
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return toast.error("Name required.");
    try {
      const currentItem = list.find((item) => item._id === id);
      const updatePayload = {
        name: editName,
        ...(type === "responsibility" && { category: currentItem.category }),
        ...(type === "class" && { level: currentItem.level }),
        ...(type === "subject" && { code: currentItem.code }),
      };
      const { data } = await updateMasterData(type, id, updatePayload);
      toast.success("Protocol updated.");
      setList(list.map((item) => (item._id === id ? data : item)));
      setEditId(null);
    } catch (error) {
      toast.error("Sync failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
        <FaSyncAlt className="animate-spin text-4xl text-indigo-500/30 mb-4" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
          Indexing Matrix...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-4">
          <div className="h-10 w-1 bg-indigo-600 rounded-full"></div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
            {titles.header} ({list.length})
          </h2>
        </div>
        <FaDatabase className="text-slate-100 text-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {list.length > 0 ? (
          list.map((item) => (
            <div
              key={item._id}
              className={`group relative p-5 bg-white rounded-[1.8rem] border transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:-translate-y-1 ${
                editId === item._id
                  ? "border-indigo-500 ring-4 ring-indigo-50 shadow-xl"
                  : "border-slate-100"
              }`}
            >
              {editId === item._id ? (
                <div className="flex items-center gap-3 animate-in zoom-in-95 duration-300">
                  <input
                    type="text"
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    onClick={() => handleUpdate(item._id)}
                    className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                  >
                    <FaCheck size={14} />
                  </button>
                  <button
                    onClick={() => setEditId(null)}
                    className="h-10 w-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <FaFingerprint className="text-indigo-100 group-hover:text-indigo-500 transition-colors" />
                      <span className="text-sm font-black text-slate-800 uppercase tracking-tight">
                        {item.name}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 ml-7">
                      {item.level && (
                        <span className="text-[9px] font-black px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg uppercase border border-blue-100">
                          Lvl: {item.level}
                        </span>
                      )}
                      {item.code && (
                        <span className="text-[9px] font-black px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg uppercase border border-indigo-100">
                          ID: {item.code}
                        </span>
                      )}
                      {item.category && (
                        <span className="text-[9px] font-black px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg uppercase border border-purple-100 flex items-center gap-1">
                          <FaTag size={8} /> {item.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                    <button
                      onClick={() => {
                        setEditId(item._id);
                        setEditName(item.name);
                      }}
                      className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center justify-center transition-all"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="h-9 w-9 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl flex items-center justify-center transition-all"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="md:col-span-2 py-20 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center grayscale opacity-40">
            <FaDatabase size={40} className="mb-4" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              No Archival Records Found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterList;

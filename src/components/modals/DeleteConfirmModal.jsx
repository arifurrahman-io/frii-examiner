import React from "react";
import { FaTrashAlt, FaSyncAlt } from "react-icons/fa";

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  teacherName,
  onConfirm,
  loading,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-500"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-[3rem] shadow-[0_32px_128px_rgba(0,0,0,0.18)] border border-rose-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 to-pink-600"></div>
        <div className="p-10 flex flex-col items-center text-center">
          <div className="h-20 w-20 bg-rose-50 rounded-[1.5rem] flex items-center justify-center text-rose-500 mb-8 shadow-inner transition-transform hover:rotate-12">
            <FaTrashAlt size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-4">
            Confirm Node Purge?
          </h2>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-10">
            This action will permanently delete{" "}
            <span className="text-rose-600">[{teacherName}]</span> and purge all
            associated data.
          </p>
          <div className="flex w-full gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all"
            >
              Abort
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <FaSyncAlt className="animate-spin" />
              ) : (
                "Confirm Purge"
              )}
            </button>
          </div>
        </div>
        <div className="px-10 py-5 bg-rose-50/50 border-t border-rose-100 flex items-center justify-center">
          <p className="text-[8px] font-black text-rose-300 uppercase tracking-[0.5em]">
            Critical Admin Authorization Required
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;

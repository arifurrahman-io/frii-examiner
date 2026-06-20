import React, { useState } from "react";
import { FaCheckCircle, FaChevronDown } from "react-icons/fa";

const MultiSelectDropdown = ({
  label,
  items = [],
  selectedIds = [],
  onToggle,
  onSelectAll,
  onClear,
  placeholder = "Select options",
  allLabel = "All selected",
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCount = selectedIds.length;
  const allSelected = items.length > 0 && selectedCount === items.length;
  const selectedItems = items.filter((item) => selectedIds.includes(item._id));
  const summaryText = allSelected
    ? allLabel
    : selectedCount
    ? `${selectedCount} selected`
    : placeholder;

  return (
    <div className="relative space-y-1.5">
      {label && (
        <p className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </p>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className={`flex min-h-[48px] w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2.5 text-left transition-colors ${
          isOpen
            ? "border-slate-700 ring-2 ring-slate-200"
            : "border-gray-300 hover:border-slate-400"
        }`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`truncate text-sm font-semibold ${
                selectedCount ? "text-slate-900" : "text-slate-500"
              }`}
            >
              {summaryText}
            </span>
            {selectedCount > 0 && !allSelected && (
              <span className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">
                {selectedCount}
              </span>
            )}
          </div>
          {selectedCount > 0 && !allSelected && (
            <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
              {selectedItems
                .slice(0, 2)
                .map((item) => item.name)
                .join(", ")}
              {selectedCount > 2 ? ` +${selectedCount - 2}` : ""}
            </p>
          )}
        </div>
        <FaChevronDown className="flex-none text-xs text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-[70] mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <span className="text-xs font-semibold text-slate-500">
              {summaryText}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSelectAll}
                className="rounded-md px-2 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50"
              >
                All
              </button>
              <button
                type="button"
                onClick={onClear}
                className="rounded-md px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="grid max-h-56 grid-cols-1 gap-1.5 overflow-y-auto p-2 sm:grid-cols-2">
            {items.map((item) => {
              const isSelected = selectedIds.includes(item._id);
              return (
                <button
                  type="button"
                  key={item._id}
                  onClick={() => onToggle(item._id)}
                  className={`flex min-w-0 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                    isSelected
                      ? "border-teal-200 bg-teal-50 text-teal-800"
                      : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  <span className="truncate text-xs font-semibold">
                    {item.name}
                  </span>
                  <span
                    className={`grid h-5 w-5 flex-none place-items-center rounded-md border ${
                      isSelected
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-slate-200 bg-white text-transparent"
                    }`}
                  >
                    <FaCheckCircle size={10} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;

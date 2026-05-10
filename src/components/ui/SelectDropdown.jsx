import React from "react";
import { FaChevronDown, FaExclamationCircle } from "react-icons/fa";

/**
 * Reusable Select Dropdown Component
 *
 * @param {string} label - Label for the dropdown (optional).
 * @param {string} name - HTML name attribute for form data.
 * @param {string} value - Current selected value (typically an ObjectId).
 * @param {function} onChange - Change handler function.
 * @param {string} placeholder - Default text to display when nothing is selected.
 * @param {Array<Object>} options - Array of objects to populate the dropdown [{_id: '123', name: 'Option Name'}].
 * @param {string} error - Error message string (if any validation error occurs).
 * @param {boolean} required - HTML required attribute.
 * @param {string} className - Additional custom Tailwind CSS classes.
 */
const SelectDropdown = ({
  label,
  name,
  value,
  onChange,
  placeholder = "Select an option",
  options = [],
  error,
  required = false,
  className = "",
  ...props
}) => {
  // 💡 MODERN STYLING: Clean, border-focused design with prominent focus ring.
  const baseStyle =
    "w-full px-3 py-2.5 rounded-lg bg-white appearance-none transition-colors duration-150 cursor-pointer text-sm text-slate-800 shadow-none";

  const defaultStyle =
    "border border-slate-300 focus:border-slate-700 focus:ring-2 focus:ring-slate-200 focus:outline-none";

  const errorStyle = error
    ? "border-rose-500 ring-4 ring-rose-100"
    : defaultStyle;

  const disabledStyle = props.disabled
    ? "bg-slate-100 cursor-not-allowed opacity-80"
    : "";

  const finalClassName = `${baseStyle} ${errorStyle} ${disabledStyle}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* ১. লেবেল */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-slate-700"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* ২. সিলেক্ট ফিল্ড কন্টেইনার */}
      <div className="relative">
        {/* সিলেক্ট ফিল্ড */}
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={finalClassName}
          {...props}
        >
          {/* প্লেসহোল্ডার অপশন */}
          <option value="" disabled hidden>
            {placeholder}
          </option>

          {/* ডায়নামিক অপশনস */}
          {options.map((option) => (
            <option key={option._id} value={option._id}>
              {option.name}
              {option.teacherId && ` (${option.teacherId})`}{" "}
              {/* শিক্ষকের জন্য আইডি দেখানো */}
            </option>
          ))}
        </select>

        {/* কাস্টম Chevron আইকন (ডিফল্ট সিস্টেম মেনু লুকানোর জন্য) */}
        <FaChevronDown
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${
            error ? "text-rose-500" : "text-slate-400"
          }`}
        />

        {/* ত্রুটির আইকন (যদি error থাকে) */}
        {error && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <FaExclamationCircle className="text-rose-500" />
          </div>
        )}
      </div>

      {/* ৩. ত্রুটির বার্তা */}
      {error && (
        <p className="mt-1 text-xs text-rose-600 flex items-center">{error}</p>
      )}
    </div>
  );
};

export default SelectDropdown;

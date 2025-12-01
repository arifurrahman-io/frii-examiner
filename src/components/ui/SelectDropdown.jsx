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
    "w-full p-3 rounded-lg bg-white appearance-none transition duration-150 cursor-pointer text-gray-800";

  const defaultStyle =
    "border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none";

  const errorStyle = error
    ? "border-red-500 ring-2 ring-red-500" // Use ring for visible error highlight
    : defaultStyle;

  const disabledStyle = props.disabled
    ? "bg-gray-100 cursor-not-allowed opacity-80"
    : "";

  const finalClassName = `${baseStyle} ${errorStyle} ${disabledStyle}`;

  return (
    <div className={`space-y-1 ${className}`}>
      {/* ১. লেবেল */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
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
            error ? "text-red-500" : "text-gray-400"
          }`}
        />

        {/* ত্রুটির আইকন (যদি error থাকে) */}
        {error && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <FaExclamationCircle className="text-red-500" />
          </div>
        )}
      </div>

      {/* ৩. ত্রুটির বার্তা */}
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center">{error}</p>
      )}
    </div>
  );
};

export default SelectDropdown;

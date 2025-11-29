import React from "react";
import { FaExclamationCircle } from "react-icons/fa";

/**
 * Reusable Input Field Component
 *
 * @param {string} label - Label for the input field (optional).
 * @param {string} type - Input type (e.g., 'text', 'password', 'number').
 * @param {string} placeholder - Placeholder text.
 * @param {ReactNode} icon - Icon component to display inside the input (e.g., <FaUser />).
 * @param {string} name - HTML name attribute for form data.
 * @param {string} value - Current value of the input.
 * @param {function} onChange - Change handler function.
 * @param {string} error - Error message string (if any validation error occurs).
 * @param {string} className - Additional custom Tailwind CSS classes.
 * @param {boolean} required - HTML required attribute.
 */
const InputField = ({
  label,
  type = "text",
  placeholder,
  icon: Icon,
  name,
  value,
  onChange,
  error,
  className = "",
  required = false,
  ...props
}) => {
  // ত্রুটি থাকলে ইনপুট স্টাইল পরিবর্তন
  const inputBaseStyle =
    "w-full p-3 rounded-lg focus:outline-none transition duration-150";
  const inputStyle = error
    ? "border-2 border-red-500 focus:ring-red-500 focus:border-red-500 pr-10" // ত্রুটির জন্য লাল বর্ডার ও প্যাডিং
    : "border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"; // সাধারণ নীল বর্ডার

  // আইকন থাকলে বাম দিকে অতিরিক্ত প্যাডিং
  const paddingLeft = Icon ? "pl-10" : "pl-4";

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

      {/* ২. ইনপুট ও আইকন কন্টেইনার */}
      <div className="relative">
        {/* আইকন (যদি থাকে) */}
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {/* আইকনের রং পরিবর্তন */}
            <Icon className={`text-gray-400 ${error ? "text-red-500" : ""}`} />
          </div>
        )}

        {/* ইনপুট ফিল্ড */}
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`${inputBaseStyle} ${inputStyle} ${paddingLeft} ${
            error ? "pr-10" : ""
          }`}
          {...props}
        />

        {/* ত্রুটির আইকন (যদি error থাকে) */}
        {error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
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

export default InputField;

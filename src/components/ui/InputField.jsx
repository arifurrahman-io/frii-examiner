import React, { useState } from "react";
import { FaExclamationCircle, FaEye, FaEyeSlash } from "react-icons/fa";

/**
 * Enhanced Reusable Input Field Component
 * Features: Password visibility toggle, dynamic icon coloring, and detailed error states.
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
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";

  // dynamic styling based on error state
  const inputBaseStyle =
    "w-full p-3 rounded-xl outline-none transition-all duration-200 border-2 shadow-sm";

  const inputStyle = error
    ? "border-red-500 bg-red-50 focus:ring-4 focus:ring-red-100"
    : "border-gray-200 bg-gray-50 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100";

  // Handle padding for icons and the password toggle
  const paddingLeft = Icon ? "pl-11" : "pl-4";
  const paddingRight = error || isPasswordType ? "pr-12" : "pr-4";

  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      {/* 1. Label with Red Asterisk */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-bold text-gray-700 ml-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* 2. Input Container */}
      <div className="relative group">
        {/* Left Side Icon (Dynamic color on focus) */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <Icon
              className={`text-lg transition-colors duration-200 ${
                error
                  ? "text-red-500"
                  : "text-gray-400 group-focus-within:text-indigo-600"
              }`}
            />
          </div>
        )}

        {/* Input Field */}
        <input
          id={name}
          // Dynamically change type between 'password' and 'text'
          type={isPasswordType && showPassword ? "text" : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`${inputBaseStyle} ${inputStyle} ${paddingLeft} ${paddingRight}`}
          {...props}
        />

        {/* Right Side Icons (Error Icon or Password Toggle) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          {error && (
            <FaExclamationCircle className="text-red-500 text-lg animate-pulse" />
          )}

          {isPasswordType && !error && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-indigo-600 focus:outline-none transition-colors p-1"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          )}
        </div>
      </div>

      {/* 3. Error Message Section */}
      <div className="min-h-[20px] ml-1">
        {error && (
          <p className="text-xs font-semibold text-red-600 flex items-center animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default InputField;

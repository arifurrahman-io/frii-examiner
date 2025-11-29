import React from "react";
import { FaSyncAlt } from "react-icons/fa";

/**
 * Reusable Button Component
 *
 * @param {string} children - Button text or content.
 * @param {string} variant - 'primary', 'secondary', 'danger', 'success'. Defines color scheme.
 * @param {boolean} fullWidth - If true, button takes 100% width.
 * @param {boolean} disabled - Disables the button and changes appearance.
 * @param {boolean} loading - Displays a spinner and disables the button.
 * @param {string} type - 'submit' or 'button'.
 * @param {function} onClick - Click handler function.
 * @param {string} className - Additional custom Tailwind CSS classes.
 */
const Button = ({
  children,
  variant = "primary", // Default style
  fullWidth = false,
  disabled = false,
  loading = false,
  type = "button",
  onClick,
  className = "",
  ...props
}) => {
  // ১. ভেরিয়েন্ট অনুযায়ী স্টাইল সেট করা
  const baseStyle =
    "flex items-center justify-center p-3 rounded-lg font-semibold transition duration-200 focus:outline-none focus:ring-4";

  let variantStyle = "";

  switch (variant) {
    case "secondary":
      variantStyle =
        "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400";
      break;
    case "danger":
      variantStyle =
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-300";
      break;
    case "success":
      variantStyle =
        "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-300";
      break;
    case "primary": // Default
    default:
      variantStyle =
        "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-300";
      break;
  }

  // ২. লোডিং এবং ডিসেবল্ড স্টেট হ্যান্ডেল করা
  const isDisabled = disabled || loading;
  const disabledStyle = isDisabled ? "opacity-50 cursor-not-allowed" : "";

  // ৩. ফাইনাল ক্লাস একত্রিত করা
  const finalClassName = `${baseStyle} ${variantStyle} ${
    fullWidth ? "w-full" : ""
  } ${disabledStyle} ${className}`;

  return (
    <button
      type={type}
      className={finalClassName}
      onClick={onClick}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        // লোডিং স্পিনার (FaSyncAlt)
        <>
          <FaSyncAlt className="animate-spin mr-2" />
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;

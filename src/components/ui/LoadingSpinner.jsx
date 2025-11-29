import React from "react";
import { FaSyncAlt } from "react-icons/fa";

/**
 * Reusable Loading Spinner Component
 *
 * @param {string} message - Optional text message displayed below the spinner (e.g., "Loading data...").
 * @param {string} size - Tailwind CSS text size class (e.g., 'text-xl', 'text-4xl').
 * @param {string} color - Tailwind CSS text color class (e.g., 'text-indigo-500', 'text-gray-600').
 */
const LoadingSpinner = ({
  message = "Loading...",
  size = "text-3xl",
  color = "text-indigo-600",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* ১. স্পিনার আইকন */}
      <FaSyncAlt
        className={`animate-spin ${size} ${color}`}
        aria-label="Loading content"
      />

      {/* ২. বার্তা (ঐচ্ছিক) */}
      <p className="mt-4 text-sm font-medium text-gray-600">{message}</p>
    </div>
  );
};

export default LoadingSpinner;

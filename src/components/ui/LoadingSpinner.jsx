import React from "react";
import { FaSyncAlt } from "react-icons/fa";

/**
 * Reusable Loading Spinner Component (Modern Design)
 *
 * @param {string} message - Optional text message displayed below the spinner (e.g., "Loading data...").
 * @param {string} size - Tailwind CSS text size class (e.g., 'text-xl', 'text-5xl').
 * @param {string} color - Tailwind CSS text color class (e.g., 'text-indigo-700').
 */
const LoadingSpinner = ({
  message = "Loading...",
  size = "text-5xl", // Default is now larger for prominence
  color = "text-indigo-700", // Default is a deeper, more professional indigo
}) => {
  return (
    // Increased vertical padding (py-16) for a central, focused display area
    <div className="flex flex-col items-center justify-center py-16 w-full">
      {/* 1. Spinner Icon: Larger, prominent color, maintaining spin animation */}
      <FaSyncAlt
        className={`animate-spin ${size} ${color} opacity-90`}
        aria-label="Loading content"
      />

      {/* 2. Message: Larger font, semi-bold text, and increased vertical gap */}
      <p className="mt-5 text-xl font-semibold text-gray-700">{message}</p>
    </div>
  );
};

export default LoadingSpinner;

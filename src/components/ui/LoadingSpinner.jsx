import React from "react";

const LoadingSpinner = ({
  size = "h-12 w-12",
  color = "border-emerald-600",
  message = "Loading...",
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 w-full">
      {/* --- Circular Spinner --- */}
      <div className="relative">
        {/* Static Background Ring */}
        <div className={`${size} rounded-full border-4 border-emerald-100`} />

        {/* Animated Spinning Ring (image_d0d747 style) */}
        <div
          className={`absolute top-0 left-0 ${size} rounded-full border-4 border-transparent ${color} border-t-transparent animate-spin`}
        ></div>
      </div>

      {/* --- Status Message --- */}
      {message && (
        <p className="mt-4 text-xs font-semibold text-slate-400">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;

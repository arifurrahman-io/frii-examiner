import React from "react";

const LoadingSpinner = ({
  size = "h-12 w-12",
  color = "border-cyan-500",
  message = "Loading...",
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 w-full">
      {/* --- Circular Spinner --- */}
      <div className="relative">
        {/* Static Background Ring */}
        <div
          className={`${size} rounded-full border-4 border-cyan-100/30`}
        ></div>

        {/* Animated Spinning Ring (image_d0d747 style) */}
        <div
          className={`absolute top-0 left-0 ${size} rounded-full border-4 border-transparent ${color} border-t-transparent animate-spin shadow-[0_0_15px_rgba(6,182,212,0.2)]`}
        ></div>
      </div>

      {/* --- Status Message --- */}
      {message && (
        <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;

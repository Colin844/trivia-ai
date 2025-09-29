import React from "react";

const LoadingOverlay = ({
  loading,
  text = "Loading...",
  transparent = false,
}) => {
  if (!loading) return null;
  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center ${
        transparent ? "bg-transparent" : "bg-black bg-opacity-40"
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        <span className="text-black text-lg font-semibold drop-shadow">
          {text}
        </span>
      </div>
    </div>
  );
};

export default LoadingOverlay;

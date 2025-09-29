// components/Toggle.jsx
import React from "react";

export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <span className="text-sm font-medium">{label}</span>
      <span className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors" />
        <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5 shadow" />
      </span>
      <span
        className={
          "text-xs px-2 py-0.5 rounded " +
          (checked ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")
        }
      >
        {checked ? "Online" : "Offline"}
      </span>
    </label>
  );
}

"use client";

export default function Textarea({ label, error, className = "", ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-300 mb-2 ml-1 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        className={`w-full min-h-30 px-4 py-3 bg-slate-900 border rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-y ${
          error ? "border-red-500" : "border-slate-700 focus:border-blue-500"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 ml-1 text-xs text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
}
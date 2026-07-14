export default function Select({ label, options = [], className = "", ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-300 mb-2 ml-1 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        className={`w-full h-12 px-4 bg-slate-900 border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-blue-500 appearance-none cursor-pointer ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
export default function StatCard({ title, value, icon, trend }) {
  // trend objesi örneği: { label: "+12% bu ay", isPositive: true }
  return (
    <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 hover:bg-slate-800/60 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-black text-white">{value}</h3>
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend.label}
            </p>
          )}
        </div>
        {/* İkon Alanı */}
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
          {icon}
        </div>
      </div>
    </div>
  );
}
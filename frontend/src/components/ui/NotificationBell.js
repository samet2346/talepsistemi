export default function NotificationBell({ count = 0, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      
      {/* Okunmamış bildirim varsa kırmızı badge göster */}
      {count > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-slate-900 animate-pulse">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}
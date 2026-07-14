"use client";
import Link from "next/link";

export default function NotificationDropdown({ notifications, onClose }) {
  return (
    <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <h3 className="text-white font-bold text-sm">Bildirimler</h3>
        <button onClick={onClose} className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider">Tümünü Oku</button>
      </div>

      <div className="max-h-87.5 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500 text-xs">Henüz yeni bir bildirim yok.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <Link 
              key={notif.id} 
              href={notif.link}
              onClick={onClose}
              className="flex items-start gap-3 p-4 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors"
            >
              <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${notif.isRead ? 'bg-transparent' : 'bg-blue-500'}`}></div>
              <div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  <span className="font-bold text-white">{notif.title}</span> {notif.message}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">{notif.time}</p>
              </div>
            </Link>
          ))
        )}
      </div>

      <Link 
        href="/bildirimler" 
        onClick={onClose}
        className="block p-3 text-center bg-slate-800/30 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-all"
      >
        Tüm Bildirimleri Gör
      </Link>
    </div>
  );
}
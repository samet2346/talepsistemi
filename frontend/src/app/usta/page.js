"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import api from "@/lib/api";

const buildStats = (bids) => {
  const pending = bids.filter((b) => b.status === "PENDING");
  const accepted = bids.filter((b) => b.status === "ACCEPTED");
  const totalEarnings = accepted.reduce((sum, b) => sum + parseFloat(b.price || 0), 0);

  return [
    {
      title: "Aktif Teklifler",
      value: String(pending.length),
      trend: String(pending.length),
      trendLabel: "Beklemede",
      icon: "📝",
      colorClass: "text-blue-600 bg-blue-50 border-blue-100",
      trendClass: "text-blue-600 bg-blue-100",
    },
    {
      title: "Kazanılan İşler",
      value: String(accepted.length),
      trend: String(accepted.length),
      trendLabel: "Kabul edilen",
      icon: "🤝",
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
      trendClass: "text-emerald-600 bg-emerald-100",
    },
    {
      title: "Toplam Kazanç",
      value: `${totalEarnings.toLocaleString("tr-TR")} ₺`,
      trend: accepted.length > 0 ? `${accepted.length} iş` : "—",
      trendLabel: "Kabul edilen",
      icon: "💰",
      colorClass: "text-amber-600 bg-amber-50 border-amber-100",
      trendClass: "text-amber-600 bg-amber-100",
    },
  ];
};

const NOTIFICATION_ICONS = {
  OFFER: "🎉",
  JOB_STATUS: "👀",
  REVIEW: "⭐",
  SYSTEM: "🔔",
};

export default function UstaPanel() {
  const [stats, setStats] = useState(buildStats([]));
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [bidsRes, notifRes] = await Promise.all([
          api.get("/jobs/requests/my-bids/"),
          api.get("/notifications/"),
        ]);

        const bids = bidsRes.data?.results || bidsRes.data || [];
        setStats(buildStats(bids));

        const notifList = notifRes.data?.results || notifRes.data || [];
        setNotifications(notifList.slice(0, 5));
      } catch (err) {
        console.error("Usta paneli verileri yüklenemedi:", err);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          body {
              background-image: radial-gradient(circle at 50% 0%, #FDFBF7 0%, #FAF7F2 60%, #F5F1EA 100%);
              background-attachment: fixed;
              background-color: #FAF7F2;
          }
        `
      }} />

      <div className="min-h-screen py-10 font-sans relative selection:bg-emerald-500/20 selection:text-emerald-700">
        
        {/* ARKA PLAN EFEKTLERİ */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-400 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-300 rounded-full blur-[120px] opacity-20"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10 md:pt-4">
          
          <BackButton className="mb-8 text-slate-500 hover:text-emerald-500 transition-colors" />

          {/* KARŞILAMA VE BAŞLIK ALANI */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs mb-2">Kontrol Merkezi</p>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Hoş Geldin, <span className="text-emerald-500">Usta!</span> 👋
              </h1>
              <p className="text-slate-500 mt-2 font-medium">İşlerini, tekliflerini ve kazançlarını buradan yönetebilirsin.</p>
            </div>
            
            <Link href="/usta/talepler">
              <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Yeni İş Bul
              </button>
            </Link>
          </div>

          {/* İSTATİSTİK KARTLARI GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.08)] transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border ${stat.colorClass} group-hover:scale-110 transition-transform`}>
                    {stat.icon}
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${stat.trendClass}`}>
                      {stat.trend}
                    </span>
                    <p className="text-xs text-slate-400 font-bold mt-1">{stat.trendLabel}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.title}</p>
                  <p className="text-3xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* SOL KOLON: Hızlı İşlemler */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.05)]">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Hızlı İşlemler</h3>
                
                <div className="space-y-3">
                  <Link href="/usta/tekliflerim" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-500 font-bold">📄</span>
                      <span className="text-slate-700 font-bold group-hover:text-emerald-700 transition-colors">Verdiğim Teklifler</span>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>

                  <Link href="/usta/profil" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-500 font-bold">👤</span>
                      <span className="text-slate-700 font-bold group-hover:text-emerald-700 transition-colors">Profili Düzenle</span>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>

                  <Link href="/usta/ayarlar" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-bold">⚙️</span>
                      <span className="text-slate-700 font-bold group-hover:text-emerald-700 transition-colors">Ayarlar</span>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* SAĞ KOLON: Bilgilendirme ve Son Aktiviteler */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-emerald-500 rounded-[2.5rem] p-8 md:p-10 text-white shadow-lg shadow-emerald-500/25 relative overflow-hidden flex flex-col justify-center min-h-50">
                
                {/* Dekoratif Arka Plan Çemberleri */}
                <div className="absolute -top-12.5 -right-12.5 w-40 h-40 bg-emerald-400 rounded-full opacity-50 blur-2xl"></div>
                <div className="absolute -bottom-12.5 -left-5 w-32 h-32 bg-emerald-600 rounded-full opacity-50 blur-xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-white/20 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">Sistem İpucu</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Profilini Güçlü Tut, İşleri Kap!</h3>
                  <p className="text-emerald-50 font-medium leading-relaxed max-w-lg">
                    Müşteriler teklifleri değerlendirirken profil fotoğraflarına ve geçmiş iş örneklerine (portfolyo) büyük önem verir. Şansını artırmak için profilini güncel tut.
                  </p>
                </div>
              </div>

              {/* Son Aktiviteler (Mockup) */}
              <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.05)]">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Son Bildirimler</h3>
                <div className="space-y-4">
                  {notifications.map((notification, idx) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-4 p-4 rounded-2xl border border-slate-100 ${idx % 2 === 0 ? "bg-slate-50" : "bg-white"}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${idx % 2 === 0 ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"}`}>
                        {NOTIFICATION_ICONS[notification.notification_type] || "🔔"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{notification.title}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          {notification.body}{notification.timesince ? ` - ${notification.timesince}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
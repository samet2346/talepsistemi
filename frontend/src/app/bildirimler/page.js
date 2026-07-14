"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';
import Spinner from '@/components/ui/Spinner';
import { notificationService } from '@/services/notificationService';

// API'deki NotificationTypeEnum: OFFER | JOB_STATUS | REVIEW | SYSTEM
const ICON_MAP = {
  OFFER: 'local_offer',
  JOB_STATUS: 'task_alt',
  REVIEW: 'star',
  SYSTEM: 'notifications',
};

export default function BildirimlerSayfasi() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // GET /api/v1/notifications/  -> PaginatedNotificationList { results: [...] }
        const response = await notificationService.getNotifications();
        const list = response?.results || response?.data?.results || response || [];
        setNotifications(Array.isArray(list) ? list : []);
        setError("");
      } catch (err) {
        console.error("Bildirimler alınamadı:", err);
        setNotifications([]);
        setError("Bildirimler yüklenemedi. Lütfen sayfayı yenileyin.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // POST /api/v1/notifications/{id}/mark_as_read/
  const markAsRead = async (id) => {
    // Önce UI'ı optimistic güncelle, API hata verirse geri al
    setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, is_read: true } : notif));
    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error("İşaretleme hatası", err);
      setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, is_read: false } : notif));
    }
  };

  // POST /api/v1/notifications/mark_all_as_read/
  const markAllAsRead = async () => {
    const previous = notifications;
    setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error("Tümünü işaretleme hatası", err);
      setNotifications(previous);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center">
        <Spinner className="w-12 h-12 border-emerald-500 mb-4" />
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          body { background-color: #FAF7F2; }
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        `
      }} />

      <div className="min-h-screen py-10 px-4 font-sans selection:bg-emerald-500/20 selection:text-emerald-700 relative">
        <BackButton className="absolute top-6 left-6 md:top-10 md:left-10 z-50 text-slate-500 hover:text-emerald-500 transition-colors" />

        <div className="max-w-3xl mx-auto pt-16 md:pt-10">

          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                Bildirimler
                {unreadCount > 0 && (
                  <span className="bg-emerald-500 text-white text-sm font-black px-3 py-1 rounded-full shadow-sm animate-pulse">
                    {unreadCount} Yeni
                  </span>
                )}
              </h1>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-emerald-600 font-bold hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors text-sm flex items-center gap-2 w-fit"
              >
                <span className="material-symbols-outlined text-[18px]">done_all</span>
                Tümünü Okundu İşaretle
              </button>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-2xl text-center">
              {error}
            </div>
          )}

          <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
            {notifications.length === 0 ? (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">notifications_off</span>
                <h3 className="text-lg font-bold text-slate-700">Henüz bildiriminiz yok</h3>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                    className={`p-6 md:p-8 transition-colors flex gap-4 md:gap-6 cursor-pointer ${notification.is_read ? 'bg-white hover:bg-slate-50' : 'bg-emerald-50/30 hover:bg-emerald-50/50'}`}
                  >

                    {/* İkon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notification.is_read ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-600'}`}>
                      <span className="material-symbols-outlined">
                        {ICON_MAP[notification.notification_type] || 'notifications'}
                      </span>
                    </div>

                    {/* İçerik */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <h3 className={`font-black ${notification.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                          {notification.title}
                        </h3>
                        {/* API: "timesince" insan-okunur süre döndürür (örn. "10 dakika önce") */}
                        <span className="text-xs font-bold text-slate-400 whitespace-nowrap">{notification.timesince}</span>
                      </div>
                      <p className={`text-sm ${notification.is_read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                        {notification.body}
                      </p>
                    </div>

                    {/* Okunmamış Noktası */}
                    {!notification.is_read && (
                      <div className="w-3 h-3 bg-emerald-500 rounded-full shrink-0 mt-2"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
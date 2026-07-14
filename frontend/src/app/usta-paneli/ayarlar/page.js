"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import Spinner from "@/components/ui/Spinner";
// import api from '@/services/api'; // API bağlantısı için

export default function UstaAyarlar() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Tüm ayarları tek bir state objesinde tutmak API istekleri için en sağlıklısıdır
  const [settings, setSettings] = useState({
    sms_notifications: false,
    email_notifications: false,
    push_notifications: false,
    profile_visible: false,
    vacation_mode: false,
  });

  // Komponent yüklendiğinde mevcut ayarları çek (API Simülasyonu)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // const response = await api.get('/accounts/me/settings/');
        // setSettings(response.data);
        
        // BACKEND BYPASS
        setTimeout(() => {
          setSettings({
            sms_notifications: true,
            email_notifications: true,
            push_notifications: true,
            profile_visible: true,
            vacation_mode: false,
          });
          setLoading(false);
        }, 600);
      } catch (error) {
        console.error("Ayarlar çekilemedi", error);
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      // await api.patch('/accounts/me/settings/', settings);
      
      // BACKEND BYPASS
      setTimeout(() => {
        setMessage({ type: 'success', text: 'Ayarlarınız başarıyla kaydedildi.' });
        setSaving(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      }, 800);
    } catch (error) {
      setMessage({ type: 'error', text: 'Ayarlar kaydedilirken bir hata oluştu.' });
      setSaving(false);
    }
  };

  // Reusable Toggle Komponenti (Temiz kod için)
  const ToggleSwitch = ({ checked, onChange }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 shadow-inner outline-none ${checked ? 'bg-emerald-500 shadow-emerald-700/30' : 'bg-slate-200 shadow-slate-300/50'}`}
    >
      <span className={`pointer-events-none inline-block h-[24px] w-[24px] transform rounded-full bg-white shadow-sm ring-0 transition duration-300 ease-in-out ${checked ? 'translate-x-[20px]' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
          body { background-color: #F8FAFC; }
        `
      }} />

      {/* MOBİL ZIRH */}
      <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden font-sans bg-slate-50 selection:bg-emerald-500/20 pb-24">

        {/* 🔥 CANLI KAPAK (HERO) 🔥 */}
        <div className="relative h-48 sm:h-56 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <BackButton className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 text-white/90 hover:text-white drop-shadow-md transition-colors" />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 -mt-16 sm:-mt-20">
          
          <div className="mb-6 sm:mb-8 text-center sm:text-left drop-shadow-md">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Usta <span className="text-emerald-200">Ayarları</span>
            </h1>
            <p className="text-emerald-50/90 text-sm font-medium mt-1">Bildirim, gizlilik ve çalışma tercihlerinizi yönetin.</p>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-2xl text-sm font-bold flex items-start gap-3 animate-in fade-in zoom-in-95 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              <span className="material-symbols-outlined text-[20px]">{message.type === 'success' ? 'check_circle' : 'error'}</span>
              <span className="mt-0.5">{message.text}</span>
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-[2rem] p-12 flex flex-col items-center justify-center shadow-xl shadow-slate-200/50 border border-slate-100">
              <Spinner className="w-10 h-10 border-emerald-500 mb-4" />
              <p className="text-emerald-600 font-bold text-sm animate-pulse">Ayarlar Yükleniyor...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* KART 1: BİLDİRİM TERCİHLERİ */}
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                  <span className="material-symbols-outlined text-amber-500">notifications_active</span>
                  <h2 className="text-lg font-bold text-slate-900">Bildirim Tercihleri</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center group">
                    <div className="pr-4">
                      <p className="text-slate-800 font-bold text-sm sm:text-base mb-1 group-hover:text-emerald-600 transition-colors">SMS Bildirimleri</p>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">Yeni iş fırsatları ve mesajlar anında telefonunuza SMS olarak gelsin.</p>
                    </div>
                    <ToggleSwitch checked={settings.sms_notifications} onChange={() => handleToggle('sms_notifications')} />
                  </div>

                  <div className="flex justify-between items-center group pt-4 border-t border-slate-50">
                    <div className="pr-4">
                      <p className="text-slate-800 font-bold text-sm sm:text-base mb-1 group-hover:text-emerald-600 transition-colors">Uygulama İçi Bildirimler</p>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">Uygulamadayken anlık bildirimleri ekranınızda görün.</p>
                    </div>
                    <ToggleSwitch checked={settings.push_notifications} onChange={() => handleToggle('push_notifications')} />
                  </div>

                  <div className="flex justify-between items-center group pt-4 border-t border-slate-50">
                    <div className="pr-4">
                      <p className="text-slate-800 font-bold text-sm sm:text-base mb-1 group-hover:text-emerald-600 transition-colors">E-Posta Bülteni</p>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">Haftalık özetler, ipuçları ve platform duyuruları mail adresinize gönderilsin.</p>
                    </div>
                    <ToggleSwitch checked={settings.email_notifications} onChange={() => handleToggle('email_notifications')} />
                  </div>
                </div>
              </div>

              {/* KART 2: ÇALIŞMA DURUMU VE GİZLİLİK */}
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                  <span className="material-symbols-outlined text-blue-500">manage_accounts</span>
                  <h2 className="text-lg font-bold text-slate-900">Çalışma Durumu</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center group">
                    <div className="pr-4">
                      <p className="text-slate-800 font-bold text-sm sm:text-base mb-1 group-hover:text-emerald-600 transition-colors">Profil Görünürlüğü</p>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">Müşteriler, "Ustalar" listesinde profilinizi görebilsin ve doğrudan size teklif atabilsin.</p>
                    </div>
                    <ToggleSwitch checked={settings.profile_visible} onChange={() => handleToggle('profile_visible')} />
                  </div>

                  <div className="flex justify-between items-center group pt-4 border-t border-slate-50">
                    <div className="pr-4">
                      <p className="text-slate-800 font-bold text-sm sm:text-base mb-1 flex items-center gap-1.5 group-hover:text-emerald-600 transition-colors">
                        Tatil Modu <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase">Yakında</span>
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">Müsaitsiz olduğunuz zamanlarda profilinizi geçici olarak gizleyin ve yeni talepleri durdurun.</p>
                    </div>
                    <ToggleSwitch checked={settings.vacation_mode} onChange={() => handleToggle('vacation_mode')} />
                  </div>
                </div>
              </div>

              {/* KART 3: HESAP YÖNETİMİ (LİNKLER) */}
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                  <span className="material-symbols-outlined text-slate-500">security</span>
                  <h2 className="text-lg font-bold text-slate-900">Hesap Güvenliği</h2>
                </div>

                <div className="space-y-3">
                  <Link href="/usta-paneli/profil" className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors group outline-none">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-700">password</span>
                      <span className="text-sm sm:text-base font-bold text-slate-700">Şifre Değiştir</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-700">chevron_right</span>
                  </Link>

                  <button className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-2xl transition-colors group outline-none">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-red-400 group-hover:text-red-600">person_remove</span>
                      <span className="text-sm sm:text-base font-bold text-red-600">Hesabımı Sil veya Dondur</span>
                    </div>
                    <span className="material-symbols-outlined text-red-400 group-hover:text-red-600">chevron_right</span>
                  </button>
                </div>
              </div>

              {/* KAYDET BUTONU */}
              <div className="pt-4 pb-8">
                <button 
                  onClick={handleSave} 
                  disabled={saving} 
                  className={`w-full h-14 sm:h-16 text-sm sm:text-base font-bold rounded-2xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 outline-none ${saving ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25'}`}
                >
                  {saving ? <Spinner className="w-6 h-6 border-white" /> : <><span className="material-symbols-outlined">save</span> Ayarları Kaydet</>}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
}
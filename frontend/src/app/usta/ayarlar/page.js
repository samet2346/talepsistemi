"use client";

import { useState } from "react";
import BackButton from "@/components/ui/BackButton";

export default function UstaAyarlar() {
  // Ayarların açık/kapalı durumunu tutan state'ler eklendi
  const [smsBildirim, setSmsBildirim] = useState(true);
  const [profilGorunur, setProfilGorunur] = useState(true);

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

      <div className="min-h-screen py-10 px-4 relative font-sans selection:bg-emerald-500/20 selection:text-emerald-700">
        
        {/* SOL ÜST GERİ DÖN BUTONU */}
        <BackButton className="absolute top-6 left-6 md:top-10 md:left-10 z-50 text-slate-500 hover:text-emerald-500 transition-colors" />

        {/* ARKA PLAN EFEKTLERİ */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-400 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-300 rounded-full blur-[120px] opacity-20"></div>
        </div>

        <div className="max-w-2xl mx-auto pt-16 md:pt-10 relative z-10">
          
          {/* BAŞLIK ALANI */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">
              Usta <span className="text-emerald-500">Ayarları</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Bildirim ve profil görünürlüğü tercihlerinizi yönetin.</p>
          </div>

          {/* AYARLAR KARTI */}
          <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.05)] space-y-8">
            
            {/* Ayar 1: SMS Bildirimleri */}
            <div 
              className="flex justify-between items-center cursor-pointer group" 
              onClick={() => setSmsBildirim(!smsBildirim)}
            >
              <div>
                <p className="text-slate-900 font-bold text-lg group-hover:text-emerald-600 transition-colors">Yeni Talep Bildirimleri</p>
                <p className="text-sm text-slate-500 font-medium">Bölgenizde iş açıldığında SMS gönderilsin.</p>
              </div>
              
              {/* Toggle Switch */}
              <div className={`h-7 w-12 rounded-full relative transition-colors duration-300 ease-in-out shrink-0 ${smsBildirim ? 'bg-emerald-500 shadow-inner shadow-emerald-700/50' : 'bg-slate-200 shadow-inner shadow-slate-300/50'}`}>
                <div className={`absolute top-1 h-5 w-5 bg-white rounded-full transition-transform duration-300 ease-in-out shadow-sm ${smsBildirim ? 'translate-x-6' : 'translate-x-1'}`}></div>
              </div>
            </div>

            {/* Ayar 2: Profil Görünürlüğü */}
            <div 
              className="flex justify-between items-center border-t border-slate-100 pt-8 cursor-pointer group" 
              onClick={() => setProfilGorunur(!profilGorunur)}
            >
              <div>
                <p className="text-slate-900 font-bold text-lg group-hover:text-emerald-600 transition-colors">Profil Görünürlüğü</p>
                <p className="text-sm text-slate-500 font-medium">Müşteriler profilinizi inceleyebilsin.</p>
              </div>
              
              {/* Toggle Switch */}
              <div className={`h-7 w-12 rounded-full relative transition-colors duration-300 ease-in-out shrink-0 ${profilGorunur ? 'bg-emerald-500 shadow-inner shadow-emerald-700/50' : 'bg-slate-200 shadow-inner shadow-slate-300/50'}`}>
                <div className={`absolute top-1 h-5 w-5 bg-white rounded-full transition-transform duration-300 ease-in-out shadow-sm ${profilGorunur ? 'translate-x-6' : 'translate-x-1'}`}></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
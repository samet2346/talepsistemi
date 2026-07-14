"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/ui/BackButton';

export default function NasilCalisir() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('musteri');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 🔥 SAYFA YÜKLENDİĞİNDE GİRİŞ DURUMUNU KONTROL ET
  useEffect(() => {
    const userStatus = localStorage.getItem("isLoggedIn");
    if (userStatus === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const musteriAdimlari = [
    { title: "Ücretsiz Talep Oluştur", desc: "İhtiyacınız olan hizmeti ve detayları belirtin. Talebiniz bölgedeki ustalarımıza anında iletilsin.", icon: "📝" },
    { title: "Teklifleri Karşılaştır", desc: "Ustaların verdiği fiyatları ve profillerini inceleyin. Açık azaltma ile en iyi fiyatı yakalayın.", icon: "⚖️" },
    { title: "Güvenle Seç", desc: "Size en uygun teklifi onaylayın. İletişim numaranız sadece seçtiğiniz ustaya görünür.", icon: "🤝" }
  ];

  const ustaAdimlari = [
    { title: "Talepleri İncele", desc: "Bölgenizdeki ve uzmanlık alanınızdaki açık iş fırsatlarını anında görüntüleyin.", icon: "🔍" },
    { title: "Teklif Ver", desc: "Müşterinin talebine uygun fiyatınızı belirleyin ve rekabetçi teklifinizi stratejik olarak iletin.", icon: "💰" },
    { title: "İşe Başla", desc: "Müşteri teklifinizi onayladığında iletişim bilgileri açılır ve işe hemen başlayabilirsiniz.", icon: "🛠️" }
  ];

  // 🔥 BUTONA TIKLANDIĞINDA ÇALIŞACAK AKILLI YÖNLENDİRME
  const handleCTAAction = () => {
    if (activeTab === 'musteri') {
      if (isLoggedIn) {
        // Müşteri ve giriş yapmışsa -> Talep Formu
        router.push('/talep');
      } else {
        // Müşteri ama giriş yapmamışsa -> Giriş Yap (Uyarı ile)
        alert("Hizmet talebi oluşturmak için lütfen önce giriş yapın veya kayıt olun.");
        router.push('/giris');
      }
    } else {
      // Usta sekmesindeyse doğrudan kayıt/giriş ekranına at (Orada 'usta' tabını seçer)
      router.push('/giris');
    }
  };

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

      <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans py-20 px-4 selection:bg-emerald-500/20 selection:text-emerald-700">
        
        {/* 📍 SAYFANIN SOL ÜST KÖŞESİNDEKİ GERİ DÖN BUTONU */}
        <BackButton className="absolute top-6 left-6 md:top-10 md:left-10 z-50 text-slate-500 hover:text-emerald-500 transition-colors" />

        {/* ARKA PLAN EFEKTLERI (Aydınlık Tema) */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
          <div className={`absolute top-[10%] left-[-5%] w-96 h-96 rounded-full blur-[120px] opacity-30 transition-colors duration-700 ${activeTab === 'musteri' ? 'bg-blue-300' : 'bg-emerald-300'}`}></div>
          <div className={`absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full blur-[120px] opacity-20 transition-colors duration-700 ${activeTab === 'musteri' ? 'bg-indigo-300' : 'bg-teal-300'}`}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 w-full">
            
          {/* Başlık */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-white text-slate-600 rounded-full text-[11px] font-bold tracking-wider uppercase mx-auto border border-gray-200 shadow-sm transition-transform hover:scale-105 cursor-default mb-6">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeTab === 'musteri' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${activeTab === 'musteri' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
              </span>
              Süreç Rehberi
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter">
              Sistem <span className={`text-transparent bg-clip-text bg-linear-to-r italic ${activeTab === 'musteri' ? 'from-blue-600 to-indigo-500' : 'from-emerald-500 to-emerald-700'}`}>Nasıl Çalışır?</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
              Platformumuz iki taraf için de adil, şeffaf ve güvenilir bir ekosistem sunar.
            </p>
          </div>

          {/* Tab Seçici (Modern Hap Tasarımı) */}
          <div className="flex justify-center mb-12">
            <div className="bg-white p-1.5 rounded-2xl flex gap-2 border border-slate-200 shadow-sm">
              <button 
                onClick={() => setActiveTab('musteri')} 
                className={`px-6 md:px-10 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'musteri' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                Hizmet Arıyorum
              </button>
              <button 
                onClick={() => setActiveTab('usta')} 
                className={`px-6 md:px-10 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'usta' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                Hizmet Veriyorum
              </button>
            </div>
          </div>

          {/* Adımlar Listesi (Beyaz Kartlar) */}
          <div className="grid gap-6 text-left relative">
            {(activeTab === 'musteri' ? musteriAdimlari : ustaAdimlari).map((adim, i) => (
              <div key={i} className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-white p-8 rounded-4xl border border-gray-100 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 group">
                
                {/* İkon Kutusu */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-transform duration-500 group-hover:scale-110 ${activeTab === 'musteri' ? 'bg-blue-50 border border-blue-100' : 'bg-emerald-50 border border-emerald-100'}`}>
                  {adim.icon}
                </div>
                
                {/* İçerik */}
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                    <span className={`text-[10px] px-3 py-1 rounded-full font-black tracking-wider uppercase border ${activeTab === 'musteri' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                      Adım {i+1}
                    </span>
                    {adim.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed text-md font-medium">{adim.desc}</p>
                </div>

              </div>
            ))}
          </div>

          {/* 🔥 ALT HIZLI EYLEM (CTA) BUTONU (GÜNCELLENDİ) 🔥 */}
          <div className="mt-12">
            <button 
              onClick={handleCTAAction}
              className={`px-10 py-5 text-lg font-bold rounded-2xl transition-all shadow-lg transform hover:-translate-y-0.5 active:scale-[0.98] w-full md:w-auto ${activeTab === 'musteri' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25'}`}
            >
              {activeTab === 'musteri' ? 'Hemen Ücretsiz Talep Oluştur' : 'Usta Olarak Sisteme Katıl'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
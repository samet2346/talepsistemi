"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';
import { jobService } from '@/services/jobService';

export default function UstaPaneli() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('firsatlar'); // 'firsatlar', 'tekliflerim', 'islerim'

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        // API dökümanına göre: GET /api/v1/jobs/requests/
        const response = await jobService.getJobs({ status: activeTab === 'firsatlar' ? 'pending' : activeTab });
        setJobs(response.results || response || []);
      } catch (error) {
        console.warn("API'den işler çekilemedi, test verisi yükleniyor...");
        
        // BACKEND BYPASS: API kapalıysa tasarımı görebilmen için sahte veri
        setTimeout(() => {
          const mockJobs = [
            { id: 101, title: "Komple Ev Boyama", category_name: "Boya Badana", district_name: "Kadıköy", description: "3+1 evimin komple boyanması gerekiyor. Malzemeler benden, sadece işçilik aranıyor.", status: "pending", created_at: "Bugün 10:30", offer_count: 2 },
            { id: 102, title: "Mutfak Su Kaçağı Acil", category_name: "Su Tesisatı", district_name: "Beşiktaş", description: "Lavabonun altındaki boru patladı, acil müdahale gerekiyor.", status: "pending", created_at: "Dün 14:15", offer_count: 0 },
            { id: 103, title: "Avize Montajı", category_name: "Elektrik", district_name: "Şişli", description: "Yeni aldığım 3 adet avizenin montajı yapılacak. Tavan alçıpandır.", status: "pending", created_at: "Dün 09:00", offer_count: 5 },
          ];
          
          if (activeTab === 'firsatlar') {
            setJobs(mockJobs);
          } else {
            setJobs([]); 
          }
          setLoading(false);
        }, 800);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [activeTab]);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
          body { background-color: #F8FAFC; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `
      }} />

      {/* MOBİL ONARIM: Zırh eklendi, yatay kayma engellendi */}
      <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden font-sans bg-slate-50 selection:bg-emerald-500/20 selection:text-emerald-700 pb-24 sm:pb-12">
        
        {/* 🔥 PREMIUM HERO (KARŞILAMA) ALANI 🔥 */}
        <div className="relative h-56 sm:h-64 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-900/20 rounded-full blur-2xl translate-y-1/4 -translate-x-1/4"></div>
          
          <BackButton className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 text-emerald-50 hover:text-white transition-colors" />
        </div>

        {/* ANA İÇERİK KAPSAYICI */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 -mt-28 sm:-mt-32">
          
          {/* 1. ÖZET VE KAZANÇ KARTI */}
          <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-200/50 p-6 sm:p-8 mb-6 border border-white flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border border-emerald-100 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Çevrimiçi
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 tracking-tight">Merhaba, {user?.first_name || 'Usta'} 👋</h1>
              <p className="text-sm sm:text-base text-slate-500 font-medium">Bölgendeki yeni fırsatları incele, hemen teklif ver.</p>
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
              <div className="flex-1 sm:flex-none text-center px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                <p className="text-2xl sm:text-3xl font-black text-emerald-600">₺0</p>
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Bu Ayki Kazanç</p>
              </div>
            </div>
          </div>

          {/* 🔥 2. HIZLI ERİŞİM MENÜSÜ (KLASÖR YAPISINA GÖRE) 🔥 */}
          <div className="flex gap-3 sm:gap-4 mb-8 overflow-x-auto pb-4 pt-2 scrollbar-hide snap-x">
            <Link href="/usta-paneli/profil" className="snap-start shrink-0 outline-none">
              <div className="flex items-center gap-3 px-5 py-3.5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <span className="font-bold text-slate-700 text-sm">Profilim</span>
              </div>
            </Link>

            <Link href="/usta-paneli/degerlendirmeler" className="snap-start shrink-0 outline-none">
              <div className="flex items-center gap-3 px-5 py-3.5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">star</span>
                </div>
                <span className="font-bold text-slate-700 text-sm">Yorumlar</span>
              </div>
            </Link>

            <Link href="/usta-paneli/ayarlar" className="snap-start shrink-0 outline-none">
              <div className="flex items-center gap-3 px-5 py-3.5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-slate-700 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                </div>
                <span className="font-bold text-slate-700 text-sm">Ayarlar</span>
              </div>
            </Link>
          </div>

          {/* 3. İŞ FİLTRELEME SEKMELERİ (TABS) */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide snap-x">
            <button 
              onClick={() => setActiveTab('firsatlar')} 
              className={`snap-start shrink-0 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all outline-none ${activeTab === 'firsatlar' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
            >
              Yeni İş Fırsatları
            </button>
            <button 
              onClick={() => setActiveTab('tekliflerim')} 
              className={`snap-start shrink-0 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all outline-none ${activeTab === 'tekliflerim' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
            >
              Verdiğim Teklifler
            </button>
            <button 
              onClick={() => setActiveTab('islerim')} 
              className={`snap-start shrink-0 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all outline-none ${activeTab === 'islerim' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
            >
              Aktif İşlerim
            </button>
          </div>

          {/* 4. İLAN LİSTESİ */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
              <Spinner className="w-10 h-10 border-emerald-500 mb-4" />
              <p className="text-emerald-600 font-bold text-sm animate-pulse">İşler Yükleniyor...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-[40px] text-slate-300">inbox</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-2">Gösterilecek İş Yok</h3>
              <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">Şu anda bulunduğun sekmeye ait bir iş kaydı bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-emerald-200 transition-all duration-300 flex flex-col group relative overflow-hidden">
                  
                  {/* Dekoratif Arka Plan */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-50 to-transparent opacity-50 -z-10 rounded-bl-full pointer-events-none"></div>

                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider">
                      {job.category_name}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 bg-white border border-slate-100 px-2 py-1 rounded-md shadow-sm">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {job.created_at}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-tight">{job.title}</h3>
                  <p className="text-slate-500 text-[13px] sm:text-sm font-medium mb-6 line-clamp-3 flex-1 leading-relaxed">{job.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-100 mb-6">
                    <div className="flex items-center gap-1.5 text-slate-600 text-sm font-bold">
                      <span className="material-symbols-outlined text-[18px] text-emerald-500">location_on</span>
                      {job.district_name}
                    </div>
                    
                    <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                      <span className="material-symbols-outlined text-[14px]">groups</span>
                      {job.offer_count} Teklif
                    </div>
                  </div>

                  {activeTab === 'firsatlar' && (
                    <Link href={`/usta-paneli/teklif-ver/${job.id}`} className="block outline-none mt-auto">
                      <button className="w-full h-14 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 outline-none">
                        Teklif Ver <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    </Link>
                  )}
                  {activeTab !== 'firsatlar' && (
                    <Link href={`/usta-paneli/teklif-ver/${job.id}`} className="block outline-none mt-auto">
                      <button className="w-full h-14 bg-slate-50 text-slate-600 text-sm font-bold rounded-2xl hover:bg-slate-100 transition-all border border-slate-200 flex items-center justify-center gap-2 outline-none">
                        Detayları Gör <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                    </Link>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
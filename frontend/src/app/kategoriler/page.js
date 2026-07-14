"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';
import Spinner from '@/components/ui/Spinner';
import { commonService } from '@/services/commonService'; 

// Türkçe karakterleri temizleyip URL uyumlu Slug üreten yardımcı fonksiyon
const generateSlug = (text) => {
  let trMap = { 'çÇ':'c', 'ğĞ':'g', 'şŞ':'s', 'üÜ':'u', 'ıİ':'i', 'öÖ':'o' };
  for(let key in trMap) {
      text = text.replace(new RegExp('['+key+']','g'), trMap[key]);
  }
  return text.toLowerCase().replace(/[^-a-zA-Z0-9\s]+/ig, '').replace(/\s/gi, "-");
};

// Kategori ismine göre otomatik dinamik ikon atayan fonksiyon
const getCategoryIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('temizlik') || n.includes('hijyen')) return 'cleaning_services';
  if (n.includes('nakliyat') || n.includes('taşıma')) return 'local_shipping';
  if (n.includes('tamir') || n.includes('tesisat')) return 'plumbing';
  if (n.includes('elektrik')) return 'electrical_services';
  if (n.includes('boya')) return 'format_paint';
  if (n.includes('montaj') || n.includes('kurulum')) return 'handyman';
  return 'home_repair_service'; // Varsayılan İkon
};

export default function KategorilerSayfasi() {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const data = await commonService.getCategoryTree();
        setTree(data || []);
      } catch (err) {
        console.warn("API Tree verisi gelmedi, test verisi...");
        // BACKEND BYPASS: Tasarımı görmek ve slug yönlendirmesini test etmek için sahte veri
        setTimeout(() => {
          setTree([
            { 
              id: 1, 
              name: "Ev Hizmetleri", 
              subcategories: [
                { id: 11, name: "Detaylı Temizlik", slug: "detayli-temizlik" }, 
                { id: 12, name: "Evden Eve Nakliyat", slug: "evden-eve-nakliyat" }
              ] 
            },
            { 
              id: 2, 
              name: "Tadilat & Tamirat", 
              subcategories: [
                { id: 21, name: "Elektrik Ustası", slug: "elektrik-ustasi" }, 
                { id: 22, name: "Su Tesisatı", slug: "su-tesisati" }, 
                { id: 23, name: "Boya Badana", slug: "boya-badana" }
              ] 
            }
          ]);
          setLoading(false);
        }, 800);
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, []);

  if (loading) return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#FAF7F2]">
      <Spinner className="w-12 h-12 border-emerald-500 mb-4" />
      <p className="text-emerald-600 font-bold animate-pulse text-sm tracking-wide uppercase">Kategoriler Yükleniyor...</p>
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        `
      }} />

      <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden py-16 sm:py-24 px-4 sm:px-6 relative font-sans selection:bg-emerald-500/20 selection:text-emerald-900 bg-[#FAF7F2]">
        
        <BackButton className="absolute top-4 left-4 sm:top-8 sm:left-8 md:top-10 md:left-10 z-50 text-slate-400 hover:text-emerald-600 transition-colors bg-white/50 backdrop-blur-md p-2 rounded-xl shadow-sm border border-slate-100" />

        {/* Premium Arka Plan Işık Efektleri */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-72 sm:w-[500px] h-72 sm:h-[500px] bg-emerald-400/20 rounded-full blur-[100px] sm:blur-[140px] mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-72 sm:w-[500px] h-72 sm:h-[500px] bg-blue-300/20 rounded-full blur-[100px] sm:blur-[140px] mix-blend-multiply"></div>
        </div>

        <div className="w-full max-w-6xl mx-auto relative z-10 pt-10 sm:pt-0">
          
          <div className="text-center mb-12 sm:mb-20 animate-in fade-in slide-in-from-top-4 duration-500">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-4 sm:mb-6 tracking-tight leading-tight">
              Tüm <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Hizmetler</span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto px-4 sm:px-0 leading-relaxed">
              İhtiyacınız olan hizmet kategorisini seçin ve alanında uzman, onaylı profesyonellerle saniyeler içinde eşleşin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 sm:gap-10">
            {tree.map((cat, index) => (
              <div 
                key={cat.id} 
                className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] border border-white shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_60px_-15px_rgba(16,185,129,0.15)] hover:-translate-y-1 hover:border-emerald-100 transition-all duration-500 group flex flex-col h-full animate-in fade-in slide-in-from-bottom-8"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                
                {/* Kategori Başlığı ve İkonu */}
                <div className="flex items-center gap-4 sm:gap-5 mb-8 pb-6 border-b border-slate-100/80">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/30 text-emerald-500 flex items-center justify-center group-hover:from-emerald-500 group-hover:to-teal-400 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300 shrink-0 border border-slate-100 group-hover:border-emerald-400 transform group-hover:rotate-3">
                    <span className="material-symbols-outlined text-[28px] sm:text-[32px]">{getCategoryIcon(cat.name)}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight tracking-tight">
                    {cat.name}
                  </h2>
                </div>
                
                {/* Alt Kategoriler (Premium Butonlar) */}
                <div className="flex flex-col gap-3 sm:gap-4 mt-auto">
                  {cat.subcategories.map(sub => {
                    // API'den slug gelmezse güvenli bir şekilde slug oluştur.
                    const targetSlug = sub.slug || generateSlug(sub.name);

                    return (
                      <Link key={sub.id} href={`/kategoriler/${targetSlug}`} className="outline-none block w-full">
                        <div className="flex items-center justify-between w-full p-4 sm:p-5 bg-[#FAF7F2]/50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-bold text-sm sm:text-base rounded-2xl transition-all duration-300 border border-slate-100 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/10 active:scale-[0.98] group/btn">
                          <span className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-slate-300 group-hover/btn:bg-emerald-500 transition-colors"></span>
                            {sub.name}
                          </span>
                          <span className="material-symbols-outlined text-[20px] text-slate-300 group-hover/btn:text-emerald-500 group-hover/btn:translate-x-1 transition-transform">east</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
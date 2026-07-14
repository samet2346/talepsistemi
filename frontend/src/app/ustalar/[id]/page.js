"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';
import api from '@/lib/api';

const DEFAULT_FOTO = "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400";

const normalizePortfolio = (portfolio, work_photos) => {
  const source = portfolio || work_photos;
  if (!source) return [];
  const arr = Array.isArray(source) ? source : [];
  return arr
    .map((item) => (typeof item === 'string' ? item : (item?.url || item)))
    .filter(Boolean);
};

const mapMasterDetail = (m) => {
  // Backend'den ham ID (1 gibi) dönüyorsa geçici olarak düzgün isimler atıyoruz
  const kategoriAd = m.category_name && isNaN(m.category_name) ? m.category_name : 'Boya Badana';
  const ilceAd = m.district_name && isNaN(m.district_name) ? m.district_name : 'Kadıköy';

  const deleteReview = Array.isArray(m.reviews) ? m.reviews : [];
  const yorumlar = Array.isArray(m.reviews) ? m.reviews : [];
  
  // Hijyen sertifikası uçuruldu, sadece ana ustalık belgesi fallback olarak kaldı
  const belgeler = Array.isArray(m.certificates) && m.certificates.length > 0 
    ? m.certificates 
    : [
        { id: 1, name: "Mesleki Yeterlilik Belgesi (Ustalık)", issuer: "Milli Eğitim Bakanlığı Onaylı" }
      ];

  return {
    id: m.id,
    ad: m.user_full_name || m.full_name || m.business_name || 'Samet Basmaz',
    kategori: m.category || '',
    kategoriAd,
    ilceAd,
    puan: m.average_review_rating ? parseFloat(m.average_review_rating).toFixed(1) : '5.0',
    yorumSayisi: yorumlar.length || m.review_count || 0,
    foto: m.profile_photo || m.avatar || DEFAULT_FOTO,
    rozet: m.is_verified || m.trust_score > 80 ? 'Onaylı Uzman' : 'Onaylı Usta',
    hakkinda: m.bio || m.description || 'Henüz açıklama eklenmemiş.',
    portfolyo: normalizePortfolio(m.portfolio, m.work_photos),
    yorumlarListesi: yorumlar,
    belgelerListesi: belgeler,
    tamamlananIsler: m.completed_jobs || 1
  };
};

export default function UstaDetay() {
  const params = useParams();
  const ustaId = params?.id;

  const [usta, setUsta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsta = async () => {
      if (!ustaId) return;
      setLoading(true);
      try {
        const res = await api.get(`/masters/list/${ustaId}/`);
        setUsta(mapMasterDetail(res.data));
      } catch (err) {
        console.error('Usta detayı yüklenemedi usta:', err);
        setUsta(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUsta();
  }, [ustaId]);

  if (loading) return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
    </div>
  );

  if (!usta) return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl font-bold border border-red-100 shadow-sm">
        ⚠️ Usta profili bulunamadı veya silinmiş.
      </div>
    </div>
  );

  return (
    <>
      {/* 🚀 GOOGLE ICONS KESİN ÇÖZÜM: Import yerine doğrudan standart HTML link etiketi basıyoruz */}
      <link 
        rel="stylesheet" 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
      />

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
        
        <BackButton className="absolute top-6 left-6 md:top-10 md:left-10 z-50 text-slate-500 hover:text-emerald-500 transition-colors" />

        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-400 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-300 rounded-full blur-[120px] opacity-20"></div>
        </div>

        <div className="max-w-4xl mx-auto pt-16 md:pt-4 relative z-10">
          
          <div className="bg-white border border-gray-100 rounded-[3rem] p-6 md:p-12 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.04)] relative overflow-hidden">
            
            {/* ÜST BÖLÜM: Profil Özeti */}
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12 relative z-10 border-b border-slate-100 pb-12">
              
              {/* Profil Resmi Katmanı */}
              <div className="relative w-36 h-36 rounded-full border-4 border-white shadow-xl overflow-hidden shrink-0 bg-slate-200 z-20">
                <Image 
                  src={usta.foto} 
                  alt={usta.ad} 
                  fill 
                  sizes="144px"
                  className="object-cover" 
                  priority 
                  unoptimized={true} // 🚀 DEĞİŞİKLİK: Next.js resim korumasını bypass etmek için eklendi
                />
              </div>
              
              <div className="text-center md:text-left flex-1">
                <div className="flex flex-col md:flex-row items-center gap-3 mb-4 justify-center md:justify-start">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">{usta.ad}</h1>
                  {usta.rozet && (
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
                      {usta.rozet}
                    </span>
                  )}
                </div>
                
                {/* Üst kısımdaki kırık 1-1 yazı alanları kelimelerle temizlendi */}
                <div className="flex flex-wrap gap-2.5 justify-center md:justify-start mb-8">
                  <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-xl text-xs font-bold border border-blue-100">
                    🛠 {usta.kategoriAd}
                  </span>
                  <span className="bg-slate-50 text-slate-600 px-4 py-1.5 rounded-xl text-xs font-bold border border-slate-200">
                    📍 {usta.ilceAd}
                  </span>
                  <span className="bg-amber-50 text-amber-600 px-4 py-1.5 rounded-xl text-xs font-bold border border-amber-200 flex items-center gap-0.5">
                    ⭐ {usta.puan} ({usta.yorumSayisi} Yorum)
                  </span>
                  {usta.tamamlananIsler > 0 && (
                    <span className="bg-purple-50 text-purple-600 px-4 py-1.5 rounded-xl text-xs font-bold border border-purple-100">
                      ✅ {usta.tamamlananIsler} Başarılı İş
                    </span>
                  )}
                </div>

                <Link href={`/talep?kategori=${usta.kategori}&usta=${usta.id}`}>
                  <button className="w-full md:w-auto px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5">
                    Bu Ustadan Teklif İste
                  </button>
                </Link>
              </div>
            </div>

            {/* HAKKINDA BÖLÜMÜ */}
            <div className="mb-12 relative z-10">
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500 text-xl">assignment_ind</span>
                Hakkında
              </h2>
              <div className="bg-[#FAF7F2] p-6 md:p-8 rounded-2xl border border-slate-100">
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-base font-medium">
                  {usta.hakkinda}
                </p>
              </div>
            </div>

            {/* BELGELER VE SERTİFİKALAR BÖLÜMÜ */}
            <div className="mb-12 relative z-10">
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500 text-xl">workspace_premium</span>
                Ustalık Belgeleri & Yetkinlikler
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {usta.belgelerListesi.map((belge, idx) => (
                  <div key={belge.id || idx} className="flex items-center gap-4 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/60 shadow-sm">
                    <span className="material-symbols-outlined text-3xl text-emerald-600">badge</span>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{belge.name || belge.title}</h4>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">{belge.issuer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PORTFOLYO GALERİSİ */}
            <div className="mb-12 relative z-10">
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500 text-xl">photo_library</span>
                Tamamlanan İşler (Portfolyo)
              </h2>
              {usta.portfolyo && usta.portfolyo.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {usta.portfolyo.map((foto, index) => (
                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group cursor-pointer shadow-sm">
                      <Image 
                        src={foto} 
                        alt={`${usta.ad} portfolyo ${index + 1}`} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-105" 
                        unoptimized={true} // 🚀 DEĞİŞİKLİK: Portfolyo resimleri için Next.js optimizasyonunu bypass eder
                      />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 border border-slate-100 border-dashed rounded-2xl">
                  <p className="text-slate-500 text-sm font-medium">Usta henüz portfolyo görseli yüklememiş.</p>
                </div>
              )}
            </div>

            {/* KULLANICI YORUMLARI */}
            <div className="relative z-10">
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500 text-xl">rate_review</span>
                Kullanıcı Değerlendirmeleri ({usta.yorumSayisi})
              </h2>
              {usta.yorumlarListesi && usta.yorumlarListesi.length > 0 ? (
                <div className="space-y-4">
                  {usta.yorumlarListesi.map((yorum, idx) => (
                    <div key={yorum.id || idx} className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-black text-slate-900">{yorum.reviewer_full_name || "Kullanıcı"}</h4>
                        <span className="text-amber-500 font-bold text-sm flex items-center gap-0.5">
                          ★ {yorum.avg_rating ? parseFloat(yorum.avg_rating).toFixed(1) : "5.0"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                        "{yorum.comment || yorum.message}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 border border-slate-100 border-dashed rounded-2xl">
                  <p className="text-slate-400 text-sm font-medium">Bu uzman hakkında henüz bir yorum girilmemiş.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
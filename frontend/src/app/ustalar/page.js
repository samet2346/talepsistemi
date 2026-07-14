"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';
import api from '@/lib/api';

const DEFAULT_FOTO = "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400";

const normalizeWorkPhotos = (work_photos) => {
  if (!work_photos) return [];
  const arr = Array.isArray(work_photos) ? work_photos : [];
  return arr.map((item, i) => ({
    id: i + 1,
    url: typeof item === 'string' ? item : (item?.url || item),
  })).filter((item) => item.url);
};

const mapMasterToCard = (m) => {
  // Backend'den ham sayısal ID geliyorsa tasarıma default isim basıyoruz
  const kategoriAd = m.category_name && isNaN(m.category_name) ? m.category_name : 'Boya Badana';
  const ilceAd = m.district_name && isNaN(m.district_name) ? m.district_name : 'Kadıköy';

  return {
    id: m.id, 
    ad: m.user_full_name || m.full_name || m.business_name || 'Uzman Usta',
    kategori: m.category || '',
    kategoriAd,
    ilce: m.district || '',
    ilceAd,
    puan: m.rating || m.trust_score ? parseFloat(m.rating || m.trust_score).toFixed(1) : '5.0',
    yorumSayisi: m.review_count || (Array.isArray(m.reviews) ? m.reviews.length : 0),
    foto: m.profile_photo || m.avatar || DEFAULT_FOTO,
    rozet: m.is_verified || m.trust_score > 80 ? 'Onaylı Usta' : '',
    hakkinda: m.bio || m.description || m.business_name || 'Profesyonel hizmet kalitesi.',
    telefon: m.phone || m.phone_number || (m.user && m.user.phone) || null,
    portfolyo: normalizeWorkPhotos(m.portfolio || m.work_photos),
  };
};

export default function UstalarListesi() {
  const [ustalar, setUstalar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [kategoriler, setKategoriler] = useState([{ label: "Tüm Hizmetler", value: "" }]);
  const [ilceler, setIlceler] = useState([{ label: "Tüm İlçeler", value: "" }]);

  const [seciliUsta, setSeciliUsta] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [seciliKategori, setSeciliKategori] = useState('');
  const [seciliIlce, setSeciliIlce] = useState('');

  const [aktifKategori, setAktifKategori] = useState('');
  const [aktifIlce, setAktifIlce] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/common/config/');
        const categories = res.data?.categories || [];
        const districts = res.data?.districts || [];
        setKategoriler([
          { label: "Tüm Hizmetler", value: "" },
          ...categories.map((c) => ({ label: c.name, value: c.slug || c.id })),
        ]);
        setIlceler([
          { label: "Tüm İlçeler", value: "" },
          ...districts.map((d) => ({ label: d.name, value: d.slug || d.id })),
        ]);
      } catch (err) {
        console.error('Filtre verileri yüklenemedi:', err);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const fetchUstalar = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (aktifKategori) params.category = aktifKategori;
        if (aktifIlce) params.district = aktifIlce;
        const res = await api.get('/masters/list/', { params });
        const results = res.data?.results || res.data || [];
        setUstalar(results.map(mapMasterToCard));
      } catch (err) {
        console.error('Ustalar yüklenemedi:', err);
        setError('Ustalar yüklenirken bir hata oluştu.');
        setUstalar([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUstalar();
  }, [aktifKategori, aktifIlce]);

  const handleAramaYar = () => {
    setAktifKategori(seciliKategori);
    setAktifIlce(seciliIlce);
  };

  const handleTemizle = () => {
    setSeciliKategori(''); 
    setSeciliIlce('');
    setAktifKategori(''); 
    setAktifIlce('');
  };

  const handleProfilAc = (usta) => {
    setSeciliUsta(usta);
    setIsModalOpen(true);
  };

  const filtrelenmisUstalar = ustalar;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          body {
              background-image: radial-gradient(circle at 50% 0%, #FDFBF7 0%, #FAF7F2 60%, #F5F1EA 100%);
              background-attachment: fixed;
              background-color: #FAF7F2;
          }
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        `
      }} />

      <div className="min-h-screen py-10 px-4 relative font-sans selection:bg-emerald-500/20">
        
        <BackButton className="absolute top-6 left-6 md:top-10 md:left-10 z-50 text-slate-500 hover:text-emerald-500 transition-colors" />

        <div className="max-w-6xl mx-auto pt-16 md:pt-10 relative z-10">
          
          <div className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter">
                Uzmanları <span className="text-emerald-500">Keşfedin</span>
              </h1>
          </div>

          {/* FİLTRELEME ÇUBUĞU */}
          <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-[2.5rem] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-12 relative z-20">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Hizmet</label>
              <select value={seciliKategori} onChange={(e) => setSeciliKategori(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none appearance-none cursor-pointer">
                {kategoriler.map((kat, index) => <option key={index} value={kat.value}>{kat.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Bölge</label>
              <select value={seciliIlce} onChange={(e) => setSeciliIlce(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none appearance-none cursor-pointer">
                {ilceler.map((ilce, index) => <option key={index} value={ilce.value}>{ilce.label}</option>)}
              </select>
            </div>
            <button onClick={handleAramaYar} className="w-full h-14 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95">
              Filtrele
            </button>
          </div>

          {/* USTA KARTLARI */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {filtrelenmisUstalar.length > 0 ? (
              filtrelenmisUstalar.map((usta) => (
                <div key={usta.id} className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm group hover:border-emerald-200 transition-all">
                  <div className="p-6 flex gap-4 items-center">
                    <div className="relative w-20 h-20 rounded-full bg-slate-50 border-4 border-white shadow-md overflow-hidden shrink-0">
                      {/* 🚀 DEĞİŞİKLİK: Ana listedeki profil resmine unoptimized çakıldı */}
                      <Image 
                        src={usta.foto} 
                        alt={usta.ad} 
                        fill 
                        className="object-cover" 
                        unoptimized={true} 
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{usta.ad}</h3>
                      <p className="text-amber-500 font-bold text-sm">⭐ {usta.puan} <span className="text-slate-400 font-medium text-xs">({usta.yorumSayisi} Yorum)</span></p>
                    </div>
                  </div>
                  <div className="px-6 mb-4 flex gap-2">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black">{usta.kategoriAd}</span>
                    <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black">📍 {usta.ilceAd}</span>
                  </div>
                  <div className="px-6 mb-6 flex-1">
                    <p className="text-slate-500 font-medium text-sm line-clamp-2 leading-relaxed italic">"{usta.hakkinda}"</p>
                  </div>
                  <div className="p-4 mt-auto border-t bg-slate-50/30 grid grid-cols-2 gap-3">
                    <Link href={`/ustalar/${usta.id}`} className="w-full text-center text-xs font-bold border-2 border-slate-200 text-slate-600 py-3.5 rounded-2xl bg-white hover:border-emerald-500 transition-all flex items-center justify-center">
                      Profili İncele
                    </Link>
                    <Link href={`/talep?usta=${usta.id}`} className="w-full text-center bg-emerald-500 text-white py-3.5 rounded-2xl text-xs font-bold hover:bg-emerald-600 shadow-md transition-all flex items-center justify-center">
                      Teklif İste
                    </Link>
                  </div>
                </div>
              ))
            ) : !loading ? (
              <div className="col-span-full py-20 text-center bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem]">
                <h3 className="text-xl font-bold text-slate-900 mb-4">{error || 'Usta Bulunamadı'}</h3>
                <button onClick={handleTemizle} className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-2xl hover:border-emerald-500 transition-all">Temizle</button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* İNCELEME MODALI */}
      {isModalOpen && seciliUsta && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-6 md:p-10 relative shadow-2xl animate-in zoom-in-95">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center">✕</button>
            
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8 pb-8 border-b border-slate-100 mt-4">
              <div className="relative w-32 h-32 rounded-full border-4 border-slate-50 shadow-xl overflow-hidden shrink-0">
                {/* 🚀 DEĞİŞİKLİK: Modal içindeki profil resmine unoptimized çakıldı */}
                <Image 
                  src={seciliUsta.foto} 
                  alt={seciliUsta.ad} 
                  fill 
                  className="object-cover" 
                  unoptimized={true} 
                />
              </div>
              <div className="text-center md:text-left flex-1">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <h2 className="text-3xl font-black text-slate-900">{seciliUsta.ad}</h2>
                  <Link href={`/ustalar/${seciliUsta.id}`} className="text-xs text-emerald-600 font-bold underline flex items-center ml-2">
                    Tam Profili & Belgeleri Gör ↗
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-3 mb-4">
                  <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-xl text-xs font-bold uppercase">{seciliUsta.kategoriAd}</span>
                  <span className="bg-slate-50 text-slate-600 px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider">📍 {seciliUsta.ilceAd}</span>
                  <span className="bg-amber-50 text-amber-600 px-4 py-1.5 rounded-xl text-xs font-bold uppercase">⭐ {seciliUsta.puan} ({seciliUsta.yorumSayisi} Yorum)</span>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl">
                  <p className="text-slate-600 leading-relaxed font-medium italic">"{seciliUsta.hakkinda}"</p>
                </div>
              </div>
            </div>

            {/* PORTFOLYO BÖLÜMÜ */}
            <div className="mb-10">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">📁 Tamamlanan İşler</h3>
              {seciliUsta.portfolyo && seciliUsta.portfolyo.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {seciliUsta.portfolyo.map((foto) => (
                    <div key={foto.id} className="relative aspect-square rounded-2xl overflow-hidden border">
                      {/* 🚀 DEĞİŞİKLİK: Modal içindeki portfolyo resimlerine unoptimized çakıldı */}
                      <Image 
                        src={foto.url} 
                        alt="Portfolyo" 
                        fill 
                        className="object-cover" 
                        unoptimized={true} 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm font-medium italic">Henüz çalışma örneği yok.</p>
              )}
            </div>

            {/* WHATSAPP VE TAM PROFİL BUTON Izgarası */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
              <Link href={`/ustalar/${seciliUsta.id}`} className="px-6 py-4 border-2 border-slate-200 hover:border-emerald-500 font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">workspace_premium</span>
                Tüm Belgeleri & Yorumları Gör
              </Link>
              
              {seciliUsta.telefon ? (
                <a 
                  href={`https://wa.me/90${String(seciliUsta.telefon).replace(/\D/g, '')}?text=${encodeURIComponent(`Merhaba ${seciliUsta.ad}, Usta Kapında üzerinden portfolyonuzu inceledim. Sizinle iletişime geçmek istiyorum.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-black text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-5 Fly-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.559 0 11.896-5.335 11.898-11.892a11.81 11.81 0 00-3.48-8.413z"/></svg>
                  WhatsApp'tan Yaz
                </a>
              ) : (
                <p className="text-slate-400 text-sm font-bold italic py-2 text-center">⚠️ İletişim numarası eksik.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
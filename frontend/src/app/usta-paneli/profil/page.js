"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Spinner from '@/components/ui/Spinner';
import BackButton from "@/components/ui/BackButton";
import api from '@/lib/api';

export default function UstaProfil() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const profilFotoRef = useRef(null);
  const portfolyoFotoRef = useRef(null);
  const belgeRef = useRef(null);

  const [profilFotoDosya, setProfilFotoDosya] = useState(null);
  const [profilFoto, setProfilFoto] = useState(null);
  const [belge, setBelge] = useState(null);

  const [formData, setFormData] = useState({
    ad: '',
    telefon: '',
    email: '',
    kategori: [],   
    ilce: [],       
    deneyim: '0',
    hakkimda: ''
  });

  const [portfolyo, setPortfolyo] = useState([]);
  const [kategoriler, setKategoriler] = useState([]);
  const [ilceler, setIlceler] = useState([]);

  const HAKKIMDA_MAX = 600;

  const normalizeWorkPhotos = (work_photos) => {
    if (!work_photos) return [];
    let arr = work_photos;
    if (typeof work_photos === 'string') {
      try { arr = JSON.parse(work_photos); } catch (e) { arr = []; }
    }
    if (!Array.isArray(arr)) return [];
    return arr.map((item, i) => {
      const url = typeof item === 'string' ? item : (item?.url || item);
      return { id: item?.id || i + 1, url: url, file: item?.file || null };
    }).filter((foto) => foto.url);
  };

  const resolveMultiSelectValue = (value) => {
    if (Array.isArray(value)) {
      return value
        .map((v) => (v && typeof v === 'object' ? v.id : v))
        .filter((v) => v !== null && v !== undefined && v !== '')
        .map(String);
    }
    if (value === null || value === undefined || value === '') return [];
    return [String(value)];
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [configRes, profileRes] = await Promise.all([
          api.get('/masters/config/'),
          api.get('/accounts/me/'),
        ]);

        const categories = configRes.data?.categories || [];
        const districts = configRes.data?.districts || [];
        setKategoriler(categories.map((c) => ({ label: c.name, value: String(c.id) })));
        setIlceler(districts.map((d) => ({ label: d.name, value: String(d.id) })));

        const data = profileRes.data;
        setFormData({
          ad: data.full_name || '',
          telefon: data.phone || '',
          email: data.email || '',
          kategori: resolveMultiSelectValue(data.categories),
          ilce: resolveMultiSelectValue(data.locations_served),
          deneyim: data.experience_years != null ? String(data.experience_years) : '0',
          hakkimda: data.bio || '',
        });

        if (data.avatar_url) setProfilFoto(data.avatar_url);
        setPortfolyo(normalizeWorkPhotos(data.work_photos));

        if (data.certificate_url) {
          const dosyaAdi = data.certificate_url.split('/').pop() || "Usta_Belgesi";
          setBelge({ name: dosyaAdi, url: data.certificate_url, file: null });
        }
      } catch (err) {
        console.error("Profil verisi çekilemedi:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleProfilFotoSec = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilFotoDosya(file);
      setProfilFoto(URL.createObjectURL(file));
    }
  };

  const handlePortfolyoFotoSec = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPortfolyo([...portfolyo, { id: Date.now(), url: imageUrl, file: file }]);
    }
  };

  const handleBelgeSec = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBelge({ name: file.name, url: URL.createObjectURL(file), file: file, size: file.size, type: file.type });
    }
  };

  const fotoSil = (id) => setPortfolyo(portfolyo.filter(foto => foto.id !== id));
  const belgeSil = () => { setBelge(null); if (belgeRef.current) belgeRef.current.value = ""; };

  const toggleKategori = (value) => {
    setFormData((prev) => {
      const exists = prev.kategori.includes(value);
      return { ...prev, kategori: exists ? prev.kategori.filter((v) => v !== value) : [...prev.kategori, value] };
    });
  };

  const toggleIlce = (value) => {
    setFormData((prev) => {
      const exists = prev.ilce.includes(value);
      return { ...prev, ilce: exists ? prev.ilce.filter((v) => v !== value) : [...prev.ilce, value] };
    });
  };

  const formatDosyaBoyutu = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.kategori || formData.kategori.length === 0) {
        alert("Lütfen en az bir uzmanlık alanı (Kategori) seçin usta!");
        setLoading(false); return;
      }
      if (!formData.ilce || formData.ilce.length === 0) {
        alert("Lütfen hizmet verdiğiniz en az bir ilçeyi seçin usta!");
        setLoading(false); return;
      }

      const data = new FormData();
      data.append('bio', formData.hakkimda || '');
      data.append('experience_years', formData.deneyim || '0');
      data.append('categories', JSON.stringify(formData.kategori.map(Number)));
      data.append('locations_served', JSON.stringify(formData.ilce.map(Number)));

      if (profilFotoDosya) data.append('avatar_url', profilFotoDosya);
      if (belge && belge.file) data.append('certificate_url', belge.file);

      const temizFotografListesi = await Promise.all(
        portfolyo.map(async (foto) => {
          if (foto.file) {
            const base64Str = await toBase64(foto.file);
            return base64Str;
          }
          return foto.url;
        })
      );
      data.append('work_photos', JSON.stringify(temizFotografListesi));

      await api.patch('/accounts/me/provider-profile/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const accountPayload = {};
      if (formData.ad) accountPayload.full_name = formData.ad;
      if (formData.email) accountPayload.email = formData.email;
      if (Object.keys(accountPayload).length > 0) {
        await api.patch('/accounts/me/', accountPayload);
      }

      setMessage({ type: 'success', text: 'Profiliniz ve vitrininiz başarıyla mühürlendi usta! 🎉' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      console.error('Profil güncellenemedi:', err);
      const serverError = err.response?.data ? JSON.stringify(err.response.data) : 'Güncelleme başarısız.';
      setMessage({ type: 'error', text: `Hata: ${serverError}` });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } finally {
      setLoading(false);
    }
  };

  const seciliKategoriEtiketleri = kategoriler.filter((k) => formData.kategori.includes(k.value));
  const seciliIlceEtiketleri = ilceler.filter((i) => formData.ilce.includes(i.value));

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
          body { background-color: #F8FAFC; }
        `
      }} />

      <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden font-sans bg-slate-50 selection:bg-emerald-500/20 pb-24">

        {/* 🔥 CANLI KAPAK (HERO) 🔥 */}
        <div className="relative h-48 sm:h-56 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <BackButton className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 text-white/90 hover:text-white drop-shadow-md transition-colors" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 -mt-16 sm:-mt-20">
          
          {/* 🔥 GÖRÜNÜR BAŞLIK ALANI 🔥 */}
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-8 gap-4 drop-shadow-md">
            <div className="text-center sm:text-left">
              {/* text-white ve text-emerald-200 ile zümrüt arkaplanda parlaması sağlandı */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                Profil <span className="text-emerald-200">Vitrinim</span>
              </h1>
              <p className="text-emerald-50/90 text-sm font-medium mt-1">Müşterilerinize en iyi halinizi gösterin.</p>
            </div>

            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-600 transition-all shadow-sm flex items-center justify-center gap-2 outline-none"
            >
              <span className="material-symbols-outlined text-[20px]">visibility</span>
              Vitrin Önizleme
            </button>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-2xl text-sm font-bold flex items-start gap-3 animate-in fade-in zoom-in-95 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              <span className="material-symbols-outlined text-[20px]">{message.type === 'success' ? 'check_circle' : 'error'}</span>
              <span className="mt-0.5">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <input type="file" accept="image/*" ref={profilFotoRef} onChange={handleProfilFotoSec} className="hidden" />
            <input type="file" accept="image/*" ref={portfolyoFotoRef} onChange={handlePortfolyoFotoSec} className="hidden" />
            <input type="file" accept="image/*,application/pdf" ref={belgeRef} onChange={handleBelgeSec} className="hidden" />

            {/* 1. KART: AVATAR VE TEMEL BİLGİLER */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center md:items-start">
              
              <div className="flex flex-col items-center gap-4 shrink-0">
                <div onClick={() => profilFotoRef.current.click()} className="relative w-32 h-32 rounded-3xl border-4 border-slate-50 overflow-hidden group cursor-pointer shadow-lg bg-slate-100">
                  <Image
                    src={profilFoto && typeof profilFoto === "string" && profilFoto.trim() !== "" ? profilFoto : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150"}
                    alt="Profil" fill className="object-cover" unoptimized
                  />
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <span className="material-symbols-outlined text-white text-3xl">add_a_photo</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-100">
                  <span className="material-symbols-outlined text-[16px]">verified</span> Onaylı Usta
                </div>
              </div>

              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase pl-1">Ad Soyad</label>
                    <input type="text" value={formData.ad} onChange={(e) => setFormData({ ...formData, ad: e.target.value })} className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase pl-1">Telefon</label>
                    <input type="tel" value={formData.telefon} disabled className="w-full h-14 px-4 bg-slate-100/70 border border-slate-200 rounded-2xl text-slate-500 text-sm font-bold cursor-not-allowed" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase pl-1">E-posta</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase pl-1">Deneyim (Yıl)</label>
                    <input type="number" min="0" value={formData.deneyim} onChange={(e) => setFormData({ ...formData, deneyim: e.target.value })} className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. KART: UZMANLIK VE BÖLGE */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100 space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-emerald-500">handyman</span>
                  <h3 className="text-lg font-bold text-slate-900">Uzmanlık Alanları</h3>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {kategoriler.length === 0 ? (
                    /* 🔥 PROFESYONEL SKELETON LOADER 🔥 */
                    <div className="flex flex-wrap gap-2 animate-pulse">
                      <div className="h-10 w-28 bg-slate-200/70 rounded-xl"></div>
                      <div className="h-10 w-20 bg-slate-200/70 rounded-xl"></div>
                      <div className="h-10 w-32 bg-slate-200/70 rounded-xl"></div>
                    </div>
                  ) : (
                    kategoriler.map((kat, i) => {
                      const secili = formData.kategori.includes(kat.value);
                      return (
                        <button key={i} type="button" onClick={() => toggleKategori(kat.value)} className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-95 ${secili ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-white'}`}>
                          {kat.label}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-blue-500">location_on</span>
                  <h3 className="text-lg font-bold text-slate-900">Hizmet Bölgeleri</h3>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {ilceler.length === 0 ? (
                    /* 🔥 PROFESYONEL SKELETON LOADER 🔥 */
                    <div className="flex flex-wrap gap-2 animate-pulse">
                      <div className="h-10 w-32 bg-slate-200/70 rounded-xl"></div>
                      <div className="h-10 w-24 bg-slate-200/70 rounded-xl"></div>
                      <div className="h-10 w-28 bg-slate-200/70 rounded-xl"></div>
                    </div>
                  ) : (
                    ilceler.map((ilce, i) => {
                      const secili = formData.ilce.includes(ilce.value);
                      return (
                        <button key={i} type="button" onClick={() => toggleIlce(ilce.value)} className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-95 ${secili ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-white'}`}>
                          {ilce.label}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* 3. KART: HAKKIMDA */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500">edit_note</span>
                  <h3 className="text-lg font-bold text-slate-900">Hakkımda & Vizyon</h3>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${formData.hakkimda.length > HAKKIMDA_MAX ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                  {formData.hakkimda.length} / {HAKKIMDA_MAX}
                </span>
              </div>
              <textarea
                value={formData.hakkimda}
                maxLength={HAKKIMDA_MAX}
                placeholder="Müşterilere kendinizden, çalışma prensiplerinizden ve kullandığınız malzemelerden bahsedin..."
                onChange={(e) => setFormData({ ...formData, hakkimda: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 min-h-[140px] text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-y"
              />
            </div>

            {/* 4. KART: BELGELER & PORTFOLYO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Resmi Belge */}
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-500">workspace_premium</span>
                    <h3 className="text-lg font-bold text-slate-900">Resmi Belge</h3>
                  </div>
                </div>
                {belge ? (
                  <div className="flex items-center justify-between gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex-1">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">{belge.type === 'application/pdf' ? 'picture_as_pdf' : 'image'}</span>
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-slate-700 text-sm truncate">{belge.name}</div>
                        {belge.size && <div className="text-[11px] font-bold text-slate-400 mt-0.5">{formatDosyaBoyutu(belge.size)}</div>}
                      </div>
                    </div>
                    <button type="button" onClick={belgeSil} className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors shrink-0 outline-none">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ) : (
                  <div onClick={() => belgeRef.current.click()} className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group">
                    <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-indigo-100 flex items-center justify-center mb-3 transition-colors">
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-indigo-500">upload_file</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700">Belge Yükle</p>
                    <p className="text-[11px] font-medium text-slate-400 mt-1">Ustalık belgesi veya sertifika</p>
                  </div>
                )}
              </div>

              {/* Portfolyo */}
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-pink-500">photo_library</span>
                    <h3 className="text-lg font-bold text-slate-900">Geçmiş İşlerim</h3>
                  </div>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 flex-1 items-center">
                  {portfolyo.map((foto) => {
                    let temizUrl = typeof foto.url === 'string' ? foto.url.replace(/["']/g, '').trim() : foto.url;
                    return (
                      <div key={foto.id} className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-slate-200 group">
                        {temizUrl && <Image src={temizUrl} alt="İş" fill className="object-cover" unoptimized />}
                        <button type="button" onClick={() => fotoSil(foto.id)} className="absolute top-1.5 right-1.5 w-7 h-7 bg-red-500/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity outline-none">
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    );
                  })}
                  <div onClick={() => portfolyoFotoRef.current.click()} className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center shrink-0 cursor-pointer hover:border-pink-400 hover:bg-pink-50/50 transition-all group">
                    <span className="material-symbols-outlined text-slate-300 group-hover:text-pink-500 text-3xl">add</span>
                  </div>
                </div>
              </div>
            </div>

            {/* KAYDET BUTONU */}
            <div className="pt-4 pb-8">
              <button type="submit" disabled={loading} className={`w-full h-14 sm:h-16 text-sm sm:text-base font-bold rounded-2xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 outline-none ${loading ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25'}`}>
                {loading ? <Spinner className="w-6 h-6 border-white" /> : <><span className="material-symbols-outlined">save</span> Tüm Değişiklikleri Mühürle</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ÖNİZLEME MODALI (VİTRİN) */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-slate-50 w-full sm:max-w-2xl h-[90vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto rounded-t-[2rem] sm:rounded-[2.5rem] relative shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            
            {/* Modal Kapatıcı */}
            <div className="sticky top-0 z-20 flex justify-end p-4 bg-gradient-to-b from-slate-900/50 to-transparent">
              <button onClick={() => setIsPreviewOpen(false)} className="w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-colors outline-none">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-6 pb-10 -mt-14">
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center relative mt-8">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[1.5rem] bg-slate-100 border-4 border-white shadow-lg overflow-hidden relative -mt-16 mb-4">
                  <Image src={profilFoto || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150"} alt="Profil" fill className="object-cover" unoptimized />
                </div>
                
                <h2 className="text-2xl font-black text-slate-900 mb-2">{formData.ad || 'Usta Adı'}</h2>
                
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[11px] font-bold uppercase border border-emerald-100 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">verified</span> Onaylı
                  </span>
                  {Number(formData.deneyim) > 0 && (
                    <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-lg text-[11px] font-bold uppercase border border-amber-100">
                      ⭐ {formData.deneyim} Yıl
                    </span>
                  )}
                  {belge && (
                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[11px] font-bold uppercase border border-indigo-100">
                      📄 Belgeli
                    </span>
                  )}
                </div>

                <div className="w-full bg-slate-50 p-5 rounded-2xl text-left mb-6 border border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Hakkında</h4>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{formData.hakkimda || 'Biyografi eklenmemiş.'}</p>
                </div>

                <div className="w-full text-left">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Hizmet Alanları</h4>
                  <div className="flex flex-wrap gap-2">
                    {seciliKategoriEtiketleri.map(k => <span key={k.value} className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">{k.label}</span>)}
                    {seciliIlceEtiketleri.map(i => <span key={i.value} className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">📍 {i.label}</span>)}
                  </div>
                </div>
              </div>

              {portfolyo.length > 0 && (
                <div className="mt-6 bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100">
                  <h4 className="text-sm font-black text-slate-900 mb-4">Tamamlanan İşler ({portfolyo.length})</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {portfolyo.map(foto => (
                      <div key={foto.id} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100">
                        <Image src={typeof foto.url === 'string' ? foto.url.replace(/["']/g, '').trim() : foto.url} alt="İş" fill className="object-cover" unoptimized />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sabit Alt İletişim Butonu */}
              <div className="sticky bottom-0 pt-6 pb-2 bg-slate-50">
                {formData.telefon ? (
                  <a href={`https://wa.me/90${formData.telefon.replace(/\D/g, '')}?text=Merhaba`} target="_blank" rel="noopener noreferrer" className="w-full h-14 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all outline-none">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.559 0 11.896-5.335 11.898-11.892a11.81 11.81 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp İle Ulaşın
                </a>
              ) : (
                <div className="w-full h-14 bg-slate-200 text-slate-400 font-bold rounded-2xl flex items-center justify-center">Telefon Kayıtlı Değil</div>
              )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
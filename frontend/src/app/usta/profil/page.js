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
    kategori: '',
    ilce: '',
    deneyim: '0',
    hakkimda: ''
  });

  const [portfolyo, setPortfolyo] = useState([]);
  const [kategoriler, setKategoriler] = useState([]);
  const [ilceler, setIlceler] = useState([]);

 const normalizeWorkPhotos = (work_photos) => {
    if (!work_photos) return [];
    
    // 🚀 Django'dan bazen stringify olarak sızan JSON dizisini kurtarıyoruz
    let arr = work_photos;
    if (typeof work_photos === 'string') {
      try {
        arr = JSON.parse(work_photos);
      } catch (e) {
        arr = [];
      }
    }
    
    if (!Array.isArray(arr)) return [];

    // 🚀 Base64 string veya normal URL ayrımı yapmadan her veriyi url alanına mühürlüyoruz
    return arr.map((item, i) => {
      const url = typeof item === 'string' ? item : (item?.url || item);
      return {
        id: item?.id || i + 1,
        url: url,
        file: item?.file || null
      };
    }).filter((foto) => foto.url);
  };

  const resolveSelectValue = (value) => {
    if (Array.isArray(value)) {
      const first = value[0];
      if (first && typeof first === 'object') return String(first.id ?? '');
      return String(first ?? '');
    }
    return value ? String(value) : '';
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
          kategori: resolveSelectValue(data.categories),
          ilce: resolveSelectValue(data.locations_served),
          deneyim: '0',
          hakkimda: data.bio || '',
        });

        if (data.avatar_url) setProfilFoto(data.avatar_url);
        setPortfolyo(normalizeWorkPhotos(data.work_photos));
        
        // 🚀 KİLİT DOKUNUŞ: Sayfa yenilenince veritabanındaki belgeyi ekrana çeken kısım
        if (data.certificate_url) {
          // URL'den dosya adını ayıklayıp temiz bir isim gösteriyoruz usta
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
      // 🚀 file: file kısmının eksiksiz eklendiğinden emin oluyoruz
      setPortfolyo([...portfolyo, { id: Date.now(), url: imageUrl, file: file }]);
    }
  };

  const handleBelgeSec = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBelge({ name: file.name, url: URL.createObjectURL(file), file: file });
    }
  };

  const fotoSil = (id) => setPortfolyo(portfolyo.filter(foto => foto.id !== id));
  const belgeSil = () => { setBelge(null); if (belgeRef.current) belgeRef.current.value = ""; };

// 🚀 Resimleri kalıcı şifreli metne (Base64) çeviren sihirli motor
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
      if (!formData.kategori || formData.kategori === '') {
        alert("Lütfen uzmanlık alanınızı (Kategori) seçin usta!");
        setLoading(false);
        return;
      }
      if (!formData.ilce || formData.ilce === '') {
        alert("Lütfen hizmet verdiğiniz ilçeyi seçin usta!");
        setLoading(false);
        return;
      }

      const data = new FormData();
      data.append('bio', formData.hakkimda || '');
      
      data.append('categories', JSON.stringify([Number(formData.kategori)]));
      data.append('locations_served', JSON.stringify([Number(formData.ilce)]));

      if (profilFotoDosya) {
        data.append('avatar_url', profilFotoDosya);
      }

      // 🚀 NETLEŞEN YENİ ENDPOINT ALAN ADI: Sadece certificate_url gönderiyoruz
      if (belge && belge.file) {
        data.append('certificate_url', belge.file);
      }

      // 🚀 RESİMLERİN BOZULMASINI ENGELLEYEN KESİN DÖNÜŞÜM
      // Eğer fotoğraf yeniyse (foto.file varsa) Base64'e çevirir, eskiden yüklüyse (http'li link ise) aynen korur.
      const temizFotografListesi = await Promise.all(
        portfolyo.map(async (foto) => {
          if (foto.file) {
            const base64Str = await toBase64(foto.file);
            return base64Str;
          }
          return foto.url;
        })
      );

      // Artık geçici blob değil, kalıcı şifreli veri gidiyor!
      data.append('work_photos', JSON.stringify(temizFotografListesi));

      await api.patch('/accounts/me/provider-profile/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (formData.ad) {
        await api.patch('/accounts/me/', { full_name: formData.ad });
      }

      setMessage({ type: 'success', text: 'Profil, tüm fotoğraflar ve belgeler başarıyla mühürlendi usta!' });
    } catch (err) {
      console.error('Profil güncellenemedi:', err);
      const serverError = err.response?.data ? JSON.stringify(err.response.data) : 'Güncelleme başarısız.';
      setMessage({ type: 'error', text: `Hata: ${serverError}` });
      alert("Django'nun Fırlattığı Hata: " + serverError);
    } finally {
      setLoading(false);
    }
  };

  // JSX/Arayüz kodların (return kısmı) burada kaldığı yerden aynen devam ediyor usta...
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `body { background-image: radial-gradient(circle at 50% 0%, #FDFBF7 0%, #FAF7F2 60%, #F5F1EA 100%); background-attachment: fixed; background-color: #FAF7F2; }`
      }} />
      
      <div className="min-h-screen py-10 px-4 relative font-sans selection:bg-emerald-500/20">
        
        {/* ARKA PLAN EFEKTLERİ */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-400 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-300 rounded-full blur-[120px] opacity-20"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10 pt-10">
          
          <BackButton className="mb-8 text-slate-500 hover:text-emerald-500 transition-colors" />
          
          {/* 🔥 GÜNCELLENEN BAŞLIK VE ÖNİZLEME BUTONU */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Profil <span className="text-emerald-500">Vitrinim</span>
              </h1>
              <p className="text-slate-500 text-sm font-medium mt-1">Musterilerinizin gordugu sayfayi duzenleyin.</p>
            </div>

            <button 
              type="button" 
              onClick={() => setIsPreviewOpen(true)} 
              className="group px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Profili Onizle</span>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* GİZLİ INPUTLAR (Bozulmadı) */}
            <input type="file" accept="image/*" ref={profilFotoRef} onChange={handleProfilFotoSec} className="hidden" />
            <input type="file" accept="image/*" ref={portfolyoFotoRef} onChange={handlePortfolyoFotoSec} className="hidden" />
            <input type="file" accept="image/*,application/pdf" ref={belgeRef} onChange={handleBelgeSec} className="hidden" />

           {/* 1. BÖLÜM: TEMEL BİLGİLER */}
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 bg-white border border-gray-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center shadow-sm">
                <div onClick={() => profilFotoRef.current.click()} className="relative w-32 h-32 rounded-full border-4 border-slate-50 mb-6 overflow-hidden group cursor-pointer shadow-md">
                  {/* 🚀 Tasarımı bozmayan, boş string/null korumalı güvenli resim */}
                  <Image 
                    src={
                      profilFoto && typeof profilFoto === "string" && profilFoto.trim() !== "" 
                        ? profilFoto 
                        : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150"
                    } 
                    alt="Profil" 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold uppercase">Degistir</div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{formData.ad}</h2>
                <span className="text-emerald-600 text-xs font-bold bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full uppercase tracking-widest">Onayli Usta</span>
                {belge && <span className="mt-4 text-blue-600 text-xs font-bold border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-1.5">📄 Belgeli</span>}
              </div>

              <div className="w-full md:w-2/3 bg-white border border-gray-100 p-8 md:p-10 rounded-[2.5rem] shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Ad Soyad</label>
                    <input type="text" value={formData.ad} onChange={(e) => setFormData({...formData, ad: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 outline-none transition-all"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Iletisim</label>
                    <input type="text" value={formData.telefon} onChange={(e) => setFormData({...formData, telefon: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 outline-none transition-all"/>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Uzmanlik</label>
                    <select value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none appearance-none cursor-pointer">
                      {kategoriler.map((kat, i) => <option key={i} value={kat.value}>{kat.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Bolge</label>
                    <select value={formData.ilce} onChange={(e) => setFormData({...formData, ilce: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none appearance-none cursor-pointer">
                      {ilceler.map((ilce, i) => <option key={i} value={ilce.value}>{ilce.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">Deneyim (Yil)</label>
                    <input type="number" value={formData.deneyim} onChange={(e) => setFormData({...formData, deneyim: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"/>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. BÖLÜM: HAKKIMDA */}
            <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-[2.5rem] shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Hakkimda & Hizmet Detaylari</h3>
              <textarea value={formData.hakkimda} onChange={(e) => setFormData({...formData, hakkimda: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 min-h-37.5 outline-none focus:border-emerald-500 transition-all"></textarea>
            </div>

            {/* 3. BÖLÜM: RESMİ BELGELER */}
            <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-[2.5rem] shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Resmi Belgeler</h3>
                {!belge && <button type="button" onClick={() => belgeRef.current.click()} className="text-emerald-600 font-bold">+ Belge Ekle</button>}
              </div>
              {belge ? (
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border">
                  <div className="font-bold text-slate-700">{belge.name}</div>
                  <button type="button" onClick={belgeSil} className="text-red-500 font-bold">Sil</button>
                </div>
              ) : (
                <div onClick={() => belgeRef.current.click()} className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center cursor-pointer hover:bg-slate-50">Belge yüklemek için tıklayın</div>
              )}
            </div>

            {/* 4. BÖLÜM: PORTFOLYO */}
            <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-[2.5rem] shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Gecmis Islerim (Portfolyo)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {portfolyo && portfolyo.map((foto) => {
                  // Django'dan sızabilecek kaçış tırnaklarını temizleyen en yalın satır
                  let temizUrl = foto.url;
                  if (typeof temizUrl === 'string') {
                    temizUrl = temizUrl.replace(/["']/g, '').trim();
                  }

                  return (
                    <div key={foto.id} className="relative aspect-square rounded-2xl overflow-hidden group border">
                      {/* 🚀 Senin orijinal div yapın! Sadece img etiketini düzleştirdik, yerleşim milim oynamaz */}
                      {temizUrl && (
                        <img 
                          src={temizUrl} 
                          alt="Portfolyo" 
                          className="w-full h-full object-cover" 
                          onError={(e) => console.error("Resim render hatası:", temizUrl)}
                        />
                      )}
                      <button 
                        type="button" 
                        onClick={() => fotoSil(foto.id)} 
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
                <div onClick={() => portfolyoFotoRef.current.click()} className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors">
                  <span className="text-2xl text-slate-400">+</span>
                </div>
              </div>
            </div>

            {/* KAYDET BUTONU */}
            <div className="text-right mt-6">
              <button type="submit" disabled={loading} className="w-full md:w-auto px-12 py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25">
                {loading ? <Spinner className="w-5 h-5 border-white" /> : 'Degisiklikleri Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 🔥 ÖNİZLEME MODALI (SADECE WHATSAPP BUTONU İLE) */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-6 md:p-10 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsPreviewOpen(false)} className="absolute top-6 right-6 w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center">✕</button>

            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-10 border-b pb-10 mt-4">
              <div className="relative w-36 h-36 rounded-full border-4 border-slate-50 shadow-xl overflow-hidden shrink-0">
                <Image src={profilFoto} alt="Profil" fill className="object-cover" />
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl font-black text-slate-900 mb-3">{formData.ad}</h2>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                  <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider">
                    {kategoriler.find(k => k.value === formData.kategori)?.label}
                  </span>
                  <span className="bg-slate-50 text-slate-600 px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider">
                    📍 {ilceler.find(i => i.value === formData.ilce)?.label}
                  </span>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl">
                  <p className="text-slate-700 leading-relaxed font-medium">{formData.hakkimda}</p>
                </div>
              </div>
            </div>

            {/* PORTFOLYO ÖNİZLEME */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Ustanin Isleri</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {portfolyo.map((foto) => (
                  <div key={foto.id} className="relative aspect-square rounded-2xl overflow-hidden border">
                    <Image src={foto.url} alt="Portfolyo" fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* 🔥 SADECE WHATSAPP BUTONU 🔥 */}
            <div className="mt-10 flex justify-center">
              {formData.telefon && (
                <a 
                  href={`https://wa.me/90${formData.telefon.replace(/\D/g, '')}?text=${encodeURIComponent('Merhaba, HizmetBul profilinizi inceledim ve hizmetiniz hakkinda bilgi almak istiyorum.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-10 py-5 w-full sm:w-auto min-w-85 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-black text-lg rounded-4xl transition-all shadow-xl shadow-[#25D366]/30 flex items-center justify-center gap-4 hover:-translate-y-1 active:scale-95"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.559 0 11.896-5.335 11.898-11.892a11.81 11.81 0 00-3.48-8.413z"/>
                  </svg>
                  Hemen WhatsApp'tan Yaz
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
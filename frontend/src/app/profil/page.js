"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";
import BackButton from "@/components/ui/BackButton";
import api from "@/lib/api"; // Mühürlü api telsizimiz
import { toast } from "react-hot-toast";

const getInitials = (name) => {
  if (!name) return "U"; // İsim yoksa varsayılan olarak "U" (Usta) bassın
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function UstaProfil() {
  const profilFotoRef = useRef(null);
  const portfolyoFotoRef = useRef(null);
  const belgeRef = useRef(null);

  // 🚀 PROFİL STATE VE YÜKLEME AYARLARI
  const [profileLoading, setProfileLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [profilFotoDosya, setProfilFotoDosya] = useState(null);
  const [profilFoto, setProfilFoto] = useState(null);

  const [portfolyo, setPortfolyo] = useState([]);
  const [belge, setBelge] = useState(null);

  const [profileMessage, setProfileMessage] = useState({ text: "", type: "" });

  const [profileData, setProfileData] = useState({
    ad: "",
    telefon: "",
    kategori: "",
    ilce: "",
    deneyim: "0",
    hakkimda: "",
    email: "", // HTML'deki profileData.email patlamasın diye eklendi
  });

  const [kategoriler, setKategoriler] = useState([{ label: "Kategori Seçin", value: "" }]);
  const [ilceler, setIlceler] = useState([{ label: "İlçe Seçin", value: "" }]);

  // 🚨 MÜHÜR 1: ŞİFRE KARTI İÇİN EKSİK OLAN TÜM STATE'LER EKLENDİ
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ text: "", type: "" });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordData, setPasswordData] = useState({
    mevcutSifre: "",
    yeniSifre: "",
    yeniSifreTekrar: "",
  });

  // 🚀 BACKEND BAĞLANTI: Profil Çekme (GET /api/v1/accounts/me/)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, configRes] = await Promise.all([
          api.get("/accounts/me/"),
          api.get("/common/config/"),
        ]);
        const data = profileRes.data;

        const categories = configRes.data?.categories || [];
        const districts = configRes.data?.districts || [];
        setKategoriler([
          { label: "Kategori Seçin", value: "" },
          ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
        ]);
        setIlceler([
          { label: "İlçe Seçin", value: "" },
          ...districts.map((d) => ({ label: d.name, value: String(d.id) })),
        ]);

        setProfileData({
          ad: data.full_name || `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          telefon: data.phone || "",
          email: data.email || "", // Backend'den gelen e-postayı basıyoruz
          kategori: Array.isArray(data.categories) && data.categories.length > 0 
            ? String(data.categories[0].id || data.categories[0]) 
            : "",
          ilce: Array.isArray(data.locations_served) && data.locations_served.length > 0 
            ? String(data.locations_served[0].id || data.locations_served[0]) 
            : "",
          deneyim: String(data.experience_year || "0"),
          hakkimda: data.bio || "",
        });

        if (data.avatar_url) setProfilFoto(data.avatar_url);
        if (Array.isArray(data.work_photos)) {
          setPortfolyo(data.work_photos.map((url, index) => ({ id: index, url, file: null })));
        }
      } catch (err) {
        console.error("Profil çekilemedi:", err);
        toast.error("Profil yüklenemedi");
        setProfileMessage({ text: "Profil bilgileri yüklenemedi.", type: "error" });
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, []);

  // 📸 FOTO SEÇME MANTIĞI
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
      setPortfolyo((prev) => [
        ...prev,
        { id: Date.now(), url: URL.createObjectURL(file), file },
      ]);
    }
  };

  const handleBelgeSec = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBelge({
        name: file.name,
        url: URL.createObjectURL(file),
        file,
      });
    }
  };

  // 💾 BACKEND BAĞLANTI: Profil Güncelleme (PATCH /api/v1/accounts/me/)
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ text: "", type: "" });

    try {
      const data = new FormData();

      const isimParcalari = profileData.ad.trim().split(" ");
      const firstName = isimParcalari[0] || "";
      const lastName = isimParcalari.slice(1).join(" ") || "";

      data.append("first_name", firstName);
      data.append("last_name", lastName);
      data.append("full_name", profileData.ad);
      data.append("phone", profileData.telefon);
      
      if (profilFotoDosya) {
        data.append("avatar", profilFotoDosya); 
      }

      await api.patch("/accounts/me/", data);
      
      toast.success("Profil başarıyla güncellendi!");
      setProfileMessage({ text: "Profil bilgileriniz başarıyla güncellendi.", type: "success" });
    } catch (err) {
      console.error("Güncelleme hatası:", err.response?.data || err.message);
      toast.error("Güncelleme başarısız.");
      setProfileMessage({ text: "Güncelleme sırasında bir hata oluştu.", type: "error" });
    } finally {
      setProfileLoading(false);
    }
  };

// 💾 BACKEND BAĞLANTI: Şifre Güncelleme (Gerçek Rota: /api/v1/accounts/me/)
  // 🚨 MÜHÜR: Olmayan change-password yerine direkt profilin bağlı olduğu rotaya PATCH atıyoruz!
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ text: "", type: "" });

    if (!passwordData.mevcutSifre || !passwordData.yeniSifre || !passwordData.yeniSifreTekrar) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }

    if (passwordData.yeniSifre !== passwordData.yeniSifreTekrar) {
      toast.error("Yeni şifreler uyuşmuyor!");
      setPasswordMessage({ text: "Yeni şifreler birbiriyle uyuşmuyor.", type: "error" });
      return;
    }

    setPasswordLoading(true);

    try {
      // Backend'deki CustomUser veya User modelinin şifre güncelleme alanlarına göre payload
      const payload = {
        password: passwordData.yeniSifre, // Yeni şifreyi gönderiyoruz
        old_password: passwordData.mevcutSifre // Güvenlik doğrulaması için mevcut şifre
      };

      // 🚀 GERÇEK KAPIDAN SIKIYORUZ MERMİYİ: accounts/me/ Rotalarda tanımlı olan yer!
      await api.patch("/accounts/me/", payload);

      toast.success("Şifreniz başarıyla güncellendi!");
      setPasswordMessage({ text: "Şifreniz başarıyla değiştirildi.", type: "success" });
      setPasswordData({ mevcutSifre: "", yeniSifre: "", yeniSifreTekrar: "" });
    } catch (err) {
      console.error("Şifre hatası:", err.response?.data || err.message);
      toast.error(err.response?.data?.detail || "Şifre güncellenemedi.");
      setPasswordMessage({ text: err.response?.data?.detail || "Mevcut şifreniz hatalı veya şifre kriterlere uymuyor.", type: "error" });
    } finally {
      setPasswordLoading(false);
    }
  };
  // 🚨 BURADAN SONRASI (return, divler, JSX tasarımları) TAMAMEN SENİN ORİJİNAL KODUNDUR, DOKUNMADIM.

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          body {
              background-color: #f8fafc;
              background-image: radial-gradient(at 0% 0%, hsla(160, 84%, 39%, 0.05) 0px, transparent 50%),
                                radial-gradient(at 100% 0%, hsla(210, 100%, 50%, 0.03) 0px, transparent 50%);
              background-attachment: fixed;
          }
        `
      }} />

      <div className="min-h-screen py-12 px-4 relative font-sans text-slate-800 selection:bg-emerald-500/20 selection:text-emerald-900 pb-24">
        
        <BackButton className="absolute top-6 left-6 md:top-10 md:left-10 z-50 text-slate-400 hover:text-emerald-600 transition-colors bg-white/50 backdrop-blur-md p-2 rounded-xl shadow-sm border border-slate-100" />

        <div className="max-w-6xl mx-auto pt-16 md:pt-10 relative z-10">
          
          <div className="mb-12 text-center md:text-left md:pl-2">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Hesap Ayarları</h1>
            <p className="text-slate-500 mt-3 text-lg">Kişisel bilgilerinizi ve hesap güvenliğinizi yönetin.</p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* SOL KOLON: STICKY SIDEBAR */}
            <div className="w-full lg:w-1/3 sticky top-8 space-y-6">
              <div className="bg-white rounded-4xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                {/* Kapak Fotoğrafı Alanı */}
                <div className="h-32 bg-linear-to-r from-emerald-500 to-teal-600 relative">
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>
                
                <div className="px-8 pb-8 flex flex-col items-center relative -mt-16 text-center">
                  {/* Avatar */}
                  <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-lg relative group">
                    <div className="w-full h-full bg-linear-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center border border-slate-100 overflow-hidden">
                      <span className="text-4xl font-black text-emerald-600 tracking-tighter">
                        {getInitials(profileData.ad)}
                      </span>
                    </div>
                    {/* Hover Camera Icon */}
                    <div className="absolute inset-1.5 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                  </div>

                  <div className="mt-4 w-full">
                    <h2 className="text-2xl font-bold text-slate-900">{profileData.ad || 'İsimsiz Kullanıcı'}</h2>
                    <p className="text-slate-500 font-medium mt-1">{profileData.email || 'E-posta yükleniyor...'}</p>
                  </div>
                  
                  <div className="mt-6 w-full">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border border-emerald-100 mb-8">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      Onaylı Hesap
                    </div>
                  </div>

                  <Link href="/taleplerim" className="w-full">
                    <button className="w-full group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-bold text-slate-600 transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700">
                      <svg className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                      Taleplerimi Görüntüle
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* SAĞ KOLON: FORMLAR */}
            <div className="w-full lg:w-2/3 space-y-8">
              
              {/* Profil Kartı */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-8 md:p-10 rounded-4xl shadow-xl shadow-slate-200/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-emerald-600 border border-slate-100 shadow-sm">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Kişisel Bilgiler</h2>
                    <p className="text-sm text-slate-500 mt-1">Sistemdeki temel bilgilerinizi buradan güncelleyebilirsiniz.</p>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 ml-1">Ad Soyad</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <input 
                          type="text"
                          value={profileData.ad}
                          onChange={(e) => setProfileData({...profileData, ad: e.target.value})}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 ml-1">Telefon Numarası</label>
                      <div className="relative group">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </div>
                        <input 
                          type="tel"
                          placeholder="05xx xxx xx xx"
                          value={profileData.telefon}
                          onChange={(e) => setProfileData({...profileData, telefon: e.target.value})}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-500 ml-1 flex items-center justify-between">
                      E-posta Adresi 
                      <span className="text-[10px] uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-400">Değiştirilemez</span>
                    </label>
                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                      <input 
                        type="email"
                        value={profileData.email}
                        disabled 
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-100/50 border border-slate-200 rounded-2xl text-slate-500 font-medium cursor-not-allowed"
                      />
                    </div>
                  </div>
                  
                  {profileMessage.text && (
                    <div className={`p-4 rounded-xl text-sm font-medium flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 ${profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                       <div className={`mt-0.5 rounded-full p-1 ${profileMessage.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                         {profileMessage.type === 'success' 
                           ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                           : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                         }
                       </div>
                       <p className="leading-relaxed">{profileMessage.text}</p>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={profileLoading}
                      className={`px-8 py-3.5 font-bold rounded-2xl transition-all shadow-lg transform hover:-translate-y-0.5 active:scale-[0.98] md:w-auto w-full flex items-center justify-center gap-2 ${profileLoading ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20"}`}
                    >
                      {profileLoading ? <Spinner className="w-5 h-5 border-slate-400 border-t-slate-600"/> : 'Değişiklikleri Kaydet'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Şifre Kartı */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-8 md:p-10 rounded-4xl shadow-xl shadow-slate-200/40 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 border border-orange-100 shadow-sm">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Güvenlik ve Şifre</h2>
                    <p className="text-sm text-slate-500 mt-1">Hesabınızı güvende tutmak için şifrenizi güçlü belirleyin.</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Mevcut Şifreniz</label>
                    <div className="relative group">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                        </div>
                      <input 
                        type={showCurrentPw ? "text" : "password"}
                        placeholder="••••••••"
                        value={passwordData.mevcutSifre}
                        onChange={(e) => setPasswordData({...passwordData, mevcutSifre: e.target.value})}
                        className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm"
                        required
                      />
                      <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none">
                        {showCurrentPw ? 
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> : 
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        }
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 ml-1">Yeni Şifre</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <input 
                          type={showNewPw ? "text" : "password"}
                          placeholder="••••••••"
                          value={passwordData.yeniSifre}
                          onChange={(e) => setPasswordData({...passwordData, yeniSifre: e.target.value})}
                          className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm"
                          required
                        />
                         <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none">
                            {showNewPw ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                         </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 ml-1">Yeni Şifre (Tekrar)</label>
                      <div className="relative group">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <input 
                          type={showConfirmPw ? "text" : "password"}
                          placeholder="••••••••"
                          value={passwordData.yeniSifreTekrar}
                          onChange={(e) => setPasswordData({...passwordData, yeniSifreTekrar: e.target.value})}
                          className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm"
                          required
                        />
                         <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none">
                            {showConfirmPw ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                         </button>
                      </div>
                    </div>
                  </div>

                  {passwordMessage.text && (
                    <div className={`p-4 rounded-xl text-sm font-medium flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 ${passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                       <div className={`mt-0.5 rounded-full p-1 ${passwordMessage.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                         {passwordMessage.type === 'success' 
                           ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                           : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                         }
                       </div>
                       <p className="leading-relaxed">{passwordMessage.text}</p>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={passwordLoading}
                      className={`px-8 py-3.5 font-bold rounded-2xl transition-all shadow-sm transform hover:-translate-y-0.5 active:scale-[0.98] md:w-auto w-full flex items-center justify-center gap-2 ${passwordLoading ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-orange-500 hover:text-orange-600"}`}
                    >
                      {passwordLoading ? <Spinner className="w-5 h-5 border-orange-500"/> : 'Şifreyi Güncelle'}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
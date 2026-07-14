"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/ui/BackButton";
// 🚨 lib/api.js dosyasının doğru axios instance'ı olduğundan emin ol
import api from "@/lib/api"; 

export default function UnifiedAuthPage() {
  const router = useRouter();
  
  const [role, setRole] = useState('musteri'); 
  const [step, setStep] = useState('giris');   
  
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSuccess] = useState(false);

const [formData, setFormData] = useState({
  adSoyad: "", 
  telefon_giris: "", // 👈 Giriş ekranı için e-posta yerine bunu kullanacağız
  email: "",         // Kayıt formu için kalabilir
  telefon: "",       // Kayıt formu için
  sifre: "", 
  dogrulamaKodu: "", 
  kategori: "", 
  ilce: ""
});

  const [kategoriler, setKategoriler] = useState([{ label: "Uzmanlık Seçin", value: "" }]);
  const [ilceler, setIlceler] = useState([{ label: "Bölge Seçin", value: "" }]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get("/common/config/");
        const categories = res.data?.categories || [];
        const districts = res.data?.districts || [];
        setKategoriler([
          { label: "Uzmanlık Seçin", value: "" },
          ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
        ]);
        setIlceler([
          { label: "Bölge Seçin", value: "" },
          ...districts.map((d) => ({ label: d.name, value: String(d.id) })),
        ]);
      } catch (err) {
        console.error("Kayıt filtre verileri yüklenemedi:", err);
      }
    };
    fetchConfig();
  }, []);

  const [countdown, setCountdown] = useState(120);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const showFieldError = (field, message) => {
    setFieldErrors(prev => ({ ...prev, [field]: message }));
    setTimeout(() => setFieldErrors(prev => ({ ...prev, [field]: "" })), 4000);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const cleanValue = value.startsWith("0") ? value.substring(1) : value;
    if (cleanValue.length <= 10) {
      handleInputChange('telefon', cleanValue);
    }
  };

// 🔑 1. GİRİŞ (LOGIN) ENTEGRASYONU
// 🔑 1. GİRİŞ (LOGIN) ENTEGRASYONU
const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    try {
      let cleanPhone = formData.telefon_giris.replace(/\D/g, "");

      if (cleanPhone.startsWith("0")) {
        cleanPhone = cleanPhone.substring(1);
      }

      if (!cleanPhone.startsWith("90") && cleanPhone.length === 10) {
        cleanPhone = "90" + cleanPhone;
      }

      const response = await api.post("/accounts/login/", {
        phone: cleanPhone,
        password: formData.sifre
      });

      // Tokenları ve kullanıcıyı kaydet
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("isLoggedIn", "true");

      // Middleware'in okuyabilmesi için cookie set et
      document.cookie = `is_provider=${response.data.user.is_provider}; path=/; max-age=604800`;

      // is_provider'a göre yönlendir
      window.location.href = response.data.user.is_provider ? '/usta' : '/';

    } catch (err) {
      console.error("Giriş Hatası Detayı:", err.response?.data);
      const errorMsg = err.response?.data?.error?.[0] || err.response?.data?.detail || "Giriş başarısız. Telefon veya şifre hatalı.";
      showFieldError("telefon_giris", errorMsg);
    } finally {
      setLoading(false);
    }
  };
  // 📝 2. KAYIT (REGISTER - ADIM 1) ENTEGRASYONU
const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.telefon.length !== 10) {
      showFieldError("telefon", "Lütfen başında 0 olmadan 10 hane girin.");
      return;
    }
    setLoading(true);
    try {
      const nameParts = formData.adSoyad.trim().split(" ");
      const payload = {
        phone: "90" + formData.telefon,
        first_name: nameParts[0] || "",
        last_name: nameParts.slice(1).join(" ") || "",
        email: formData.email,
        password: formData.sifre,
        password_confirm: formData.sifre,
        role: role === 'usta' ? 'MASTER' : 'USER',
      };

      const response = await api.post("accounts/register/", payload);

      setStep('dogrulama');
      startCountdown();
    } catch (err) {
      console.error("Kayıt Hatası:", err.response?.data);
      const errorData = err.response?.data;
      if (errorData?.phone) {
        alert("Bu telefon numarası zaten kayıtlı.");
      } else if (errorData?.email) {
        alert("Bu e-posta adresi zaten kullanımda.");
      } else {
        alert("İşlem başlatılamadı. Lütfen bilgilerinizi kontrol edin.");
      }
    } finally {
      setLoading(false);
    }
};

  const handleVerify = async (e) => {
    e.preventDefault();
    if (formData.dogrulamaKodu.length !== 6) return;
    setLoading(true);
    try {
      const response = await api.post("accounts/verify/", {
        email: formData.email,
        code: formData.dogrulamaKodu
      });

      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("isLoggedIn", "true");

      // Middleware'in okuyabilmesi için cookie set et
      document.cookie = `is_provider=${response.data.user.is_provider}; path=/; max-age=604800`;

      alert("Hesabınız doğrulandı, hoş geldiniz!");

      // is_provider'a göre yönlendir
      window.location.href = response.data.user.is_provider ? '/usta' : '/';
    } catch (err) {
      console.error("Doğrulama Hatası:", err.response?.data);
      alert(err.response?.data?.error || "Kod hatalı veya süresi dolmuş.");
    } finally {
      setLoading(false);
    }
};
 // 📧 4. ŞİFRE SIFIRLAMA ENTEGRASYONU
const handlePasswordReset = async (e) => {
  e.preventDefault();
  setLoading(true);
  setFieldErrors({});

  try {
    // 🚀 Backend'deki yeni endpoint'imize bağlanıyoruz
    const response = await api.post("/accounts/password-reset/", { 
      email: formData.email 
    });

    // Başarılı mesajını göster
    setResetSuccess(true);

    // 3.5 saniye sonra giriş ekranına geri döndür
    setTimeout(() => {
      setStep('giris');
      setResetSuccess(false);
    }, 3500);

  } catch (err) {
    console.error("Şifre Sıfırlama Hatası:", err.response?.data);
    
    // Hata mesajını kullanıcıya göster
    const errorMsg = err.response?.data?.error || "Bir hata oluştu. Lütfen tekrar deneyin.";
    alert(errorMsg);
    
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    let timer;
    if (step === 'dogrulama' && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (countdown === 0) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [countdown, step]);

  const startCountdown = () => {
    setCountdown(120);
    setIsResendDisabled(true);
  };
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
          body {
              background-image: radial-gradient(circle at 50% 0%, #FDFBF7 0%, #FAF7F2 60%, #F5F1EA 100%);
              background-attachment: fixed;
              background-color: #FAF7F2;
          }
        `
      }} />

      <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans py-10 px-4 selection:bg-emerald-500/20 selection:text-emerald-700">
        
        <BackButton className="absolute top-6 left-6 md:top-10 md:left-10 z-50 text-slate-500 hover:text-emerald-500 transition-colors" />
        
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-400 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-300 rounded-full blur-[120px] opacity-20"></div>
        </div>

        {/* ORTAK BOYUT: max-w-md */}
        <div className={`bg-white border border-gray-100 p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.05)] w-full max-w-md relative z-10 my-auto transition-all duration-500 ring-4 ${role === 'usta' ? 'ring-emerald-500/10' : 'ring-transparent'}`}>
          
          {/* HEADER (Role Göre Değişir) */}
          <div className="text-center mb-8 animate-in fade-in duration-300">
            <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                 <span className="material-symbols-outlined text-[20px]">{role === 'usta' ? 'engineering' : 'handyman'}</span>
              </div>
              <span className="text-3xl font-black tracking-tighter text-slate-900">
                {role === 'usta' ? 'Usta' : 'Talep'}<span className="text-emerald-500">{role === 'usta' ? 'Portalı' : 'Sistemi'}</span>
              </span>
            </Link>
            <h2 className="text-sm text-slate-500 font-medium">
                {step === 'giris' && (role === 'usta' ? "Teklif Vermek İçin Giriş Yapın" : "Taleplerinize Ulaşmak İçin Giriş Yapın")}
                {step === 'kayit' && (role === 'usta' ? "Hemen Profilinizi Oluşturun" : "Hizmet Almak İçin Hesap Oluşturun")}
                {step === 'dogrulama' && "Telefonunuzu Doğrulayın"}
                {step === 'sifre_sifirla' && "Şifrenizi Sıfırlayın"}
            </h2>
          </div>

          {/* === 1. GİRİŞ FORMU === */}
          {step === 'giris' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <form onSubmit={handleLogin} className="space-y-5">
                
                {/* TELEFON NUMARASI GİRİŞİ */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">
                    Telefon Numarası
                  </label>
                  <input 
                    type="text" 
                    value={formData.telefon_giris} 
                    onChange={(e) => handleInputChange('telefon_giris', e.target.value)} 
                    className={`w-full p-4 bg-slate-50 border rounded-2xl text-slate-800 font-medium focus:outline-none focus:ring-4 transition-all ${
                      fieldErrors.telefon_giris 
                        ? "border-red-400 focus:ring-red-500/10" 
                        : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10"
                    }`} 
                    placeholder="905XX XXX XX XX" 
                    required 
                  />
                  {fieldErrors.telefon_giris && (
                    <p className="text-red-500 text-xs font-bold mt-1 ml-1">⚠️ {fieldErrors.telefon_giris}</p>
                  )}
                </div>
                
                {/* ŞİFRE GİRİŞİ */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">
                    Şifre
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={formData.sifre} 
                      onChange={(e) => handleInputChange('sifre', e.target.value)} 
                      className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" 
                      placeholder="••••••••" 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-emerald-500 transition-colors"
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  
                  {/* ŞİFREMİ UNUTTUM */}
                  <div className="flex justify-end mt-2 mr-1">
                    <button 
                      type="button" 
                      onClick={() => setStep('sifre_sifirla')} 
                      className="text-xs font-bold text-emerald-500 hover:text-emerald-600 transition-colors"
                    >
                      Şifremi Unuttum
                    </button>
                  </div>
                </div>

                {/* GİRİŞ BUTONU */}
                <button 
                  type="submit" 
                  disabled={loading} 
                  className={`w-full py-4 font-bold rounded-2xl transition-all shadow-lg transform hover:-translate-y-0.5 active:scale-[0.98] mt-4 ${
                    loading 
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" 
                      : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25"
                  }`}
                >
                  {loading ? "Giriş Yapılıyor..." : (role === 'usta' ? "Usta Olarak Giriş Yap" : "Giriş Yap")}
                </button>
              </form>

              {/* KAYIT OLMAYA YÖNLENDİRME */}
              <div className="mt-8 text-center border-t border-slate-100 pt-6">
                <p className="text-slate-500 text-sm mb-4">Hesabınız yok mu?</p>
                <button 
                  onClick={() => { setStep('kayit'); setFieldErrors({}); }} 
                  className="text-slate-700 font-bold hover:text-emerald-500 transition-colors border border-slate-200 px-8 py-3 rounded-full inline-block hover:bg-slate-50 shadow-sm"
                >
                  {role === 'usta' ? 'Usta Olarak Kayıt Ol' : 'Müşteri Olarak Kayıt Ol'}
                </button>
              </div>
            </div>
          )}

          {/* === YENİ: ŞİFRE SIFIRLAMA FORMU === */}
          {step === 'sifre_sifirla' && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              {resetSent ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl">mark_email_read</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Talimatlar Gönderildi!</h3>
                  <p className="text-sm text-slate-500">E-posta adresinizi kontrol ederek şifrenizi yenileyebilirsiniz.</p>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-6">
                  <p className="text-xs text-slate-500 font-medium leading-relaxed text-center px-4 mb-2">
                    Kayıtlı e-posta adresinizi girin, size şifre sıfırlama bağlantısını içeren bir e-posta gönderelim.
                  </p>
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">E-posta Adresiniz</label>
                    <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" placeholder="ornek@email.com" required />
                  </div>
                  <button type="submit" disabled={loading} className={`w-full py-4 font-bold rounded-2xl transition-all shadow-lg transform hover:-translate-y-0.5 active:scale-[0.98] ${loading ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25"}`}>
                    {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
                  </button>
                  <div className="text-center mt-4">
                    <button type="button" onClick={() => setStep('giris')} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                      Giriş Ekranına Dön
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* === 2. KAYIT FORMU === */}
          {step === 'kayit' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <form onSubmit={handleRegister} className="space-y-4">
                <div id="recaptcha-container" className="flex justify-center my-2"></div>
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">{role === 'usta' ? 'Firma / Ad Soyad' : 'Ad Soyad'}</label>
                  <input type="text" value={formData.adSoyad} onChange={(e) => handleInputChange('adSoyad', e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" placeholder="Ahmet Yılmaz" required />
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Telefon Numarası</label>
                  <div className={`flex items-center bg-slate-50 border rounded-2xl transition-all focus-within:ring-4 ${fieldErrors.telefon ? "border-red-400 focus-within:ring-red-500/10" : "border-slate-200 focus-within:border-emerald-500 focus-within:ring-emerald-500/10"}`}>
                    <span className="px-4 text-slate-400 font-bold border-r border-slate-200 bg-white rounded-l-2xl py-4">+90</span>
                    <input type="tel" value={formData.telefon} onChange={handlePhoneChange} className="w-full p-4 bg-transparent text-slate-800 font-medium focus:outline-none" placeholder="5XX XXX XX XX" required />
                  </div>
                  {fieldErrors.telefon && <p className="text-red-500 text-xs font-bold mt-1 ml-1 animate-pulse">⚠️ {fieldErrors.telefon}</p>}
                </div>

                {/* SADECE USTA İÇİN GÖRÜNEN KISIM */}
                {role === 'usta' && (
                  <div className="flex gap-3">
                      <div className="relative flex-1">
                        <select value={formData.kategori} onChange={(e) => handleInputChange('kategori', e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 appearance-none cursor-pointer text-sm" required>
                          {kategoriler.map((kat, i) => <option key={i} value={kat.value} disabled={kat.value===""}>{kat.label}</option>)}
                        </select>
                      </div>
                      <div className="relative flex-1">
                        <select value={formData.ilce} onChange={(e) => handleInputChange('ilce', e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 appearance-none cursor-pointer text-sm" required>
                          {ilceler.map((ilce, i) => <option key={i} value={ilce.value} disabled={ilce.value===""}>{ilce.label}</option>)}
                        </select>
                      </div>
                  </div>
                )}

                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">E-posta</label>
                  <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" placeholder="ornek@email.com" required />
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Şifre Belirleyin</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={formData.sifre} onChange={(e) => handleInputChange('sifre', e.target.value)} className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" placeholder="••••••••" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-emerald-500">
                      <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading || formData.telefon.length !== 10} className={`w-full py-4 font-bold rounded-2xl transition-all shadow-lg transform hover:-translate-y-0.5 active:scale-[0.98] mt-2 ${loading || formData.telefon.length !== 10 ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25"}`}>
                  {loading ? "İşleniyor..." : "Kayıt Ol ve Doğrula"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-500 text-sm">Zaten hesabınız var mı?{' '}
                  <button type="button" onClick={() => { setStep('giris'); setFieldErrors({}); }} className="text-emerald-600 font-bold hover:text-emerald-500 border-b-2 border-emerald-200 hover:border-emerald-500 pb-0.5">
                    Giriş Yap
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* === 3. E-POSTA DOĞRULAMA FORMU === */}
            {step === 'dogrulama' && (
              <div className="animate-in fade-in zoom-in-95 duration-500 ease-out">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-emerald-100 rotate-3">
                    <span className="material-symbols-outlined text-4xl">mail</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">E-posta Doğrulama</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Kod şuraya gönderildi:<br/>
                    <span className="font-semibold text-slate-800 break-all">{formData.email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                  <div className="relative">
                    <input 
                      type="text" 
                      maxLength="6" 
                      value={formData.dogrulamaKodu} 
                      onChange={(e) => handleInputChange('dogrulamaKodu', e.target.value.replace(/\D/g, ""))} 
                      placeholder="000000" 
                      className="w-full text-center text-3xl tracking-[0.8em] pl-[0.8em] py-5 bg-slate-50 border border-slate-200 rounded-2xl font-black focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-200" 
                      required 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading || formData.dogrulamaKodu.length !== 6} 
                    className={`w-full py-4 font-bold rounded-2xl transition-all shadow-lg transform hover:-translate-y-0.5 active:scale-[0.98] ${
                      loading || formData.dogrulamaKodu.length !== 6 
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" 
                        : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                    }`}
                  >
                    {loading ? "Doğrulanıyor..." : "Hesabı Onayla"}
                  </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-50">
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleRegister}
                      disabled={isResendDisabled} 
                      className={`text-sm font-bold transition-colors ${
                        isResendDisabled 
                          ? "text-slate-300 cursor-not-allowed" 
                          : "text-emerald-600 hover:text-emerald-700"
                      }`}
                    >
                      {isResendDisabled 
                        ? `Yeni kod için bekleyin (${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')})` 
                        : "Kod gelmedi mi? Tekrar gönder"}
                    </button>
                    
                    <button 
                      onClick={() => setStep('kayit')} 
                      className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      E-posta adresini değiştir
                    </button>
                  </div>
                </div>
              </div>
            )}
                      {/* 🔥 İŞTE O ŞIK GEÇİŞ KARTLARI (Sadece 'Giriş' Ekranında Görünür) 🔥 */}
          {step === 'giris' && (
            <div className="mt-8 pt-6 border-t border-slate-100 animate-in fade-in duration-500">
              
              {/* Müşteri İken Usta Kartını Göster */}
              {role === 'musteri' && (
                <button onClick={() => { setRole('usta'); setFieldErrors({}); }} className="w-full group flex items-center gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-500 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">engineering</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">Uzman mısınız?</p>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700">Teklif Vermek İçin Giriş Yapın</p>
                  </div>
                  <div className="text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">
                    <span className="material-symbols-outlined">arrow_forward_ios</span>
                  </div>
                </button>
              )}

              {/* Usta İken Müşteri Kartını Göster */}
              {role === 'usta' && (
                <button onClick={() => { setRole('musteri'); setFieldErrors({}); }} className="w-full group flex items-center gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-blue-500 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">person</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-blue-600 transition-colors">Hizmet mi arıyorsunuz?</p>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">Müşteri Olarak Giriş Yapın</p>
                  </div>
                  <div className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                    <span className="material-symbols-outlined">arrow_forward_ios</span>
                  </div>
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ResetPasswordConfirmPage() {
  const params = useParams(); // URL'deki uid ve token'ı buradan alıyoruz
  const router = useRouter();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // UI Geliştirmesi: Şifre Göster/Gizle
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Şifreler eşleşmiyor!");
      return;
    }

    setLoading(true);
    try {
      // Django tarafındaki PasswordResetConfirmView'a gidiyoruz
      await api.post("/accounts/password-reset-confirm/", {
        uid: params.uid,
        token: params.token,
        password: password
      });

      alert("Şifreniz başarıyla değiştirildi!");
      router.push("/auth"); // Giriş sayfasına yönlendir
    } catch (err) {
      alert("Hata: Bağlantı geçersiz veya süresi dolmuş.");
    } finally {
      setLoading(false);
    }
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
        
        {/* ARKA PLAN EFEKTLERİ */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-400 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-300 rounded-full blur-[120px] opacity-20"></div>
        </div>

        {/* ANA KART */}
        <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.05)] w-full max-w-md relative z-10 my-auto animate-in fade-in zoom-in-95 duration-500">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <span className="material-symbols-outlined text-[32px]">lock_reset</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Yeni Şifre Belirle</h2>
            <p className="text-slate-500 text-sm font-medium">
              Hesabınızın güvenliği için güçlü bir şifre oluşturun.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* YENİ ŞİFRE */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Yeni Şifre</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-emerald-500 transition-colors"
                >
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* ŞİFRE TEKRAR */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Şifre Tekrar</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
              {/* Eşleşmeme Durumu Görsel Uyarısı */}
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-red-500 text-xs font-bold mt-2 ml-1 animate-pulse">
                  ⚠️ Şifreler birbiriyle eşleşmiyor
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (confirmPassword.length > 0 && password !== confirmPassword)}
              className={`w-full py-4 font-bold rounded-2xl transition-all shadow-lg transform mt-6 flex justify-center items-center gap-2
                ${loading || (confirmPassword.length > 0 && password !== confirmPassword) 
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" 
                  : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25 hover:-translate-y-0.5 active:scale-[0.98]"
                }`}
            >
              {loading ? (
                "Güncelleniyor..."
              ) : (
                <>
                  Şifreyi Güncelle
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </>
  );
}
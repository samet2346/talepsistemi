"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "./Button";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // İleride bunu AuthContext üzerinden çekeceğiz, şimdilik localStorage
    // 🔥 DÜZELTME 1: "aktifKullanici" yerine "kullanici" arıyoruz
    const aktifStr = localStorage.getItem("kullanici");
    if (aktifStr) setUser(JSON.parse(aktifStr));
  }, []);

  const handleLogout = () => {
    // 🔥 DÜZELTME 2: Çıkış yaparken doğru anahtarı (kullanici) siliyoruz
    localStorage.removeItem("kullanici");
    setUser(null);
    router.push("/giris");
  };

  // 🔥 DÜZELTME 3: Giriş sayfasında rolü "rol" olarak kaydetmiştik ("role" değil)
  const isUsta = user?.rol === "usta";

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO */}
          {/* shrink-0 ekledik ki mobilde sağ taraftaki butonlar logoyu sıkıştırıp bükmesin */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tighter">
              <span className="text-blue-500">Talep</span>Sistemi
            </span>
          </Link>

          {/* LİNKLER */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/nasil-calisir" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Nasıl Çalışır?</Link>
            {!user && <Link href="/ustalar-icin" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Ustalar İçin</Link>}
            
            {/* Giriş Yapmış Kullanıcı Linkleri */}
            {user && !isUsta && (
              <Link href="/taleplerim" className="text-sm font-bold text-blue-400 hover:text-blue-300">Taleplerim</Link>
            )}
            {user && isUsta && (
              <Link href="/usta/talepler" className="text-sm font-bold text-emerald-400 hover:text-emerald-300">Açık Talepler</Link>
            )}
          </div>

          {/* AKSİYON ALANI */}
          {/* gap-2'den başlatıp masaüstünde gap-4 yaparak küçük ekranlarda butonların çarpışmasını önledik */}
          <div className="flex items-center gap-2 sm:gap-4">
            {!user ? (
              <>
                <Link href="/giris" className="text-xs sm:text-sm font-bold text-white hover:text-blue-400 transition-colors px-1">Giriş Yap</Link>
                <Link href="/kayit" className="shrink-0">
                  {/* Butonun iç padding değerlerini responsive yaptık, küçük ekranda kibar durur, masaüstünde orijinal py-2 px-5 boyutuna büyür */}
                  <Button variant="primary" className="py-1.5 px-3.5 md:py-2 md:px-5 text-xs sm:text-sm">Kayıt Ol</Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2.5 sm:gap-4">
                <Link href={isUsta ? "/usta/profil" : "/profil"} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-white text-sm sm:text-base font-bold hover:border-blue-500 transition-colors shrink-0">
                  {/* 🔥 DÜZELTME 4: Girişte isim değil email kaydettiğimiz için, email'in ilk harfini gösteriyoruz */}
                  {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                </Link>
                <button onClick={handleLogout} className="text-xs sm:text-sm text-red-400 hover:text-red-300 font-medium px-1">Çıkış</button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
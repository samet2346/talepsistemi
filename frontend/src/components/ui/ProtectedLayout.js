"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "./Spinner"; // Daha önce oluşturduğun Spinner'ı kullanıyoruz

export default function ProtectedLayout({ children, allowedRoles = [] }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. Kullanıcı giriş yapmış mı kontrolü
    const aktifKullaniciStr = localStorage.getItem("aktifKullanici");
    
    if (!aktifKullaniciStr) {
      router.push("/giris");
      return;
    }

    const aktifKullanici = JSON.parse(aktifKullaniciStr);
    
    // Varsayılan rol ataması (API bağlanana kadar test edebilmen için)
    // Eğer kullanıcının rolü yoksa onu "musteri" kabul ediyoruz.
    const userRole = aktifKullanici.role || "musteri"; 

    // 2. Rol kontrolü (Eğer izin verilen roller dizisi doluysa ve kullanıcının rolü bu dizide yoksa)
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      router.push("/yetkisiz");
      return;
    }

    // Her şey tamamsa içeriği göster
    setIsAuthorized(true);
  }, [router, allowedRoles]);

  // Kontrol aşamasındayken ekranda loading spinner gösteriyoruz
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900">
        <Spinner className="w-10 h-10 border-blue-500 mb-4" />
        <p className="text-slate-400 text-sm animate-pulse">Yetki kontrolü yapılıyor...</p>
      </div>
    );
  }

  // Yetki varsa sayfayı bas
  return <>{children}</>;
}
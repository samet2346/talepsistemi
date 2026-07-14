import { NextResponse } from 'next/server';

export function middleware(request) {
  // 1. GÜVENLİK BAŞLIKLARI (Header Hardening - Madde 10)
  const headers = new Headers(request.headers);
  const response = NextResponse.next({
    request: {
      headers: headers,
    },
  });

  // Clickjacking Koruması (Siteyi iframe içine alıp hacklemeyi engeller)
  response.headers.set('X-Frame-Options', 'DENY');
  // MIME-Sniffing Koruması
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // Referrer Gizliliği
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // İçerik Güvenlik Politikası (CSP) - Sadece güvenilir kaynaklardan script çalıştırır
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    frame-src https://www.google.com/recaptcha/;
    upgrade-insecure-requests;
  `;
  response.headers.set('Content-Security-Policy', cspHeader.replace(/\s{2,}/g, ' ').trim());

  // 2. ROTA KORUMASI (httpOnly Cookie Kontrolü)
  // Kullanıcının yetki token'ı var mı kontrol ediyoruz. (Backend'den httpOnly olarak gelecek)
  const token = request.cookies.get('auth_token')?.value;
  const path = request.nextUrl.pathname;

  // Sadece giriş yapmış kullanıcıların görebileceği rotalar (Müşteri & Usta Panelleri)
  const isProtectedRoute = path.startsWith('/talep') || 
                           path.startsWith('/taleplerim') || 
                           path.startsWith('/profil') || 
                           path.startsWith('/bildirimler') ||
                           path.startsWith('/usta');

  // Sadece giriş yapmamış kişilerin görebileceği rotalar (Giriş/Kayıt)
  const isAuthRoute = path.startsWith('/giris') || path.startsWith('/kayit');

  if (isProtectedRoute && !token) {
    // Korumalı sayfaya tokensız (giriş yapmadan) girmeye çalışanı login'e at
    const url = new URL('/giris', request.url);
    url.searchParams.set('hata', 'yetkisiz');
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && token) {
    // Zaten giriş yapmış biri tekrar giriş/kayıt sayfasına gitmeye çalışırsa panele at
    // Not: Gerçek senaryoda tokendan rolü (usta/müşteri) çözüp ona göre yönlendirmek gerekir.
    // Şimdilik varsayılan olarak profil'e atıyoruz.
    return NextResponse.redirect(new URL('/profil', request.url));
  }

  return response;
}

// Middleware'in çalışacağı rotaları belirliyoruz (Statik dosyalar ve API hariç her yerde çalışsın)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
"use client";

import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';

export default function UstalarIcinAdisyon() {
  // 🔴 TEK GİRİŞ SAYFASI LİNKİ (Kendi sayfa adına göre burayı güncelleyebilirsin)
  const girisSayfasi = "/giris"; 

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          body {
              background-image: radial-gradient(circle at 50% 0%, #FDFBF7 0%, #FAF7F2 60%, #F5F1EA 100%);
              background-attachment: fixed;
              background-color: #FAF7F2;
          }
        `
      }} />

      <div className="min-h-screen relative font-sans selection:bg-emerald-500/20 selection:text-emerald-700 overflow-hidden pb-20">
        
        {/* ARKA PLAN EFEKTLERİ */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-emerald-400 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-blue-300 rounded-full blur-[120px] opacity-10"></div>
        </div>

        {/* ÜST MENÜ BÖLÜMÜ / GERİ BUTONU */}
        <div className="pt-6 px-4 md:pt-10 md:px-10 max-w-7xl mx-auto relative z-20 flex justify-between items-center">
           <BackButton className="text-slate-500 hover:text-emerald-500 transition-colors" />
           
           {/* 1. YÖNLENDİRME: ÜST MENÜ */}
           <Link href={girisSayfasi} className="hidden sm:flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-xl hover:bg-emerald-100 transition-colors">
              Giriş Yap / Kayıt Ol
           </Link>
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-10 md:pt-16 relative z-10">
          
          {/* HERO (KARŞILAMA) BÖLÜMÜ */}
          <div className="text-center max-w-4xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white border border-emerald-100 rounded-full shadow-sm">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Yeni Nesil İş Bulma Platformu</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-tight">
              Müşteri Aramaya Son.<br/>
              İşler <span className="text-emerald-500">Telefonunuza Gelsin.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
              Komisyon yok, gizli ücret yok. Profilinizi oluşturun, bölgenizdeki iş taleplerine teklif verin ve müşterilerle doğrudan WhatsApp üzerinden anlaşın.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              
              {/* 2. YÖNLENDİRME: ANA EKRAN BUTONU */}
              <Link href={girisSayfasi}>
                <button className="w-full sm:w-auto px-10 py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-1 active:scale-95">
                  Ücretsiz Profil Oluştur
                </button>
              </Link>

              <Link href="/ustalar">
                <button className="w-full sm:w-auto px-10 py-5 bg-white border border-slate-200 text-slate-700 font-bold text-lg rounded-2xl hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm">
                  Diğer Ustaları İncele
                </button>
              </Link>
            </div>
          </div>

          {/* AVANTAJLAR (NEDEN BİZ?) BÖLÜMÜ */}
          <div className="mb-24">
            <h2 className="text-3xl font-black text-slate-900 text-center mb-12">Neden HizmetBul?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                  <span className="text-2xl">💸</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Sıfır Komisyon</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Kazancınızın tamamı size aittir. Yaptığınız işlerden veya müşterilerle anlaştığınız tutarlardan kesinlikle komisyon kesintisi yapmayız.
                </p>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Doğrudan İletişim</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Aracıları ortadan kaldırıyoruz. Müşteriler profilinizdeki WhatsApp butonu ile tek tıkla doğrudan size ulaşabilir ve işi bağlayabilirsiniz.
                </p>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 border border-purple-100">
                  <span className="text-2xl">📁</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Güçlü Portfolyo</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Kendi vitrininizi yaratın. Geçmiş işlerinizi, sertifikalarınızı ve müşteri yorumlarınızı sergileyerek güven verin, daha çok iş alın.
                </p>
              </div>
            </div>
          </div>

          {/* NASIL ÇALIŞIR BÖLÜMÜ */}
          <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 relative overflow-hidden mb-20 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
            
            <h2 className="text-3xl font-black text-white text-center mb-16">Sistem Nasıl Çalışır?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
              <div className="text-center relative">
                <div className="w-20 h-20 bg-slate-800 text-emerald-400 rounded-4xl flex items-center justify-center text-3xl font-black mx-auto mb-6 border-2 border-slate-700 shadow-lg relative z-10">1</div>
                <h3 className="text-xl font-bold text-white mb-3">Kaydınızı Tamamlayın</h3>
                <p className="text-slate-400 font-medium">Uzmanlık alanınızı, bölgenizi ve portfolyonuzu ekleyerek profesyonel vitrininizi saniyeler içinde oluşturun.</p>
                <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-slate-700 border-dashed border-t-2 border-slate-700"></div>
              </div>

              <div className="text-center relative">
                <div className="w-20 h-20 bg-slate-800 text-emerald-400 rounded-4xl flex items-center justify-center text-3xl font-black mx-auto mb-6 border-2 border-slate-700 shadow-lg relative z-10">2</div>
                <h3 className="text-xl font-bold text-white mb-3">Talepleri İnceleyin</h3>
                <p className="text-slate-400 font-medium">Bölgenizdeki müşterilerin oluşturduğu iş talepleri ekranınıza düşsün. Size en uygun olanları seçin.</p>
                <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-slate-700 border-dashed border-t-2 border-slate-700"></div>
              </div>

              <div className="text-center relative">
                <div className="w-20 h-20 bg-emerald-500 text-white rounded-4xl flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg shadow-emerald-500/30 relative z-10">3</div>
                <h3 className="text-xl font-bold text-white mb-3">Teklif Verin & İşi Alın</h3>
                <p className="text-slate-400 font-medium">Talebe özel fiyat ve süre teklifinizi iletin. WhatsApp üzerinden müşteriyle anlaşıp işe hemen başlayın.</p>
              </div>
            </div>
          </div>

          {/* ALT CTA (ÇAĞRI) BÖLÜMÜ */}
          <div className="text-center bg-white border border-gray-100 rounded-[2.5rem] p-10 md:p-16 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.05)]">
             <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Kazancınızı Katlamaya Hazır Mısınız?</h2>
             <p className="text-lg text-slate-500 font-medium mb-8 max-w-xl mx-auto">
                Hemen şimdi yüzlerce ustanın arasına katılın ve çevrenizdeki iş fırsatlarını kaçırmayın.
             </p>
             
             {/* 3. YÖNLENDİRME: EN ALT BUTON */}
             <Link href={girisSayfasi}>
                <button className="px-10 py-5 bg-slate-900 hover:bg-slate-800 text-white font-black text-lg rounded-2xl transition-all transform hover:-translate-y-1 shadow-lg">
                  Hemen Sisteme Giriş Yapın
                </button>
             </Link>
          </div>

        </div>
      </div>
    </>
  );
}
"use client";

import Container from "@/components/ui/Container";
import BackButton from "@/components/ui/BackButton";
import Link from "next/link";

export default function Hakkimizda() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
          
          body {
              background-image: radial-gradient(circle at 50% 0%, #FDFBF7 0%, #FAF7F2 60%, #F5F1EA 100%);
              background-attachment: fixed;
              background-color: #FAF7F2;
          }
        `
      }} />

      <div className="min-h-screen relative font-body text-slate-700 py-20 px-4 selection:bg-emerald-500/20 selection:text-emerald-700">
        
        {/* 📍 SOL ÜST KÖŞEDEKİ GERİ DÖN BUTONU */}
        <BackButton className="absolute top-6 left-6 md:top-10 md:left-10 z-50 text-slate-500 hover:text-emerald-600 transition-colors" />
        
        {/* 📍 Arka Plan Efektleri */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-400/20 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-300/20 rounded-full blur-[120px] opacity-60"></div>
        </div>

        <Container className="relative z-10 flex flex-col items-center justify-center">
          <div className="max-w-5xl mx-auto w-full pt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* 🔥 ANA İÇERİK KARTI */}
            <div className="bg-white border border-gray-100 p-8 md:p-14 lg:p-20 rounded-[3rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden">
              
              {/* Kart İçi Dekoratif Elementler */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-emerald-50 to-transparent rounded-bl-full -z-10 opacity-70"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-linear-to-tr from-blue-50 to-transparent rounded-tr-full -z-10 opacity-70"></div>

              {/* 1. BÖLÜM: VİZYON VE HİKAYE */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[11px] font-bold tracking-wider uppercase mx-auto border border-emerald-100 shadow-sm mb-6">
                  Hikayemiz
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight font-display mb-8 leading-[1.15]">
                  Hizmet Sektörünü <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-emerald-600">Yeniden Tasarlıyoruz.</span>
                </h1>
                
                <div className="space-y-6 text-slate-500 leading-relaxed text-lg font-medium text-center max-w-3xl mx-auto">
                  <p>
                    Geleneksel pazar yerlerinin karmaşık ve yüksek komisyonlu yapısını yıkmak için yola çıktık. Amacımız; hizmet verenlerin emeğini koruyan, hizmet alanların ise en kaliteli sonuca en şeffaf şekilde ulaşmasını sağlayan yepyeni bir dijital ekosistem yaratmak.
                  </p>
                  <p>
                    <strong className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md">Açık eksiltme</strong> tabanlı yenilikçi sistemimizle rekabeti herkes için adil kılıyor, gizli maliyetleri ortadan kaldırarak güveni yeniden inşa ediyoruz.
                  </p>
                </div>
              </div>
              
              {/* 2. BÖLÜM: YENİ NESİL İSTATİSTİK KARTLARI (3'lü Simetrik Yapı) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20 relative">
                <div className="absolute top-1/2 left-0 w-full h-px bg-linear-to-r from-transparent via-slate-200 to-transparent -z-10 hidden sm:block"></div>
                
                <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 group cursor-default relative overflow-hidden">
                  <div className="w-16 h-16 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-5 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-emerald-50 transition-all duration-300">
                    <span className="material-symbols-outlined text-[32px]">sentiment_very_satisfied</span>
                  </div>
                  <h4 className="text-slate-900 font-black text-4xl md:text-5xl mb-2 font-display group-hover:text-emerald-500 transition-colors">10k+</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mutlu Müşteri</p>
                </div>
                
                <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 group cursor-default relative overflow-hidden">
                  <div className="w-16 h-16 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-5 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-emerald-50 transition-all duration-300">
                    <span className="material-symbols-outlined text-[32px]">engineering</span>
                  </div>
                  <h4 className="text-slate-900 font-black text-4xl md:text-5xl mb-2 font-display group-hover:text-emerald-500 transition-colors">5k+</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Uzman Usta</p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 group cursor-default relative overflow-hidden">
                  <div className="w-16 h-16 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-5 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-emerald-50 transition-all duration-300">
                    <span className="material-symbols-outlined text-[32px]">category</span>
                  </div>
                  <h4 className="text-slate-900 font-black text-4xl md:text-5xl mb-2 font-display group-hover:text-emerald-500 transition-colors">50+</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hizmet Alanı</p>
                </div>
              </div>

              {/* 3. BÖLÜM: DEĞERLERİMİZ (Kullanıcıya Güven Veren Alan) */}
              <div className="mb-16">
                <div className="text-center mb-10">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight font-display mb-3">Temel Değerlerimiz</h3>
                  <p className="text-slate-500 font-medium">Bizi biz yapan, standartlarımızı belirleyen prensipler.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex gap-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                    <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex shrink-0 items-center justify-center text-emerald-500 shadow-sm">
                      <span className="material-symbols-outlined text-[28px]">shield_lock</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-extrabold text-slate-900 mb-2">Tam Şeffaflık</h4>
                      <p className="text-sm font-medium text-slate-500 leading-relaxed">Sürpriz maliyetler veya gizli ücretler yok. Verilen teklifler, komisyon oranları ve işin kapsamı herkes için açık ve nettir.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                    <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex shrink-0 items-center justify-center text-emerald-500 shadow-sm">
                      <span className="material-symbols-outlined text-[28px]">balance</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-extrabold text-slate-900 mb-2">Adil Ekosistem</h4>
                      <p className="text-sm font-medium text-slate-500 leading-relaxed">Platformumuzda öne çıkmak sadece reklamla değil, iş kalitesi ve dürüst fiyatlandırma ile mümkündür.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. BÖLÜM: CALL TO ACTION (Harekete Geçirici Mesaj) */}
              <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[80px] opacity-40"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-40"></div>
                
                <h3 className="text-2xl md:text-3xl font-black text-white mb-4 relative z-10">Bu Hikayenin Bir Parçası Olun</h3>
                <p className="text-slate-300 font-medium mb-8 max-w-lg mx-auto relative z-10">
                  İster işinizi büyütmek isteyen bir uzman, ister evine değer katmak isteyen bir müşteri olun. Platformumuza katılın.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                  <Link href="/giris" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95">
                    Hizmet Talebi Oluştur
                  </Link>
                  <Link href="/giris" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700 active:scale-95">
                    Uzman Olarak Katıl
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
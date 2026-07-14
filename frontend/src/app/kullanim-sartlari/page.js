"use client";

import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';

export default function KullanimSartlari() {
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

      <div className="min-h-screen pt-16 pb-20 relative font-sans selection:bg-emerald-500/20 selection:text-emerald-700">
        
        {/* ARKA PLAN EFEKTLERİ */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-400 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-300 rounded-full blur-[120px] opacity-20"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          
          {/* GERİ DÖN BUTONU */}
          <BackButton className="mb-8 text-slate-500 hover:text-emerald-500 transition-colors" />

          {/* BAŞLIK BÖLÜMÜ */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter">
              Kullanıcı Sözleşmesi ve <span className="text-emerald-500">Gizlilik</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium">
              Platformumuzu kullanarak aşağıdaki şartları kabul etmiş sayılırsınız. Lütfen dikkatlice okuyunuz.
            </p>
          </div>

          {/* SÖZLEŞME METNİ KARTI */}
          <div className="bg-white border border-gray-100 p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.05)] space-y-10">
            
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-lg">1</div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Kabul ve Değişiklik Hakları</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium pl-13">
                Sitemizi veya aplikasyonumuzu kullanarak ve üye olarak işbu Kullanıcı Sözleşmesi'nin tüm içeriğini anladığınızı ve onayladığınızı beyan etmiş olursunuz. Platform yönetimi, teknik zaruretler veya mevzuata uyum amacıyla bu sözleşmeyi tek taraflı olarak değiştirme hakkına sahiptir. Yenilenmiş güncel sözleşme, platformda yayınlandığı andan itibaren tüm kullanıcılar için geçerli olacaktır.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-lg">2</div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Üyelik ve Hesap Güvenliği</h2>
              </div>
              <ul className="list-disc text-slate-600 leading-relaxed font-medium pl-18 space-y-2 marker:text-emerald-500">
                <li>Platforma üyelik tamamen ücretsizdir ve şifrenin korunması doğrudan kullanıcının kendi sorumluluğundadır.</li>
                <li>Hesabın kötü niyetle kullanılması durumunda doğacak idari veya adli cezalardan üye sorumludur.</li>
                <li>Üye olabilmek ve hizmet talebi oluşturabilmek için en az 18 yaşında olmak (reşit olmak) gerekmektedir.</li>
                <li>Kullanıcı hesapları, profiller ve üyelik hakları hiçbir şekilde üçüncü şahıslara devredilemez.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-lg">3</div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Tarafların Rolü ve Ücretlendirme</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium pl-13 mb-4">
                Platformumuz, Hizmet Alan ile Usta'yı bir araya getiren bağımsız bir pazaryeridir ve yüklenen içeriklerin doğruluğunu garanti etmekle yükümlü değildir.
              </p>
              <ul className="list-disc text-slate-600 leading-relaxed font-medium pl-18 space-y-2 marker:text-emerald-500">
                <li>Usta, projelere teklif vererek işi belirtilen bedel üzerinden yapmayı taahhüt etmiş sayılır.</li>
                <li>Ücret konusu tamamen Usta ile Hizmet Alan arasındadır; platformun bu konuda herhangi bir rolü veya sorumluluğu bulunmamaktadır.</li>
                <li>Olası anlaşmazlıklarda taraflar platformdan herhangi bir maddi tazminat talebinde bulunamazlar.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-lg">4</div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Değerlendirme Sistemi ve Manipülasyon</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium pl-13">
                Kullanıcı Profili Değerlendirme Sistemi, güvenli bir ticaret ortamı sağlamak için oluşturulmuştur. Kullanıcılar yorum eklerken hukuki sorumluluğu tamamen kendileri üstlenir. Herhangi bir yöntemle bu değerlendirme sistemini manipüle eden kullanıcıların üyeliklerine geçici veya kalıcı olarak son verilebilir ve oluşan zararlar tazmin edilebilir.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-lg">5</div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Fesih ve Hesabın Askıya Alınması</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium pl-13">
                Platform kurallarının ihlal edilmesi, sistem işleyişinin manipüle edilmesi, başkalarının haklarına tecavüz edilmesi veya profilin üçüncü şahıslara devredilmesi gibi durumlarda platform; tek taraflı olarak sözleşmeyi feshedebilir, hesabı askıya alabilir veya kullanımı durdurabilir.
              </p>
            </section>

            {/* SON BİLGİ */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Son Güncelleme: <span className="text-slate-600">Mayıs 2026</span>
              </p>
              <Link href="/giris">
                <button className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95">
                  Okudum ve Kabul Ediyorum
                </button>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
"use client";

import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';

export default function GizlilikPolitikasi() {
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
              Gizlilik <span className="text-emerald-500">Politikası</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium">
              Platformumuzda bilgilerinizin nasıl işlendiği ve korunduğuna dair tüm yasal detaylar aşağıda yer almaktadır.
            </p>
          </div>

          {/* SÖZLEŞME METNİ KARTI */}
          <div className="bg-white border border-gray-100 p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.05)] space-y-10">
            
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-lg shrink-0">1</div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Kullanıcı Bilgilerinin İşlenmesi ve Muhafazası</h2>
              </div>
              <ul className="list-disc text-slate-600 leading-relaxed font-medium pl-18 space-y-2 marker:text-emerald-500">
                <li>Biusta, Kullanıcılara ait gizli bilgileri, Kullanıcı Sözleşmesi'nde aksine müsaade edilen durumlar haricinde, üçüncü kişi ve kurumlara kullandırmaz.</li>
                <li>Biusta, Site'de/Aplikasyon'da yer alan Kullanıcı bilgilerini veya üyeliğe ilişkin Kullanıcı bilgilerini, Kullanıcı güvenliği, kendi yükümlülüğünü ifa ve bazı istatistiki değerlendirmeler için dilediği biçimde kullanabilir.</li>
                <li>Biusta, toplanan bu bilgileri bir veritabanı üzerinde tasnif edip muhafaza edebilir.</li>
                <li>Kullanıcılar ve Biusta hukuken bağımsız taraflardır ve aralarında ortaklık, temsilcilik veya işçi-işveren ilişkisi yoktur.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-lg shrink-0">2</div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Veri Sahipliği ve Üçüncü Kişilerle Paylaşım</h2>
              </div>
              <ul className="list-disc text-slate-600 leading-relaxed font-medium pl-18 space-y-2 marker:text-emerald-500">
                <li>Biusta, Web Sitesi'nin/Aplikasyon'un kullanılması ile oluşacak tüm verilerin fikri haklarına sahiptir.</li>
                <li>Biusta, söz konusu bilgilerle Kullanıcı bilgilerini açıklamaksızın demografik bilgiler içeren raporlar düzenleyebilir veya bu tarz bilgileri veya raporları kendisi kullanabilir.</li>
                <li>Oluşturulan bu rapor ve/veya istatistikleri iş ortakları ile üçüncü kişilerle bedelli veya bedelsiz paylaşabilir.</li>
                <li>Yürürlükteki emredici mevzuat hükümleri gereğince veya diğer Kullanıcılar ile üçüncü şahısların haklarının ihlal edildiğinin iddia edilmesi durumlarında, Biusta'nın kendisine ait gizli/özel/ticari bilgileri resmi makamlara ve hak sahibi kişilere açıklamaya yetkili olacağını Kullanıcı kabul eder.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-lg shrink-0">3</div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Hesap Güvenliği ve Kullanıcı Sorumlulukları</h2>
              </div>
              <ul className="list-disc text-slate-600 leading-relaxed font-medium pl-18 space-y-2 marker:text-emerald-500">
                <li>Web Sitesi'ne/Aplikasyon'a üyelik ücretsizdir ve şifrenin belirlenmesi ve korunması kullanıcının kendi sorumluluğundadır.</li>
                <li>Kullanıcıların sisteme erişim araçlarının (Kullanıcı adı, şifre vb.) güvenliği, saklanması, üçüncü kişilerin bilgisinden uzak tutulması ve kullanılması durumlarıyla ilgili hususlar tamamen Kullanıcıların sorumluluğundadır.</li>
                <li>Üye hesabının kendi kusuru nedeniyle başka kişiler tarafından kötü niyetle kullanılmasından doğrudan Kullanıcı sorumludur.</li>
                <li>Kullanıcı profilini başkasına devreden veya kullanıma açan Kullanıcı, Biusta'nın Kullanıcı Sözleşmesi'ni feshetme ve üyeliğine son verme hakkı bulunduğunu kabul eder.</li>
                <li>Kullanıcılar, üçüncü kişilerin haklarına tecavüz eden ve/veya etme tehlikesi bulunan fiillerde bulunmamalıdır.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-lg shrink-0">4</div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Çerez (Cookie) Kullanımı</h2>
              </div>
              <ul className="list-disc text-slate-600 leading-relaxed font-medium pl-18 space-y-2 marker:text-emerald-500">
                <li>Çerezler, içeriği ve reklamları kişiselleştirmek, sosyal medya özellikleri sağlamak ve trafiğimizi analiz etmek için kullanılmaktadır.</li>
                <li>"Kabul Et" seçeneği ile tüm çerezleri kabul edebilir veya "Çerez Ayarları" seçeneği ile ayarları düzenleyebilirsiniz.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-lg shrink-0">5</div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">İçerik Kontrolü ve Dış Bağlantılar</h2>
              </div>
              <ul className="list-disc text-slate-600 leading-relaxed font-medium pl-18 space-y-2 marker:text-emerald-500">
                <li>Biusta, Kullanıcılar tarafından yüklenen bilgi ve içeriklerin doğruluğunu araştırma ve hukuka uygun olduğunu garanti etmekle yükümlü değildir.</li>
                <li>Biusta, kendi kontrolünde olmayan üçüncü kişilerin sahip olduğu ve işlettiği başka web sitelerine veya içeriklere 'link' verebilir; bu sitelerin içeriklerinden Biusta sorumlu tutulamaz.</li>
                <li>Kullanıcılar tarafından yüklenmiş içeriklerden 5651 sayılı Yasa'nın 4. Maddesine göre hukuki ve cezai olarak Kullanıcılar sorumludur.</li>
              </ul>
            </section>

            {/* SON BİLGİ VE ONAY */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Yasal Dayanak: <span className="text-slate-600">Gizlilik Politikası</span>
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
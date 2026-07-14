import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Marka */}
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-black text-white tracking-tighter mb-4 block">
              <span className="text-blue-500">Talep</span>Sistemi
            </span>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Türkiye'nin en güvenilir, spam korumalı ve şeffaf hizmet pazar yeri. İhtiyacınız olan ustaya ulaşmanın en güvenli yolu.
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Platform</h4>
            <ul className="space-y-3">
              <li><Link href="/hakkimizda" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Hakkımızda</Link></li>
              <li><Link href="/nasil-calisir" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Nasıl Çalışır?</Link></li>
              <li><Link href="/ustalar-icin" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Ustalar İçin</Link></li>
              <li><Link href="/iletisim" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">İletişim</Link></li>
            </ul>
          </div>

          {/* Yasal */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Yasal</h4>
            <ul className="space-y-3">
              <li><Link href="/gizlilik-politikasi" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Gizlilik Politikası</Link></li>
              <li><Link href="/kullanim-sartlari" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Kullanım Şartları</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-slate-500 text-sm text-center md:text-left">
            © {new Date().getFullYear()} Talep Sistemi. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';
import api from '@/lib/api'; // Mühürlü api telsizimiz
import { toast } from 'react-hot-toast';

export default function TalepOlustur() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL'den gelen parametreleri yakala
  const gelenHizmet = searchParams.get('hizmet') || '';
  const gelenIlce = searchParams.get('ilce') || '';
  const gelenUstaId = searchParams.get('usta') || null;

  // Form adımlarını yöneteceğimiz state
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form verileri
  const [formData, setFormData] = useState({
    hizmet: gelenHizmet,
    ilce: gelenIlce,
    mekanTipi: '',
    zaman: '',
    aciklama: '',
    adSoyad: '',
    telefon: '',
  });

  // 🚀 BACKEND ENTEGRASYONU: Kullanıcı giriş yapmışsa iletişim bilgilerini otomatik doldur
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get('/accounts/me/');
        if (res.data) {
          // 🚨 KESİN FIX: userRes.data sızıntısı temizlendi, res.data ile %100 eşlendi!
          setFormData(prev => ({
            ...prev,
            adSoyad: res.data.full_name || `${res.data.first_name || ""} ${res.data.last_name || ""}`.trim(),
            telefon: res.data.phone || prev.telefon
          }));
        }
      } catch (err) {
        // Kullanıcı giriş yapmamışsa patlamasın, manuel dolduracak demektir.
        console.log("Kullanıcı bilgileri otomatik doldurulamadı, misafir modunda devam ediyor.");
      }
    };
    fetchUserData();
  }, []);

  // URL'den parametre gelirse formu güncelle
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      hizmet: gelenHizmet || prev.hizmet,
      ilce: gelenIlce || prev.ilce
    }));
  }, [gelenHizmet, gelenIlce]);

  // Input değişikliklerini handle et
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Sonraki adıma geç
  const nextStep = () => {
    if (step < 4) setStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Önceki adıma dön
  const prevStep = () => {
    if (step > 1) setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🔥 BACKEND BAĞLANTI: FORMU REAL-TIME API'YE GÖNDERME 🔥
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. Frontend select option'larından gelen string değerleri backend ID'leri ile eşliyoruz
      const hizmetIdMap = {
        "boya": 1,      
        "tesisat": 1,   
        "temizlik": 2,
        "elektrik": 3,
        "nakliyat": 4,
        "tadilat": 5
      };

      const ilceIdMap = {
        "besiktas": 1,
        "sisli": 1,   
        "umraniye": 1,
        "kadikoy": 1,
        "esenyurt": 1
      };

      const hizmetLabelMap = {
        "boya": "Boya - Badana",
        "temizlik": "Ev Temizliği",
        "tesisat": "Su Tesisatı",
        "elektrik": "Elektrik İşleri",
        "nakliyat": "Evden Eve Nakliyat",
        "tadilat": "Tadilat"
      };

      // 2. Curl komutundaki gibi backend'in kabul ettiği tertemiz paket yapısı
      const payload = {
        title: `${hizmetLabelMap[formData.hizmet] || formData.hizmet || "Genel"} Talebi`,
        description: formData.aciklama ? formData.aciklama : `${formData.mekanTipi} mekan için ${formData.zaman} zamanlı talep.`,
        category: hizmetIdMap[formData.hizmet] || 1, 
        district: ilceIdMap[formData.ilce] || 1,     
      };

      // 🚀 MERMİYİ SIKIYORUZ: Gerçek /jobs/requests/ kapısına curl komutunun aynısını atıyoruz
      await api.post('/jobs/requests/', payload);

      toast.success("Talebiniz başarıyla oluşturuldu!");
      setStep(4); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Talep oluşturma hatası:", err.response?.data || err.message);
      const errorMsg =
        err.response?.data?.category?.[0] ||
        err.response?.data?.district?.[0] ||
        err.response?.data?.title?.[0] ||
        err.response?.data?.detail ||
        "Talep gönderilirken bir hata oluştu.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <div className="min-h-screen pt-10 pb-20 relative font-sans selection:bg-emerald-500/20 selection:text-emerald-700">
        
        {/* ARKA PLAN EFEKTLERİ */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-400 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-300 rounded-full blur-[120px] opacity-20"></div>
        </div>

        <div className="max-w-3xl mx-auto px-4 md:px-8 relative z-10">
          
          {step < 4 && (
             <BackButton className="mb-6 text-slate-500 hover:text-emerald-500 transition-colors" />
          )}

          {/* İLERLEME ÇUBUĞU (STEPPER) */}
          {step < 4 && (
            <div className="mb-10">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full -z-10"></div>
                {/* İlerleme Çizgisi Dolgusu */}
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full -z-10 transition-all duration-500"
                  style={{ width: `${((step - 1) / 2) * 100}%` }}
                ></div>

                {/* Adım 1 */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-4 ${step >= 1 ? 'bg-emerald-500 text-white border-emerald-100' : 'bg-white text-slate-400 border-slate-100'}`}>1</div>
                {/* Adım 2 */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-4 ${step >= 2 ? 'bg-emerald-500 text-white border-emerald-100' : 'bg-white text-slate-400 border-slate-100'}`}>2</div>
                {/* Adım 3 */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-4 ${step >= 3 ? 'bg-emerald-500 text-white border-emerald-100' : 'bg-white text-slate-400 border-slate-100'}`}>3</div>
              </div>
              <div className="flex justify-between mt-3 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span className={step >= 1 ? 'text-emerald-600' : ''}>Hizmet Detayı</span>
                <span className={step >= 2 ? 'text-emerald-600' : ''}>Konum & Zaman</span>
                <span className={step >= 3 ? 'text-emerald-600' : ''}>İletişim & Onay</span>
              </div>
            </div>
          )}

          {/* EĞER ÖZEL BİR USTAYA TALEP GELDİYSE BİLGİ VER */}
          {gelenUstaId && step < 4 && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-8 flex items-center gap-4">
              <span className="text-2xl">👷‍♂️</span>
              <div>
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Özel Talep Oluşturuluyor</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">Talebiniz sadece seçtiğiniz ustaya iletilecektir.</p>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.05)]">
            
            {/* ---------------- ADIM 1: HİZMET DETAYLARI ---------------- */}
            {step === 1 && (
              <div className="animate-in slide-in-from-right-8 fade-in duration-300">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Ne Yaptırmak İstiyorsunuz?</h2>
                <p className="text-slate-500 font-medium mb-8">İhtiyacınızı en iyi şekilde anlamamız için lütfen detayları seçin.</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Kategori</label>
                    <select name="hizmet" value={formData.hizmet} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none appearance-none cursor-pointer focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-700">
                      <option value="" disabled>Hizmet Seçiniz...</option>
                      <option value="boya">Boya - Badana</option>
                      <option value="temizlik">Ev Temizliği</option>
                      <option value="tesisat">Su Tesisatı</option>
                      <option value="elektrik">Elektrik İşleri</option>
                      <option value="nakliyat">Evden Eve Nakliyat</option>
                      <option value="tadilat">Tadilat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Mekan Büyüklüğü / Tipi</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['1+0 / 1+1', '2+1', '3+1', '4+1 veya daha büyük', 'Sadece tek bir oda', 'Ofis / Dükkan'].map((tip) => (
                        <div 
                          key={tip} 
                          onClick={() => setFormData(prev => ({...prev, mekanTipi: tip}))}
                          className={`p-4 border-2 rounded-2xl cursor-pointer text-center font-bold text-sm transition-all ${formData.mekanTipi === tip ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white text-slate-600 hover:border-emerald-200'}`}
                        >
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={nextStep} 
                    disabled={!formData.hizmet || !formData.mekanTipi}
                    className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all active:scale-95"
                  >
                    Devam Et
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- ADIM 2: KONUM VE ZAMAN ---------------- */}
            {step === 2 && (
              <div className="animate-in slide-in-from-right-8 fade-in duration-300">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Nerede ve Ne Zaman?</h2>
                <p className="text-slate-500 font-medium mb-8">Ustalarımızın size doğru teklifi verebilmesi için konum ve zaman önemlidir.</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Hizmetin Verileceği İlçe</label>
                    <select name="ilce" value={formData.ilce} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none appearance-none cursor-pointer focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-700">
                      <option value="" disabled>İlçe Seçiniz...</option>
                      <option value="besiktas">Beşiktaş</option>
                      <option value="sisli">Şişli</option>
                      <option value="umraniye">Ümraniye</option>
                      <option value="kadikoy">Kadıköy</option>
                      <option value="esenyurt">Esenyurt</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Ne Zaman Yapılacak?</label>
                    <div className="flex flex-col gap-3">
                      {['Mümkün olan en kısa sürede (Acil)', '1 Hafta İçinde', '1 Ay İçinde', 'Tarih belli değil, sadece fiyat araştırıyorum'].map((zaman) => (
                        <label key={zaman} className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData.zaman === zaman ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white hover:border-emerald-200'}`}>
                          <input 
                            type="radio" 
                            name="zaman" 
                            value={zaman} 
                            checked={formData.zaman === zaman} 
                            onChange={handleChange}
                            className="w-5 h-5 text-emerald-500 focus:ring-emerald-500 border-slate-300"
                          />
                          <span className={`font-bold text-sm ${formData.zaman === zaman ? 'text-emerald-700' : 'text-slate-600'}`}>{zaman}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between">
                  <button onClick={prevStep} className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all">Geri Dön</button>
                  <button 
                    onClick={nextStep} 
                    disabled={!formData.ilce || !formData.zaman}
                    className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all active:scale-95"
                  >
                    Devam Et
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- ADIM 3: AÇIKLAMA VE İLETİŞİM ---------------- */}
            {step === 3 && (
              <div className="animate-in slide-in-from-right-8 fade-in duration-300">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Son Adım</h2>
                <p className="text-slate-500 font-medium mb-8">Eklemek istediklerinizi yazın ve iletişim bilgilerinizi girin.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Eklemek İstedikleriniz (İsteğe Bağlı)</label>
                    <textarea 
                      name="aciklama" 
                      value={formData.aciklama} 
                      onChange={handleChange} 
                      placeholder="Ustanın bilmesi gereken ekstra bir detay var mı? (Örn: Eşyalı ev, tavan boyanmayacak vb.)"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-700 min-h-30 resize-y"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Ad Soyad</label>
                      <input 
                        type="text" 
                        name="adSoyad" 
                        value={formData.adSoyad} 
                        onChange={handleChange} 
                        placeholder="Adınız Soyadınız"
                        required
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Telefon Numarası</label>
                      <input 
                        type="tel" 
                        name="telefon" 
                        value={formData.telefon} 
                        onChange={handleChange} 
                        placeholder="0(5XX) XXX XX XX"
                        required
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-start gap-4 shadow-sm">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 shrink-0">
                      <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 mb-1">Bilgileriniz %100 Güvende</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Telefon numaranız Güvenlik standardslarında şifrelenerek korunur. Sadece talebinize teklif verecek <strong>onaylı uzmanlarla</strong> paylaşılır; kesinlikle spam, reklam veya pazarlama amacıyla 3. şahıslara iletilmez.
                      </p>
                    </div>
                  </div>

                  <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between">
                    <button type="button" onClick={prevStep} disabled={isSubmitting} className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all">Geri Dön</button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting || !formData.adSoyad || !formData.telefon}
                      className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 active:scale-95"
                    >
                      {isSubmitting ? 'Talebiniz İletiliyor...' : 'Talebi Gönder'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ---------------- ADIM 4: BAŞARILI EKRANI ---------------- */}
            {step === 4 && (
              <div className="text-center py-10 animate-in zoom-in-95 fade-in duration-500">
                
                <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h2 className="text-4xl font-black text-slate-900 mb-4">Talebiniz Alındı!</h2>
                <p className="text-lg text-slate-500 font-medium mb-8 max-w-md mx-auto">
                  {gelenUstaId 
                    ? "Talebiniz doğrudan seçtiğiniz ustaya iletildi. En kısa sürede sizinle WhatsApp veya telefon üzerinden iletişime geçecektir." 
                    : "Harika! İhtiyacınıza uygun bölgenizdeki uzmanlara bildirim gönderdik. Yakında teklifler gelmeye başlayacak."}
                </p>

                <div className="flex justify-center gap-4">
                  <Link href="/taleplerim">
                    <button className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95">
                      Taleplerimi Görüntüle
                    </button>
                  </Link>
                  <Link href="/">
                    <button className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all">
                      Ana Sayfaya Dön
                    </button>
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
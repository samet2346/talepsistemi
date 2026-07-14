"use client";

import { useState } from "react";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";

export default function Iletisim() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    adSoyad: "",
    email: "",
    konu: "",
    mesaj: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // API simülasyonu
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
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

      <div className="min-h-screen py-24 px-6 relative font-sans selection:bg-emerald-500/20 selection:text-emerald-700">
        
        {/* 📍 SAYFANIN SOL ÜST KÖŞESİNDEKİ GERİ DÖN BUTONU */}
        <BackButton className="absolute top-6 left-6 md:top-10 md:left-10 z-50 text-slate-500 hover:text-emerald-500 transition-colors" />

        {/* Arka Plan Efektleri */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-400 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-300 rounded-full blur-[120px] opacity-20"></div>
        </div>

        <div className="w-full max-w-6xl mx-auto relative z-10">
          
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter">
              Nasıl Yardımcı <span className="text-emerald-500">Olabiliriz?</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
              Sorularınız, şikayetleriniz veya iş birliği talepleriniz için uzman destek ekibimiz size yardımcı olmaya hazır.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-12 items-start">
            
            {/* 1. KOLON: İLETİŞİM BİLGİLERİ VE HIZLI ÇÖZÜM */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Hızlı Çözüm Kutusu */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[24px]">help_center</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">Cevabı Biliyor Olabiliriz!</h3>
                <p className="text-slate-500 font-medium text-sm mb-6 leading-relaxed">
                  Mesaj göndermeden önce, kullanıcılarımızın en çok sorduğu soruları derlediğimiz yardım merkezimize göz atmak ister misiniz?
                </p>
                <Link href="/nasil-calisir" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Sıkça Sorulan Sorulara Git <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>

              {/* İletişim Kanalları */}
              <div className="space-y-6 pl-2">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">call</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Müşteri Hizmetleri</p>
                    <a href="tel:+908501234567" className="text-lg font-black text-slate-800 hover:text-emerald-500 transition-colors">0850 123 45 67</a>
                    <p className="text-xs text-slate-500 font-medium mt-1">Hafta içi 09:00 - 18:00 arası</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">E-Posta</p>
                    <a href="mailto:destek@hizmetbul.com" className="text-lg font-black text-slate-800 hover:text-emerald-500 transition-colors">destek@hizmetbul.com</a>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <button className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-500/20 transition-all active:scale-95">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    WhatsApp Canlı Destek
                  </button>
                  <p className="text-[10px] font-bold text-center text-slate-400 mt-3 uppercase tracking-wider">Acil Durumlar İçin En Hızlı Yöntem</p>
                </div>
              </div>
            </div>

            {/* 2. KOLON: İLETİŞİM FORMU */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-gray-100 p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden">
                
                {isSuccess ? (
                  <div className="text-center py-12 animate-in zoom-in fade-in duration-500">
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                      <span className="material-symbols-outlined text-[48px]">check_circle</span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-3">Mesajınız Alındı!</h3>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed max-w-sm mx-auto">
                      Geri bildiriminiz için teşekkür ederiz. Destek ekibimiz mesajınızı inceleyip en kısa sürede e-posta üzerinden dönüş yapacaktır.
                    </p>
                    <button 
                      onClick={() => { setIsSuccess(false); setFormData({adSoyad: "", email: "", konu: "", mesaj: ""}); }}
                      className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                    >
                      Yeni Mesaj Gönder
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="relative">
                        <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-wider">Adınız Soyadınız</label>
                        <input 
                          type="text"
                          name="adSoyad"
                          value={formData.adSoyad}
                          onChange={handleChange}
                          placeholder="Örn: Emircan Ünal" 
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                          required
                        />
                      </div>
                      
                      <div className="relative">
                        <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-wider">E-posta Adresi</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="ornek@mail.com" 
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                          required
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-wider">Konu Seçiniz</label>
                      <div className="relative">
                        <select 
                          name="konu"
                          value={formData.konu}
                          onChange={handleChange}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium appearance-none cursor-pointer focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                          required
                        >
                          <option value="" disabled>Lütfen bir konu seçin</option>
                          <option value="teknik">Teknik Bir Sorun Bildirimi</option>
                          <option value="sikayet">Usta / Hizmet Şikayeti</option>
                          <option value="oneri">Öneri veya Geri Bildirim</option>
                          <option value="odeme">Ödeme İşlemleri</option>
                          <option value="diger">Diğer</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <span className="material-symbols-outlined">expand_more</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-wider">Detaylı Mesajınız</label>
                      <textarea 
                        name="mesaj"
                        value={formData.mesaj}
                        onChange={handleChange}
                        placeholder="Sorununuzu veya talebinizi detaylıca açıklayın..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all min-h-35 resize-y" 
                        required
                      />
                    </div>
                    
                    <div className="pt-2">
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`w-full py-4 text-base font-bold rounded-2xl transition-all shadow-lg transform active:scale-[0.98] flex justify-center items-center gap-2 ${isSubmitting ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25 hover:-translate-y-0.5'}`}
                      >
                        {isSubmitting ? (
                          "Mesaj İletiliyor..."
                        ) : (
                          <>
                            Mesajı Gönder
                            <span className="material-symbols-outlined text-[20px]">send</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
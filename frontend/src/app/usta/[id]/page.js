"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import BackButton from "@/components/ui/BackButton";
import { BIDDING_RULES, REQUEST_STATUS } from "@/utils/constants";

export default function UstaTeklifVer() {
  const params = useParams();
  
  // Yedek kalkan eklendi: REQUEST_STATUS dosyadan gelmezse çökmeyi önler
  const [request, setRequest] = useState({
    title: "3+1 Daire Boya",
    description: "Tüm odalar boyanacak.",
    status: REQUEST_STATUS?.PENDING || "pending",
    customerPhone: null // Madde 9: Başta gizli
  });
  
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");

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

      <div className="min-h-screen py-10 px-4 relative font-sans selection:bg-emerald-500/20 selection:text-emerald-700">
        
        {/* SOL ÜST GERİ DÖN BUTONU */}
        <BackButton className="absolute top-6 left-6 md:top-10 md:left-10 z-50 text-slate-500 hover:text-emerald-500 transition-colors" />

        {/* ARKA PLAN EFEKTLERİ */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-400 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-300 rounded-full blur-[120px] opacity-20"></div>
        </div>

        <div className="max-w-3xl mx-auto pt-16 md:pt-10 relative z-10">
          
          {/* BAŞLIK ALANI */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">
              Teklif <span className="text-emerald-500">Ver</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Müşterinin talebini inceleyin ve rekabetçi teklifinizi iletin.</p>
          </div>

          {/* TALEP ÖZET KARTI */}
          <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.05)] mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{request.title}</h2>
            <p className="text-slate-600 mb-6 font-medium leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
              {request.description}
            </p>
            
            <div className={`p-4 rounded-2xl border font-bold text-sm flex items-center gap-3 ${request.status === (REQUEST_STATUS?.SELECTED || "selected") ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-blue-50 border-blue-100 text-blue-600"}`}>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-lg">
                {request.status === (REQUEST_STATUS?.SELECTED || "selected") ? "📞" : "🔒"}
              </div>
              <div>
                {request.status === (REQUEST_STATUS?.SELECTED || "selected") 
                  ? "Müşteri Telefonu: 0555 *** ** **" 
                  : "Telefon numarası sadece teklifiniz kabul edildiğinde görünür."}
              </div>
            </div>
          </div>

          {/* TEKLİF FORMU KARTI */}
          <form className="bg-white border border-gray-100 p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.05)] space-y-6">
            
            {/* Fiyat Alanı */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Teklif Fiyatınız (₺)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold text-lg placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                  placeholder="0.00"
                  required
                />
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₺</span>
              </div>
            </div>

            {/* Mesaj Alanı */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Mesajınız</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all min-h-30 resize-y"
                placeholder="Müşteriye işi nasıl yapacağınızı ve neden sizi seçmesi gerektiğini anlatın..."
                required
              />
            </div>

            {/* Gönder Butonu */}
            <div className="pt-4">
              <button 
                type="button" 
                className="w-full py-4 text-lg font-bold rounded-2xl transition-all shadow-lg transform hover:-translate-y-0.5 active:scale-[0.98] bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25"
              >
                Teklif Gönder
              </button>
            </div>
            
            {/* Alt Bilgi */}
            <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-4">
              Maksimum {BIDDING_RULES?.MAX_REVISIONS || 3} revize hakkınız vardır.
            </p>

          </form>
        </div>
      </div>
    </>
  );
}
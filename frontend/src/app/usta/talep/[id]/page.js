"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";
import api from "@/lib/api";

// Sabitler dosyadan gelmezse sayfa çökmesin diye yedek (fallback) eklendi
import { REQUEST_STATUS, STATUS_UI, BIDDING_RULES } from "@/utils/constants";

const mapJobToRequest = (job) => ({
  id: String(job.id),
  title: job.title,
  category: job.category_name || "",
  description: job.description || "",
  location: job.district_name || "",
  status: job.status || REQUEST_STATUS?.PENDING || "pending",
  createdAt: job.created_at
    ? new Date(job.created_at).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "",
  customerName: job.owner_name || "Müşteri",
  customerPhone: null,
});

const mapBidToMyOffer = (bid, previousOffer = null) => ({
  id: bid.id,
  price: parseFloat(bid.price),
  duration: bid.estimated_duration,
  message: bid.note,
  revisionCount: previousOffer ? previousOffer.revisionCount + 1 : 0,
  isSelected: bid.status === "ACCEPTED",
});

export default function UstaTalepDetayi() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [request, setRequest] = useState(null);
  const [myOffer, setMyOffer] = useState(null);

  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const talepId = params?.id || "123";

  useEffect(() => {
    const fetchTalep = async () => {
      setLoading(true);
      try {
        const [jobRes, bidsRes] = await Promise.all([
          api.get(`/jobs/requests/${talepId}/`),
          api.get(`/jobs/requests/${talepId}/bids/`),
        ]);

        setRequest(mapJobToRequest(jobRes.data));

        const user = JSON.parse(localStorage.getItem("user") || "null");
        const bids = bidsRes.data?.results || bidsRes.data || [];
        const ownBid = bids.find((b) => b.provider === user?.id);

        if (ownBid) {
          setMyOffer({
            id: ownBid.id,
            price: parseFloat(ownBid.price),
            duration: ownBid.estimated_duration,
            message: ownBid.note,
            revisionCount: 0,
            isSelected: ownBid.status === "ACCEPTED",
          });
        } else {
          setMyOffer(null);
        }
      } catch (err) {
        console.error("Talep detayı yüklenemedi:", err);
        setRequest(null);
        setMyOffer(null);
      } finally {
        setLoading(false);
      }
    };

    if (talepId) fetchTalep();
  }, [talepId]);

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    setError("");

    if (!price || !duration || !message) {
      setError("Lütfen fiyat, süre ve mesaj alanlarını doldurun.");
      return;
    }

    if (myOffer && Number(price) === myOffer.price) {
      setError("Önceki teklifinizle aynı fiyatı veremezsiniz. Lütfen fiyatı güncelleyin.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post(`/jobs/requests/${talepId}/give-offer/`, {
        price: String(price),
        note: message,
        estimated_duration: String(duration),
      });

      setMyOffer(mapBidToMyOffer(res.data, myOffer));
      setPrice("");
      setDuration("");
      setMessage("");
    } catch (err) {
      console.error("Teklif gönderilemedi:", err);
      const apiError =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Teklif gönderilirken bir hata oluştu.";
      setError(typeof apiError === "string" ? apiError : "Teklif gönderilirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]"><Spinner className="w-10 h-10 border-emerald-500" /></div>;
  if (!request) return <div className="min-h-screen flex items-center justify-center text-slate-500 bg-[#FAF7F2] font-medium">Talep bulunamadı.</div>;

  const statusInfo = STATUS_UI?.[request.status] || { label: "Açık", color: "bg-blue-50 text-blue-600 border-blue-200" };
  const remainingRevisions = myOffer ? (BIDDING_RULES?.MAX_REVISIONS || 3) - myOffer.revisionCount : (BIDDING_RULES?.MAX_REVISIONS || 3);
  const isRequestOpen = request.status === (REQUEST_STATUS?.PENDING || "pending") || 
                        request.status === (REQUEST_STATUS?.OFFER_RECEIVED || "offer_received") || 
                        request.status === (REQUEST_STATUS?.OFFER_UPDATED || "offer_updated");

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

      <div className="min-h-screen py-10 font-sans relative overflow-hidden selection:bg-emerald-500/20 selection:text-emerald-700">
        
        {/* ARKA PLAN EFEKTLERİ */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-400 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-300 rounded-full blur-[120px] opacity-20"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* GERİ DÖN LİNKİ */}
          <Link 
            href="/usta/talepler" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors mb-6 group font-bold text-sm uppercase tracking-wider"
          >
            <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </span> 
            Açık Taleplere Dön
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Talep & Teklif Detayı</h1>
          </div>

          {/* MÜŞTERİ VE TALEP BİLGİLERİ KARTI */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-10 mb-8 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wider">
                  {request.category}
                </span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              
              {isRequestOpen ? (
                 <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                   Talep Hala Açık
                 </span>
              ) : (
                 <span className="px-3 py-1 bg-slate-50 text-slate-500 border border-slate-200 text-xs font-bold rounded-full uppercase tracking-wider">
                   Talep Kapandı
                 </span>
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-8 leading-snug">{request.title}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-lg shrink-0 shadow-sm">
                  {request.customerName.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Müşteri</p>
                  <p className="text-sm text-slate-800 font-bold">{request.customerName}</p>
                  <p className="text-xs mt-1 font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg inline-block">
                    {request.customerPhone ? `📞 ${request.customerPhone}` : "🔒 İletişim bilgisi gizli"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-emerald-500 shrink-0 shadow-sm">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bölge & Tarih</p>
                    <p className="text-sm text-slate-800 font-bold">{request.location}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{request.createdAt}</p>
                 </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Talep Detayları</p>
              <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
                {request.description}
              </p>
            </div>
            
            {/* 🔥 YENİ EKLENEN WHATSAPP BUTONU (EĞER MÜŞTERİ NUMARA BIRAKTIYSA) 🔥 */}
            {request.customerPhone && (
              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
                 <a 
                  href={`https://wa.me/90${request.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Merhaba ${request.customerName}, HizmetBul üzerinden oluşturduğunuz "${request.title}" başlıklı talebiniz için iletişime geçiyorum.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 w-full sm:w-auto bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.559 0 11.896-5.335 11.898-11.892a11.81 11.81 0 00-3.48-8.413z"/></svg>
                  Müşteriye WhatsApp'tan Yaz
                </a>
              </div>
            )}
          </div>

          {/* TEKLİF VERME / REVİZE ETME ALANI */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.05)]">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              {myOffer ? "Teklifinizi Revize Edin" : "Bu Talebe Teklif Verin"}
            </h3>

            {myOffer && (
              <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div>
                   <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Mevcut Teklifiniz</p>
                   <p className="text-3xl font-black text-slate-900">{myOffer.price} <span className="text-xl text-slate-500">₺</span></p>
                 </div>
                 <div className="text-right">
                   <span className={`px-4 py-2 rounded-xl text-xs font-bold border ${remainingRevisions === 0 ? "bg-red-50 text-red-600 border-red-200" : "bg-indigo-50 text-indigo-600 border-indigo-200"}`}>
                      Kalan Revize: {remainingRevisions}
                   </span>
                 </div>
              </div>
            )}

            {isRequestOpen && remainingRevisions > 0 ? (
              <form onSubmit={handleSubmitOffer} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* FİYAT */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Teklif Fiyatı (₺)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        placeholder="Örn: 15000" 
                        value={price} 
                        onChange={(e) => setPrice(e.target.value)} 
                        className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                        required
                      />
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₺</span>
                    </div>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1 ml-2">Sistem ücretsizdir, komisyon kesilmez.</p>
                  </div>

                  {/* SÜRE */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Tahmini Süre (Gün)</label>
                    <input 
                      type="number" 
                      placeholder="Örn: 3" 
                      value={duration} 
                      onChange={(e) => setDuration(e.target.value)} 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* MESAJ */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Müşteriye Mesajınız</label>
                  <textarea 
                    placeholder="Neden sizi seçmeli? Malzemeler dahil mi? Detay verin..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all min-h-30 resize-y"
                    required
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-2">
                    🛑 {error}
                  </div>
                )}

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`w-full py-4 text-lg font-bold rounded-2xl transition-all shadow-lg transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 ${isSubmitting ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25"}`}
                  >
                    {isSubmitting ? <Spinner className="w-5 h-5 border-white" /> : (myOffer ? "Teklifimi Güncelle" : "Teklif Gönder")}
                  </button>
                </div>
              </form>
            ) : (
               <div className="text-center py-10 bg-slate-50 rounded-4xl border border-slate-100">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <p className="text-slate-600 font-bold">
                    {remainingRevisions === 0 
                      ? "Maksimum revize hakkınıza ulaştınız. Artık fiyat değiştiremezsiniz." 
                      : "Bu talep artık teklif alımına kapalıdır."}
                  </p>
               </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
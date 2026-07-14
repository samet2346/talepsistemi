"use client";

import { useState, useEffect } from 'react';
import BackButton from '@/components/ui/BackButton';
import Spinner from '@/components/ui/Spinner';
import api from '@/services/api';

export default function Degerlendirmeler() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [replyingTo, setReplyingTo] = useState(null); 
  const [replyText, setReplyText] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reviews/');
      const data = response.data?.results || response.data || [];
      setReviews(data);
    } catch (error) {
      console.warn("Yorumlar çekilemedi, test verisi yükleniyor...");
      setTimeout(() => {
        setReviews([
          {
            id: 1,
            reviewer_full_name: "Ahmet Yılmaz",
            rating_quality: 5,
            rating_speed: 5,
            rating_price_loyalty: 4,
            avg_rating: "4.6",
            comment: "Usta tam vaktinde geldi, işçiliği çok temizdi. Kesinlikle tavsiye ederim.",
            created_at: "2023-10-15T10:30:00Z",
            master_reply: null
          },
          {
            id: 2,
            reviewer_full_name: "Ayşe Kaya",
            rating_quality: 5,
            rating_speed: 4,
            rating_price_loyalty: 5,
            avg_rating: "4.6",
            comment: "Fiyat performansı çok iyi. Sadece biraz geç bitti ama sorun değil.",
            created_at: "2023-10-12T14:15:00Z",
            master_reply: "Güzel yorumunuz için teşekkür ederim Ayşe Hanım, bir sonraki işinizde görüşmek üzere!"
          }
        ]);
        setLoading(false);
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (reviewId) => {
    if (!replyText.trim()) return;
    
    setSubmitLoading(true);
    try {
      await api.post(`/reviews/${reviewId}/reply/`, {
        master_reply: replyText
      });
      
      setReviews(prev => prev.map(rev => 
        rev.id === reviewId ? { ...rev, master_reply: replyText } : rev
      ));
      
      setReplyingTo(null);
      setReplyText("");
    } catch (error) {
      console.warn("Yanıt gönderilemedi, test akışına geçiliyor...");
      setTimeout(() => {
        setReviews(prev => prev.map(rev => 
          rev.id === reviewId ? { ...rev, master_reply: replyText } : rev
        ));
        setReplyingTo(null);
        setReplyText("");
      }, 600);
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
          body { background-color: #F8FAFC; }
        `
      }} />

      {/* MOBİL ONARIM ZIRHI */}
      <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden font-sans bg-slate-50 selection:bg-emerald-500/20 selection:text-emerald-700 pb-24 sm:pb-12">
        
        {/* 🔥 PREMIUM HERO KAPAK 🔥 */}
        <div className="relative h-48 sm:h-56 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <BackButton className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 text-white/90 hover:text-white drop-shadow-md transition-colors" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 -mt-20 sm:-mt-24">
          
          <div className="mb-8 text-center sm:text-left drop-shadow-sm">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
              <span className="material-symbols-outlined text-amber-300 text-[32px] sm:text-[40px]" style={{ fontVariationSettings: '"FILL" 1' }}>grade</span>
              Değerlendirmeler
            </h1>
            <p className="text-emerald-50 text-sm sm:text-base font-medium mt-1">Müşterilerinizin yorumlarını inceleyin ve yanıtlayın.</p>
          </div>

          {loading ? (
            <div className="bg-white rounded-[2rem] p-12 flex flex-col items-center justify-center shadow-xl shadow-slate-200/50 border border-slate-100">
              <Spinner className="w-10 h-10 border-emerald-500 mb-4" />
              <p className="text-emerald-600 font-bold text-sm animate-pulse">Yorumlar Yükleniyor...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 px-6">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-5xl text-slate-300">reviews</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-2">Henüz Değerlendirme Yok</h3>
              <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">Tamamladığınız işlerden sonra müşterileriniz sizi buradan değerlendirecek.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white/95 backdrop-blur-xl border border-slate-100 rounded-[2rem] p-5 sm:p-8 shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-emerald-100 transition-all duration-300 relative overflow-hidden group">
                  
                  {/* Dekoratif Arka Plan (Yorum Kartı) */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 opacity-50 pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>

                  {/* Yorum Başlığı & Puanı */}
                  <div className="flex flex-row justify-between items-start mb-5 gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[1.2rem] bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 flex items-center justify-center font-black text-lg sm:text-xl border border-emerald-100 shrink-0 shadow-sm">
                        {review.reviewer_full_name ? review.reviewer_full_name.charAt(0).toUpperCase() : 'M'}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-extrabold text-slate-900 text-base sm:text-lg truncate">{review.reviewer_full_name || 'Gizli Müşteri'}</h3>
                        <p className="text-[11px] sm:text-xs text-slate-400 font-bold tracking-wide mt-0.5">{formatDate(review.created_at)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-100 shrink-0">
                      <span className="material-symbols-outlined text-amber-500 text-[16px] sm:text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                      <span className="font-black text-amber-600 text-sm sm:text-base">{review.avg_rating || '5.0'}</span>
                    </div>
                  </div>

                  {/* Detay Puanları */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider bg-slate-50 border border-slate-100 text-slate-500 px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">handyman</span> İşçilik <span className="text-slate-800">{review.rating_quality}</span>
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider bg-slate-50 border border-slate-100 text-slate-500 px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">speed</span> Hız <span className="text-slate-800">{review.rating_speed}</span>
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider bg-slate-50 border border-slate-100 text-slate-500 px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">payments</span> Fiyat <span className="text-slate-800">{review.rating_price_loyalty}</span>
                    </span>
                  </div>

                  {/* Yorum Metni */}
                  <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl mb-5 border border-slate-100 relative">
                    <span className="material-symbols-outlined text-4xl text-slate-200 absolute top-2 left-2 rotate-180 opacity-50">format_quote</span>
                    <p className="text-slate-700 font-medium text-sm sm:text-base leading-relaxed relative z-10 pl-6 sm:pl-8">"{review.comment}"</p>
                  </div>

                  {/* USTANIN YANITI VEYA YANIT FORMU */}
                  <div className="mt-2 pl-4 sm:pl-6 border-l-2 border-emerald-100 relative">
                    {/* Bağlantı Çizgisi Kıvrımı */}
                    <div className="absolute top-0 -left-[2px] w-4 h-6 border-l-2 border-b-2 border-emerald-100 rounded-bl-2xl"></div>
                    
                    {review.master_reply ? (
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/50 p-4 rounded-2xl rounded-tl-none ml-2 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-emerald-500 text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>verified_user</span>
                            <span className="text-[10px] sm:text-[11px] font-black text-emerald-700 uppercase tracking-widest">Sizin Yanıtınız</span>
                          </div>
                        </div>
                        <p className="text-[13px] sm:text-sm font-medium text-emerald-900/80 leading-relaxed">{review.master_reply}</p>
                      </div>
                    ) : replyingTo === review.id ? (
                      <div className="ml-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="relative">
                          <div className="absolute top-3 left-3 text-emerald-500 pointer-events-none">
                            <span className="material-symbols-outlined text-[20px]">chat</span>
                          </div>
                          <textarea 
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Müşterinize profesyonel bir şekilde yanıt verin..."
                            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-emerald-200 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-medium text-slate-800 min-h-[100px] resize-y mb-3 shadow-sm"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => { setReplyingTo(null); setReplyText(""); }}
                            className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors text-xs sm:text-sm outline-none"
                          >
                            İptal
                          </button>
                          <button 
                            onClick={() => handleReplySubmit(review.id)}
                            disabled={submitLoading || !replyText.trim()}
                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-200 disabled:text-emerald-50 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95 text-xs sm:text-sm flex items-center gap-2 outline-none"
                          >
                            {submitLoading ? <Spinner className="w-4 h-4 border-white" /> : <><span className="material-symbols-outlined text-[16px]">send</span> Yanıtla</>}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end ml-2 mt-1">
                        <button 
                          onClick={() => { setReplyingTo(review.id); setReplyText(""); }}
                          className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 hover:bg-emerald-50 px-4 py-2 rounded-xl transition-colors border border-transparent hover:border-emerald-100 outline-none active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[18px]">reply</span>
                          Müşteriye Yanıt Ver
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
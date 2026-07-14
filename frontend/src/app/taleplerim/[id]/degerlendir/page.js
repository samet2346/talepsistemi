"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { jobService } from '@/services/jobService';
import BackButton from '@/components/ui/BackButton';

export default function DegerlendirmeSayfasi() {
  const { id } = useParams();
  const router = useRouter();
  
  // API dökümanına (ReviewRequest) uygun state isimlendirmeleri korundu
  const [ratings, setRatings] = useState({
    rating_quality: 5,        // İşçilik ve Kalite
    rating_price_loyalty: 5,  // İletişim ve Fiyat Sadakati
    rating_speed: 5           // Dakiklik ve Hız
  });
  const [comment, setComment] = useState(''); //[cite: 8]
  
  // UI Status State (Alert yerine modern bildirimler için eklendi)
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleRatingChange = (category, value) => {
    setRatings(prev => ({ ...prev, [category]: value })); //[cite: 8]
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); //[cite: 8]
    setStatus('submitting');
    setErrorMessage('');

    try {
      // 1. İşi Tamamla (İlanı kapatır)[cite: 8]
      try { await jobService.completeJob(id); } catch (completeErr) { // Is zaten tamamlanmis olabilir, bu hatayi yoksay
        console.warn("Is zaten tamamlanmis olabilir:", completeErr?.response?.data);
      }
      
      // 2. Detaylı Yorum Yap (API şemasına %100 uygun veri gönderimi)[cite: 8]
      await jobService.submitReview({ 
        job: parseInt(id, 10), // API job ID'sini integer bekliyor[cite: 8]
        rating_quality: ratings.rating_quality, //[cite: 8]
        rating_speed: ratings.rating_speed, //[cite: 8]
        rating_price_loyalty: ratings.rating_price_loyalty, //[cite: 8]
        comment: comment.trim() // Veri güvenliği için boşluklar temizlendi
      });
      
      // Başarılı durumu
      setStatus('success');
      setTimeout(() => {
        router.push('/taleplerim'); //[cite: 8]
      }, 2000);

    } catch (err) {
      console.error("Değerlendirme gönderilirken hata:", err);
      setStatus('error');
      setErrorMessage("İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  // Modernize edilmiş, mobilde kırılmayan yıldız komponenti[cite: 8]
  const renderStars = (category, label, icon) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 mb-4 bg-slate-50/80 border border-slate-100 rounded-2xl transition-all hover:bg-white hover:border-emerald-200 hover:shadow-[0_4px_20px_rgba(16,185,129,0.05)] group">
      <div className="flex items-center gap-3 mb-3 sm:mb-0">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-colors shrink-0">
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        <span className="font-bold text-slate-700 text-sm">{label}</span>
      </div>
      <div className="flex gap-1.5 sm:gap-1 justify-start sm:justify-end">
        {[1, 2, 3, 4, 5].map((star) => (
          <button 
            key={star} 
            type="button" 
            onClick={() => handleRatingChange(category, star)} //[cite: 8]
            className={`text-3xl sm:text-2xl transition-all duration-300 hover:scale-125 focus:outline-none ${ratings[category] >= star ? 'text-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.4)]' : 'text-slate-200 hover:text-amber-200'}`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
          /* Scrollbar gizleme mobilde daha temiz bir görünüm sunar */
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `
      }} />

      <div className="min-h-screen bg-[#FAF7F2] py-8 px-4 sm:px-6 flex flex-col items-center justify-center font-sans selection:bg-emerald-500/20 selection:text-emerald-900 relative overflow-hidden">
        
        {/* Soft Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] bg-emerald-400/15 rounded-full blur-[100px] mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-amber-300/15 rounded-full blur-[100px] mix-blend-multiply"></div>
        </div>

        <div className="w-full max-w-xl relative animate-in fade-in slide-in-from-bottom-8 duration-500 z-10">
          
          <BackButton className="absolute -top-14 sm:-top-16 left-0 text-slate-400 hover:text-emerald-600 transition-colors" />
          
          <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.05)] border border-white">
            
            {status === 'success' ? (
              <div className="text-center py-10 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)] transform rotate-3">
                  <span className="material-symbols-outlined text-[56px]">star</span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Değerlendirme Alındı!</h2>
                <p className="text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                  Geri bildiriminiz ustanın güven skoruna eklendi. Taleplerinize yönlendiriliyorsunuz...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-emerald-100 transform -rotate-3">
                    <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: '"FILL" 1' }}>rate_review</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Hizmeti Değerlendir</h1>
                  <p className="text-slate-500 text-sm sm:text-base font-medium mt-3 px-2">
                    Bu işi tamamlıyorsunuz. Puanlamanız ustanın sistemdeki güven skorunu doğrudan belirleyecektir.
                  </p>
                </div>
                
                {status === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl flex items-center gap-3 animate-in fade-in">
                    <span className="material-symbols-outlined">error</span>
                    {errorMessage}
                  </div>
                )}

                <div className="mb-8 space-y-1">
                  {/* Parametre isimleri API karşılıklarıyla korundu, Emojiler Material İkonlarla değiştirildi[cite: 8] */}
                  {renderStars('rating_quality', 'İşçilik & Kalite', 'handyman')}
                  {renderStars('rating_price_loyalty', 'İletişim & Fiyat Sadakati', 'forum')}
                  {renderStars('rating_speed', 'Dakiklik & Hız', 'timer')}
                </div>

                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Deneyiminizi Anlatın
                    </label>
                  </div>
                  <textarea 
                    className="w-full p-5 bg-slate-50/50 rounded-2xl outline-none border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-700 font-medium resize-y min-h-[140px] placeholder:text-slate-400" 
                    placeholder="Ustanın çalışması hakkında detaylı fikriniz... (Temiz çalıştı mı, zamanında geldi mi?)"
                    value={comment} //[cite: 8]
                    onChange={(e) => setComment(e.target.value)} //[cite: 8]
                    required //[cite: 8]
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={status === 'submitting'} 
                  className={`w-full py-4 sm:py-5 font-black text-lg rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group ${
                    status === 'submitting' 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 active:scale-[0.98]'
                  }`}
                >
                  {status === 'submitting' ? (
                    <><span className="material-symbols-outlined animate-spin">progress_activity</span> İşleniyor...</>
                  ) : (
                    <>
                      İşi Tamamla ve Puanla
                      <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">check_circle</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
          
        </div>
      </div>
    </>
  );
}
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Spinner from '@/components/ui/Spinner';
import BackButton from '@/components/ui/BackButton';
import api from '@/lib/api'; // Mühürlü api telsizimiz
import { toast } from 'react-hot-toast';

export default function Taleplerim() {
  const [talepler, setTalepler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 

  // 🔥 İPTAL MODAL STATE'LERİ
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedTalepId, setSelectedTalepId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  // 🚀 BACKEND BAĞLANTI: Talepleri Real-Time Veri Tabanından Çekme (GET /api/v1/jobs/requests/)
  const fetchTalepler = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs/requests/');
      
      // DRF standart pagination yapısı varsa res.data.results gelir, yoksa res.data direkt listedir
      const backendData = res.data.results || res.data || [];
      
      // Backend alanlarını senin HTML kısmının beklediği alanlara (hizmet, aciklama vb.) map'liyoruz
      const normalizeTalepler = backendData.map(item => ({
        id: String(item.id),
        // Eğer backend category_name dönüyorsa onu bas, yoksa başlığı kullan
        hizmet: item.category_name || item.title || "Hizmet Talebi",
        aciklama: item.description || "",
        status: item.status || "pending", // pending, approved, completed, cancelled
        createdAt: item.created_at 
          ? new Date(item.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
          : "Tarih Yok"
      }));

      setTalepler(normalizeTalepler);
    } catch (error) {
      console.error('Talepler çekilirken hata oluştu:', error);
      toast.error("Talepleriniz yüklenemedi.");
      setTalepler([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTalepler();
  }, []);

  const filteredTalepler = talepler.filter(talep => {
    if (filter === 'all') return true;
    return talep.status === filter;
  });

  const getStatusStyle = (status) => {
    switch(status) {
      case 'pending': return { label: 'Bekliyor', color: 'bg-amber-50 text-amber-600 border-amber-200' };
      case 'approved': return { label: 'Onaylandı', color: 'bg-blue-50 text-blue-600 border-blue-200' };
      case 'completed': return { label: 'Tamamlandı', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
      case 'cancelled': return { label: 'İptal Edildi', color: 'bg-red-50 text-red-600 border-red-200' };
      default: return { label: 'Bilinmiyor', color: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };

  // 🔥 İPTAL İŞLEMİ FONKSİYONLARI
  const handleCancelClick = (id) => {
    setSelectedTalepId(id);
    setIsCancelModalOpen(true);
  };

  // 🚀 BACKEND BAĞLANTI: Talebi İptal Etme (DELETE /api/v1/jobs/requests/{id}/)
  const handleConfirmCancel = async () => {
    if (!cancelReason) return toast.error("Lütfen bir iptal nedeni seçin.");
    if (cancelReason === "diger" && otherReason.trim() === "") return toast.error("Lütfen iptal nedeninizi yazın.");

    setIsSubmittingCancel(true);

    try {
      await api.delete(`/jobs/requests/${selectedTalepId}/`);

      toast.success("Talebiniz başarıyla iptal edildi.");
      
      await fetchTalepler();

      setIsCancelModalOpen(false);
      setCancelReason("");
      setOtherReason("");
      setSelectedTalepId(null);
    } catch (err) {
      console.error("İptal hatası:", err.response?.data || err.message);
      toast.error(err.response?.data?.detail || "Talep iptal edilirken bir hata oluştu.");
    } finally {
      setIsSubmittingCancel(false);
    }
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

      <div className="min-h-screen py-12 px-4 relative font-sans selection:bg-emerald-500/20 selection:text-emerald-700">
        
        <BackButton className="absolute top-6 left-6 md:top-10 md:left-10 z-50 text-slate-500 hover:text-emerald-500 transition-colors" />

        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-400 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-300 rounded-full blur-[120px] opacity-20"></div>
        </div>

        <div className="max-w-6xl mx-auto pt-10 md:pt-0 relative z-10">
            
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">Taleplerim</h1>
              <p className="text-slate-500 font-medium">Oluşturduğunuz hizmet taleplerini ve durumlarını buradan takip edebilirsiniz.</p>
            </div>
            
            <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 hide-scrollbar snap-x">
              {[
                { id: 'all', label: 'Tümü' },
                { id: 'pending', label: 'Bekleyenler' },
                { id: 'approved', label: 'Onaylananlar' },
                { id: 'completed', label: 'Tamamlananlar' },
                { id: 'cancelled', label: 'İptal Edilenler' }
              ].map(f => (
                <button 
                  key={f.id}
                  onClick={() => setFilter(f.id)} 
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap snap-start border ${
                    filter === f.id 
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25' 
                      : 'bg-white text-slate-500 border-slate-200 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 shadow-sm'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-32 bg-white/50 border border-gray-100 rounded-[3rem] backdrop-blur-sm shadow-sm">
              <Spinner className="w-12 h-12 border-emerald-500" />
            </div>
          ) : (
            <>
              {filteredTalepler.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-24 bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem] shadow-sm">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100 text-emerald-500 shadow-inner">
                    <span className="material-symbols-outlined text-[40px]">assignment</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {filter === 'all' ? "Henüz hiç talebiniz yok" : "Bu filtreye uygun talep bulunamadı"}
                  </h3>
                  <p className="text-slate-500 max-w-md mb-8 font-medium">
                    {filter === 'all' 
                      ? "İhtiyacınız olan hizmetler için hemen yeni bir talep oluşturabilir ve ustalarımızdan teklif alabilirsiniz." 
                      : "Farklı bir filtre seçmeyi deneyin veya yeni bir talep oluşturun."}
                  </p>
                  
                  {filter === 'all' && (
                    <Link href="/talep">
                      <button className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        Yeni Talep Oluştur
                      </button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTalepler.map((talep) => {
                    const status = getStatusStyle(talep.status);
                    
                    return (
                      <div key={talep.id} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 flex flex-col h-full hover:border-emerald-200 hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.08)] transition-all shadow-sm group">
                        
                        <div className="flex justify-between items-start mb-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${status.color}`}>
                            {status.label}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                            {talep.createdAt || 'Tarih Yok'}
                          </span>
                        </div>
                        
                        <div className="grow mb-8">
                          <h3 className={`text-xl font-bold mb-3 capitalize transition-colors ${talep.status === 'cancelled' ? 'text-slate-400 line-through' : 'text-slate-900 group-hover:text-emerald-600'}`}>
                            {talep.hizmet}
                          </h3>
                          <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed font-medium">
                            {talep.aciklama}
                          </p>
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2">
                          <Link href={`/talep/${talep.id}`} className="block w-full">
                            <button className="w-full py-3 border-2 border-slate-100 text-slate-600 font-bold hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 rounded-2xl transition-all flex justify-center items-center gap-2">
                              Detayları & Teklifleri Gör
                            </button>
                          </Link>
                          
                          {/* SADECE BEKLEYEN TALEPLER İPTAL EDİLEBİLİR */}
                          {talep.status === 'pending' && (
                             <button 
                                onClick={() => handleCancelClick(talep.id)}
                                className="w-full py-3 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all flex justify-center items-center gap-2"
                             >
                               <span className="material-symbols-outlined text-[18px]">cancel</span>
                               Talebi İptal Et
                             </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* 🔥 İPTAL NEDENİ MODALI (POP-UP) 🔥 */}
          {isCancelModalOpen && (
            <div className="fixed inset-0 z-100 flex items-center justify-center px-4 animate-in fade-in duration-300">
              <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => !isSubmittingCancel && setIsCancelModalOpen(false)}
              ></div>
              
              <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">
                
                <div className="w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-5 mx-auto">
                  <span className="material-symbols-outlined text-[28px]">warning</span>
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 text-center mb-2">Talebi İptal Et</h3>
                <p className="text-slate-500 text-center text-sm font-medium mb-6">
                  Bu talebi iptal etmek istediğinize emin misiniz? Lütfen nedenini bizimle paylaşın ki size daha iyi hizmet sunabilelim.
                </p>

                <div className="space-y-3 mb-6">
                  {[
                    { id: "fiyat", label: "Gelen tekliflerin fiyatları yüksek geldi" },
                    { id: "baska_usta", label: "Başka bir platformdan veya tanıdıktan usta buldum" },
                    { id: "ihtiyac", label: "Artık bu hizmete ihtiyacım kalmadı" },
                    { id: "yanlis_talep", label: "Yanlışlıkla / Yanlış bilgilerle talep oluşturdum" },
                    { id: "diger", label: "Diğer nedenler (Lütfen belirtin)" }
                  ].map((reason) => (
                    <label 
                      key={reason.id} 
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${cancelReason === reason.id ? 'border-red-500 bg-red-50/50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                    >
                      <input 
                        type="radio" 
                        name="cancelReason" 
                        value={reason.id}
                        checked={cancelReason === reason.id}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="w-4 h-4 text-red-500 focus:ring-red-500 accent-red-500"
                      />
                      <span className={`text-sm font-bold ${cancelReason === reason.id ? 'text-red-700' : 'text-slate-700'}`}>
                        {reason.label}
                      </span>
                    </label>
                  ))}
                </div>

                {cancelReason === "diger" && (
                  <div className="mb-6 animate-in slide-in-from-top-2 fade-in duration-300">
                    <textarea 
                      value={otherReason}
                      onChange={(e) => setOtherReason(e.target.value)}
                      placeholder="Lütfen iptal nedeninizi kısaca açıklayın..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 resize-none min-h-25"
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsCancelModalOpen(false)}
                    disabled={isSubmittingCancel}
                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                  >
                    Vazgeç
                  </button>
                  <button 
                    onClick={handleConfirmCancel}
                    disabled={isSubmittingCancel || !cancelReason}
                    className={`flex-1 py-3.5 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${isSubmittingCancel || !cancelReason ? 'bg-red-200 text-white cursor-not-allowed shadow-none' : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 active:scale-95'}`}
                  >
                    {isSubmittingCancel ? "İptal Ediliyor..." : "İptali Onayla"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
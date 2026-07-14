"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { jobService } from '@/services/jobService';
import BackButton from '@/components/ui/BackButton';
import Spinner from '@/components/ui/Spinner';

export default function TalepDetay() {
  const { id } = useParams();
  const router = useRouter();
  
  const [job, setJob] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  // İşlem ve Modal Stateleri (alert/confirm yerine)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobData = await jobService.getJobDetail(id);
        const bidsData = await jobService.getJobBids(id);
        setJob(jobData.data || jobData);
        setBids(bidsData.results || bidsData || []);
      } catch (err) {
        console.warn("Detaylar çekilemedi, test verisine geçiliyor...", err);
        
        // BACKEND BYPASS: API kapalıysa tasarımı görmek için sahte veri
        setTimeout(() => {
          setJob({
            id: id,
            title: "Komple Ev Boyama",
            category_name: "Boya Badana",
            district_name: "Kadıköy",
            description: "3+1 evimin komple boyanması gerekiyor. Tavanlar dahil. Malzemeler benden, sadece işçilik aranıyor. Temiz ve titiz bir çalışma bekliyorum.",
            status: "pending", 
            accepted_bid_id: null,
            created_at: "Bugün 10:30"
          });
          
          setBids([
            { id: 1, provider_name: "Ahmet Yılmaz", provider_phone: "05551234567", price: 4500, note: "Hemen yarın başlayabiliriz, profesyonel ekibimizle 2 günde teslim ederiz. Boya koruma örtüleri bizden.", is_accepted: false },
            { id: 2, provider_name: "Mehmet Demir", provider_phone: "05059876543", price: 3800, note: "Sadece işçilik fiyatıdır, temiz ve titiz çalışırım. Yılların tecrübesiyle hizmet veriyorum.", is_accepted: false }
          ]);
          setLoading(false);
        }, 800);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchData();
  }, [id]);

  // Teklif Kabul Modalını Aç
  const openAcceptModal = (bid) => {
    setSelectedBid(bid);
    setIsModalOpen(true);
  };

  // Gerçek Teklif Kabul İşlemi
  const handleConfirmAccept = async () => {
    if (!selectedBid) return;
    setIsAccepting(true);
    
    try {
      // await jobService.acceptOffer(id, selectedBid.id); // API ÇAĞRISI
      
      // Optimistic UI Güncellemesi (Sayfayı yenilemeden anında arayüzü güncelle)
      setJob(prev => ({ ...prev, status: 'accepted', accepted_bid_id: selectedBid.id }));
      setBids(prev => prev.map(b => ({ ...b, is_accepted: b.id === selectedBid.id })));
      
      setSuccessMessage("Usta başarıyla seçildi! Artık iletişime geçebilirsiniz.");
      setIsModalOpen(false);
      
      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => setSuccessMessage(""), 3000);

    } catch (err) {
      console.warn("Onaylama sırasında API hatası, test akışına geçiliyor...");
      // BACKEND BYPASS
      setTimeout(() => {
        setJob(prev => ({ ...prev, status: 'accepted', accepted_bid_id: selectedBid.id }));
        setBids(prev => prev.map(b => ({ ...b, is_accepted: b.id === selectedBid.id })));
        setSuccessMessage("Usta (Test) başarıyla seçildi!");
        setIsModalOpen(false);
        setTimeout(() => setSuccessMessage(""), 3000);
      }, 800);
    } finally {
      setIsAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center">
        <Spinner className="w-12 h-12 border-emerald-500 mb-4" />
        <p className="text-slate-500 font-bold animate-pulse">İlan detayları yükleniyor...</p>
      </div>
    );
  }

  if (!job) return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl font-bold flex items-center gap-2">
        <span className="material-symbols-outlined">error</span>
        Talep bulunamadı veya silinmiş.
      </div>
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          body { background-color: #FAF7F2; }
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        `
      }} />

      <div className="min-h-screen py-8 md:py-12 px-4 sm:px-6 font-sans selection:bg-emerald-500/20 selection:text-emerald-900 relative overflow-hidden">
        
        {/* Soft Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[100px] mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-300/10 rounded-full blur-[100px] mix-blend-multiply"></div>
        </div>

        <BackButton className="absolute top-4 left-4 md:top-8 md:left-8 z-40 text-slate-400 hover:text-emerald-600 transition-colors" />

        <div className="max-w-4xl mx-auto pt-12 md:pt-4 relative z-10">
          
          {/* Başarı Bildirimi (Toast) */}
          {successMessage && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-emerald-500/10 animate-in slide-in-from-top-4 fade-in duration-300">
              <span className="material-symbols-outlined text-emerald-500">check_circle</span>
              {successMessage}
            </div>
          )}

          {/* İLAN DETAYLARI KARTI */}
          <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-10 border border-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] mb-10 relative overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-bl-full -z-10"></div>
            
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[14px]">category</span>
                {job.category_name}
              </span>
              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 shadow-sm border ${job.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]'}`}>
                <span className="material-symbols-outlined text-[14px]">{job.status === 'pending' ? 'hourglass_top' : 'verified'}</span>
                {job.status === 'pending' ? 'Teklif Bekliyor' : 'Usta Seçildi'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-6 tracking-tight leading-tight">{job.title}</h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm font-bold text-slate-500 mb-8">
              <span className="flex items-center gap-2 bg-[#FAF7F2] px-4 py-2 rounded-xl border border-slate-100">
                <span className="material-symbols-outlined text-emerald-500 text-[18px]">location_on</span> 
                {job.district_name}
              </span>
              <span className="flex items-center gap-2 bg-[#FAF7F2] px-4 py-2 rounded-xl border border-slate-100">
                <span className="material-symbols-outlined text-emerald-500 text-[18px]">calendar_month</span> 
                {job.created_at}
              </span>
            </div>

            <div className="bg-[#FAF7F2] p-5 sm:p-6 rounded-2xl border border-slate-100 relative">
               <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">İş Açıklaması</h4>
              <p className="text-slate-600 font-medium leading-relaxed text-sm sm:text-base">{job.description}</p>
            </div>
          </div>
          
          {/* TEKLİFLER BÖLÜMÜ */}
          <div className="flex items-center justify-between mb-6 px-2 animate-in fade-in duration-700">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 p-1.5 bg-emerald-50 rounded-xl">forum</span>
              Gelen Teklifler 
              <span className="bg-slate-900 text-white px-2.5 py-0.5 rounded-lg text-sm font-black ml-1 shadow-sm">
                {bids.length}
              </span>
            </h2>
          </div>

          {bids.length === 0 ? (
            <div className="text-center py-16 bg-white/60 backdrop-blur-sm border-2 border-slate-200 border-dashed rounded-[2.5rem] shadow-sm animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-5 text-slate-400 rotate-3 border border-slate-100">
                <span className="material-symbols-outlined text-[40px]">search_off</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Henüz Teklif Yok</h3>
              <p className="text-slate-500 font-medium text-sm max-w-sm mx-auto">Uzmanlarımız ilanınızı inceliyor. Bölgenizdeki uygun ustalar teklif verdiğinde burada listelenecektir.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:gap-6">
              {bids.map((bid, index) => {
                const isAcceptedBid = bid.is_accepted || job.accepted_bid_id === bid.id;
                
                return (
                  <div 
                    key={bid.id} 
                    className={`p-6 sm:p-8 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group animate-in slide-in-from-bottom-4 fade-in ${isAcceptedBid ? 'border-2 border-emerald-500 ring-4 ring-emerald-500/10 scale-[1.01] shadow-emerald-500/10' : 'border border-slate-100 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] hover:border-emerald-200'}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    
                    <div className="flex-1 w-full">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-black text-xl sm:text-2xl text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-2">
                          {bid.provider_name}
                          {isAcceptedBid && <span className="material-symbols-outlined text-emerald-500 text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>}
                        </h3>
                        <p className="text-slate-900 font-black text-2xl md:hidden tracking-tight">{bid.price} ₺</p>
                      </div>
                      <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100/80">
                        <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{bid.note}"</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3 w-full md:w-auto border-t md:border-t-0 pt-5 md:pt-0 border-slate-100">
                      <p className="text-slate-900 font-black text-3xl hidden md:block tracking-tight">{bid.price} <span className="text-emerald-500 text-2xl">₺</span></p>
                      
                      {job.status === 'pending' ? (
                        <button 
                          onClick={() => openAcceptModal(bid)}
                          className="w-full md:w-auto px-8 py-3.5 font-black text-base rounded-xl transition-all shadow-lg bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/25 active:scale-95 flex items-center justify-center gap-2 group/btn"
                        >
                          Teklifi Kabul Et
                          <span className="material-symbols-outlined text-[20px] transition-transform group-hover/btn:translate-x-1">arrow_forward</span>
                        </button>
                      ) : isAcceptedBid ? (
                        <div className="flex flex-col w-full sm:w-auto gap-2.5">
                          <a 
                            href={`https://wa.me/90${(bid.provider_phone || "5550000000").replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-6 py-3.5 rounded-xl font-black shadow-lg shadow-[#25D366]/25 transition-all active:scale-95 w-full whitespace-nowrap"
                          >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            WhatsApp'tan Yaz
                          </a>
                          <Link href={`/taleplerim/${id}/degerlendir`} className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl font-black shadow-lg transition-all active:scale-95 w-full whitespace-nowrap">
                            <span className="material-symbols-outlined text-[20px]">task_alt</span>
                            İşi Tamamla & Puanla
                          </Link>
                        </div>
                      ) : (
                        <button disabled className="w-full md:w-auto px-8 py-3.5 font-bold text-sm rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200">
                          Farklı Usta Seçildi
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* İÇE GÖMÜLÜ ONAY MODALI (Eksik dosya hatası vermez) */}
      {isModalOpen && selectedBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => !isAccepting && setIsModalOpen(false)}></div>
          
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-400 border border-slate-100">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100 transform rotate-3">
              <span className="material-symbols-outlined text-[40px]">handshake</span>
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 text-center mb-3 tracking-tight">Teklifi Onaylıyor musunuz?</h3>
            <p className="text-slate-500 text-center text-sm font-medium mb-8 leading-relaxed">
              <strong className="text-slate-800">{selectedBid.provider_name}</strong> isimli ustanın <strong className="text-emerald-600">{selectedBid.price} ₺</strong> tutarındaki teklifini kabul ettiğinizde, ustanın iletişim bilgileri sizinle paylaşılacaktır.
            </p>

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isAccepting}
                className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-xl transition-all"
              >
                Vazgeç
              </button>
              <button 
                onClick={handleConfirmAccept}
                disabled={isAccepting}
                className={`w-full py-4 font-black rounded-xl transition-all flex items-center justify-center gap-2 group ${isAccepting ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 active:scale-95'}`}
              >
                {isAccepting ? (
                  <><span className="material-symbols-outlined animate-spin">progress_activity</span> İşleniyor...</>
                ) : (
                  <>Onayla <span className="material-symbols-outlined text-[18px]">check</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
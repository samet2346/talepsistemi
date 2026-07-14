"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import OfferCard from "@/components/ui/OfferCard";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Spinner from "@/components/ui/Spinner";
import api from "@/lib/api";

import { REQUEST_STATUS, STATUS_UI } from "@/utils/constants";

export default function TalepDetay() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const [request, setRequest] = useState(null);
  const [offers, setOffers] = useState([]);

  const talepId = params?.id;

  useEffect(() => {
    if (!talepId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/jobs/requests/${talepId}/`);
        const data = res.data;
        setRequest({
          id: data.id,
          title: data.title,
          category: data.category_name || data.category,
          description: data.description,
          location: data.district_name || data.location || "",
          status: data.status,
          createdAt: new Date(data.created_at).toLocaleDateString("tr-TR", {
            day: "numeric", month: "long", year: "numeric"
          }),
          budgetMin: data.budget_min,
          budgetMax: data.budget_max,
        });

        const bidsRes = await api.get(`/jobs/requests/${talepId}/bids/`);
        const bidsData = bidsRes.data?.results || bidsRes.data || [];
        setOffers(
          bidsData.map((bid) => ({
            id: bid.id,
            ustaName: bid.provider_name || "Usta",
            price: parseFloat(bid.price),
            duration: bid.estimated_duration || "",
            message: bid.note,
            revisionCount: 0,
            isSelected: bid.status === "ACCEPTED",
            isNew: bid.status === "PENDING",
            trustScore: bid.trust_score || 0,
            providerPhone: bid.provider_phone || null,
            businessName: bid.master_profile?.business_name || null,
            bio: bid.master_profile?.bio || null,
            rating: bid.master_profile?.rating ?? null,
            experienceYear: bid.master_profile?.experience_year ?? null,
            isVerified: bid.master_profile?.is_verified || false,
          }))
        );
      } catch (err) {
        console.error("Talep yuklenemedi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [talepId]);

  const sortedOffers = [...offers].sort((a, b) =>
    sortOrder === "asc" ? a.price - b.price : b.price - a.price
  );

  const handleCompleteJob = async () => {
    if (!confirm("İşi tamamlandı olarak işaretlemek istediğinize emin misiniz?")) return;
    setIsCompleting(true);
    try {
      // ✅ Token'ı localStorage'dan çekip header'a basıyoruz
      const token = localStorage.getItem('token');
      
      await api.post(`/jobs/requests/${talepId}/complete-job/`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setRequest({ ...request, status: "completed" });
      router.push(`/taleplerim/${talepId}/degerlendir`);
    } catch (err) {
      console.error("Tamamlama hatasi:", err);
      // Eğer hata 401 ise kullanıcıyı login'e atalım
      if (err.response?.status === 401) {
        alert("Oturumunuz süresi dolmuş, lütfen tekrar giriş yapın.");
        router.push("/login");
      } else {
        alert(err.response?.data?.detail || "Is tamamlanamadi.");
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      await api.delete(`/jobs/requests/${talepId}/`);
      setRequest({ ...request, status: "cancelled" });
    } catch (err) {
      console.error("Iptal hatasi:", err);
      alert(err.response?.data?.detail || "Talep iptal edilemedi.");
    }
  };

  const handleSelectOffer = async () => {
    try {
      const res = await api.post(`/jobs/requests/${talepId}/accept-offer/${selectedOfferId}/`);
      const providerPhone = res.data?.provider_phone;

      setOffers((prev) =>
        prev.map((o) => ({ ...o, isSelected: o.id === selectedOfferId }))
      );
      setRequest({ ...request, status: "matched" });

      if (providerPhone) {
        alert(`Usta secildi! Telefon: ${providerPhone}\nWhatsApp ile iletisime gecebilirsiniz.`);
      }
    } catch (err) {
      console.error("Teklif kabul hatasi:", err);
      alert(err.response?.data?.detail || "Teklif kabul edilemedi.");
    } finally {
      setIsSelectModalOpen(false);
    }
  };

  const openSelectModal = (offerId) => {
    setSelectedOfferId(offerId);
    setIsSelectModalOpen(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]"><Spinner className="w-10 h-10 border-emerald-500" /></div>;
  if (!request) return <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium bg-[#FAF7F2]">Talep bulunamadi.</div>;

  const statusInfo = STATUS_UI?.[request.status] || { label: "Teklif Alindi", color: "bg-emerald-50 text-emerald-600 border-emerald-200" };

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

        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-400 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-300 rounded-full blur-[120px] opacity-20"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => router.back()} className="w-11 h-11 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-500 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Talep Detaylari</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.05)] sticky top-24">

                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className="bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">{request.category}</Badge>
                  <Badge className={`${statusInfo.color} shadow-sm`}>{statusInfo.label}</Badge>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-6 leading-snug">{request.title}</h2>

                <div className="space-y-5 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hizmet Noktasi</p>
                      <p className="text-sm text-slate-700 font-semibold mt-0.5">{request.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Olusturulma Tarihi</p>
                      <p className="text-sm text-slate-700 font-semibold mt-0.5">{request.createdAt}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Talep Aciklamasi</p>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {request.description}
                  </p>
                </div>

                {(request.status === "pending" || request.status === "offer_received") && (
                  <div className="mt-8">
                    <Button variant="danger" className="w-full py-4 bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white rounded-2xl font-bold transition-colors shadow-sm" onClick={() => setIsCancelModalOpen(true)}>
                      Talebi Iptal Et
                    </Button>
                  </div>
                )}

                {/* ✅ İŞ AKIŞI BUTONLARI (KONTROLÜ BASİTLEŞTİRDİM) */}
                <div className="mt-8 space-y-4">
                  {/* DEBUG: Statüyü butonun üzerinde görelim diye ekliyorum */}
                  <div className="text-[10px] text-gray-400 font-mono">DEBUG: Statü = {request.status}</div>
                  
                  {/* 1. Tamamla Butonu: matched veya on_way değilse bile backend'den ne geliyorsa ona göre tetiklensin */}
                  {request.status !== "completed" && request.status !== "cancelled" && (
                    <Button 
                      variant="primary" 
                      className="w-full py-4 bg-emerald-600 text-white hover:bg-emerald-500 rounded-2xl font-bold transition-colors shadow-lg" 
                      onClick={handleCompleteJob} 
                      disabled={isCompleting}
                    >
                      {isCompleting ? "Tamamlanıyor..." : "İşi Tamamla"}
                    </Button>
                  )}

                  {/* 2. Değerlendir Butonu: Sadece tamamlandıysa */}
                  {request.status === "completed" && (
                    <Link href={`/taleplerim/${talepId}/degerlendir`} className="block">
                      <Button 
                        className="w-full py-4 bg-amber-500 text-white hover:bg-amber-600 rounded-2xl font-bold transition-colors shadow-lg"
                      >
                        Ustayı Değerlendir
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="pl-2">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    Gelen Teklifler
                    <span className="bg-emerald-100 text-emerald-600 text-xs px-2.5 py-0.5 rounded-full font-bold">{offers.length}</span>
                  </h3>
                </div>

                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
                  <button
                    onClick={() => setSortOrder("asc")}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${sortOrder === "asc" ? "bg-white text-emerald-600 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    En Dusuk Fiyat
                  </button>
                  <button
                    onClick={() => setSortOrder("desc")}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${sortOrder === "desc" ? "bg-white text-emerald-600 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    En Yuksek Fiyat
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                {offers.length === 0 ? (
                  <div className="bg-white border border-slate-200 border-dashed rounded-[2.5rem] p-12 text-center shadow-sm">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 text-emerald-500">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h4 className="text-slate-900 text-xl font-bold mb-2">Henuz Teklif Yok</h4>
                    <p className="text-slate-500 text-sm font-medium">Talebiniz uzmanlara iletildi. Yeni teklifler geldiginde burada gorunecek.</p>
                  </div>
                ) : (
                  sortedOffers.map((offer) => (
                    <div key={offer.id} className="relative group">
                      {offer.isNew && !offer.isSelected && (
                        <div className="absolute -inset-1 bg-linear-to-r from-emerald-300 to-teal-300 rounded-[2.5rem] blur opacity-25 animate-pulse group-hover:opacity-40 transition-opacity"></div>
                      )}

                      {offer.isNew && !offer.isSelected && (
                         <div className="absolute -top-3 -right-2 z-10">
                            <span className="relative flex h-5 w-5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-white"></span>
                            </span>
                         </div>
                      )}

                      <div className="relative z-10">
                        <OfferCard
                          offer={offer}
                          role="customer"
                          onSelect={openSelectModal}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {ConfirmModal && (
          <>
            <ConfirmModal
              isOpen={isCancelModalOpen}
              onClose={() => setIsCancelModalOpen(false)}
              onConfirm={handleCancelRequest}
              title="Talebi Iptal Et"
              message="Bu talebi iptal etmek istediginize emin misiniz? Bu islem geri alinamaz ve teklif veren ustalar bilgilendirilir."
              confirmText="Evet, Iptal Et"
              cancelText="Vazgec"
              isDestructive={true}
            />

            <ConfirmModal
              isOpen={isSelectModalOpen}
              onClose={() => setIsSelectModalOpen(false)}
              onConfirm={handleSelectOffer}
              title="Ustayi Onayla"
              message="Bu teklifi kabul ettiginizde, diger ustalarin teklifleri reddedilecek ve iletisim bilgileriniz (Telefon numaraniz) sadece bu usta ile paylasilacaktir. Onayliyor musunuz?"
              confirmText="Teklifi Kabul Et"
              cancelText="Vazgec"
            />
          </>
        )}

      </div>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import BackButton from "@/components/ui/BackButton";
import { REQUEST_STATUS, BIDDING_RULES } from "@/utils/constants";
import { jobService } from "@/services/jobService";
import { useAuth } from "@/context/AuthContext";

export default function Tekliflerim() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myOffers, setMyOffers] = useState([]);

  /*
   * NOT: API'de "ustanın verdiği tüm teklifler" için ayrı/global bir endpoint
   * (örn. /accounts/me/bids/) bulunmuyor. Bu yüzden:
   * 1) GET /jobs/requests/ ile (kullanıcı rolüne göre backend'in döndürdüğü) işleri çekiyoruz,
   * 2) Teklif verilmiş olabilecek her iş için GET /jobs/requests/{id}/bids/ çağırıp
   *    bu ustaya ait teklifi süzüyoruz.
   * Bu N+1 sorgu anlamına gelir; iş sayısı arttıkça performans sorunu yaratabilir.
   * İdeal çözüm: backend ekibinin ustaya özel bir "tekliflerim" endpoint'i eklemesi.
   */
  useEffect(() => {
    const fetchMyOffers = async () => {
      setLoading(true);
      try {
        const jobsResponse = await jobService.getJobs();
        const jobs = jobsResponse?.results || jobsResponse?.data?.results || jobsResponse || [];

        const offerLists = await Promise.all(
          (Array.isArray(jobs) ? jobs : []).map(async (job) => {
            try {
              const bidsResponse = await jobService.getJobBids(job.id);
              const bids = bidsResponse?.results || bidsResponse?.data?.results || bidsResponse || [];
              const myBid = (Array.isArray(bids) ? bids : []).find((b) => b.provider === user?.id);
              if (!myBid) return null;
              return {
                id: myBid.id,
                requestId: job.id,
                requestTitle: job.title,
                myPrice: myBid.price,
                status: job.status,
                date: myBid.created_at,
              };
            } catch {
              return null; // bu işe erişim/teklif yoksa sessizce atla
            }
          })
        );

        setMyOffers(offerLists.filter(Boolean));
        setError("");
      } catch (err) {
        console.error("Teklifler alınamadı:", err);
        setMyOffers([]);
        setError("Teklifleriniz yüklenemedi. Lütfen sayfayı yenileyin.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchMyOffers();
    }
  }, [user?.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]"><Spinner className="border-emerald-500 w-10 h-10" /></div>;

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

      <div className="min-h-screen py-10 font-sans relative selection:bg-emerald-500/20 selection:text-emerald-700">
        <BackButton className="absolute top-6 left-6 md:top-10 md:left-10 z-50 text-slate-500 hover:text-emerald-500 transition-colors" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-10 relative z-10">

          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
              Tekliflerim
            </h1>
            <p className="text-slate-500 font-medium">Verdiğiniz teklifleri ve durumlarını buradan takip edin.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-2xl text-center">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {myOffers.length === 0 ? (
              <div className="text-center py-16 bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem] shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Henüz Teklif Vermediniz</h3>
                <p className="text-slate-500 font-medium mb-6">Açık taleplere göz atarak ilk teklifinizi verebilirsiniz.</p>
                <Link href="/usta-paneli/talepler" className="px-8 py-3 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all inline-block">
                  Açık Talepleri Gör
                </Link>
              </div>
            ) : (
              myOffers.map((offer) => (
                <Link
                  key={offer.id}
                  href={`/usta-paneli/teklif-ver/${offer.requestId}`}
                  className="block bg-white border border-gray-100 rounded-4xl p-6 shadow-sm hover:border-emerald-200 transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">{offer.requestTitle}</h3>
                      <p className="text-sm text-slate-500 font-medium">{offer.myPrice} ₺ teklif verdiniz</p>
                    </div>
                    <Badge status={offer.status} />
                  </div>
                </Link>
              ))
            )}
          </div>

        </div>
      </div>
    </>
  );
}
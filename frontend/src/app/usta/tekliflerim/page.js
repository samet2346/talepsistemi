"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import BackButton from "@/components/ui/BackButton";
import api from "@/lib/api";
import { REQUEST_STATUS, BIDDING_RULES } from "@/utils/constants";

export default function Tekliflerim() {
  const [loading, setLoading] = useState(true);
  const [myOffers, setMyOffers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyBids = async () => {
      setLoading(true);
      try {
        const res = await api.get("/jobs/requests/my-bids/");
        const data = res.data?.results || res.data || [];

        setMyOffers(
          data.map((bid) => ({
            id: bid.id,
            requestId: bid.job,
            requestTitle: bid.job_title || `İş #${bid.job}`,
            myPrice: parseFloat(bid.price),
            revisionCount: 0,
            status: mapBackendStatus(bid.status, bid.job_status),
            isSelected: bid.status === "ACCEPTED",
            date: new Date(bid.created_at).toLocaleDateString("tr-TR", {
              day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
            }),
          }))
        );
      } catch (err) {
        console.error("Teklifler yüklenemedi:", err);
        setError("Teklifleriniz yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyBids();
  }, []);

  // Backend bid status + job status'unu frontend REQUEST_STATUS'una çevir
  const mapBackendStatus = (bidStatus, jobStatus) => {
    if (bidStatus === "REJECTED") return REQUEST_STATUS?.CANCELLED || "cancelled";
    if (jobStatus === "completed") return REQUEST_STATUS?.COMPLETED || "completed";
    if (bidStatus === "ACCEPTED") return REQUEST_STATUS?.SELECTED || "selected";
    return REQUEST_STATUS?.OFFER_RECEIVED || "offer_received";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <Spinner className="w-10 h-10 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 font-sans">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <h1 className="text-3xl font-black text-slate-900">Tekliflerim</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 px-5 py-3 rounded-2xl mb-6 font-bold text-sm">
            {error}
          </div>
        )}

        {myOffers.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-[2.5rem] p-12 text-center shadow-sm">
            <h4 className="text-slate-900 text-xl font-bold mb-2">Henüz teklif vermediniz</h4>
            <p className="text-slate-500 text-sm font-medium">Açık işlere teklif verdiğinizde burada görünecek.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myOffers.map((offer) => (
              <Link
                key={offer.id}
                href={`/talep/${offer.requestId}`}
                className="block bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{offer.requestTitle}</h3>
                    <p className="text-sm text-slate-500 font-medium">{offer.date}</p>
                  </div>
                  <Badge className={
                    offer.isSelected
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-blue-50 text-blue-600 border border-blue-100"
                  }>
                    {offer.isSelected ? "Seçildi" : "Bekliyor"}
                  </Badge>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-sm text-slate-500 font-medium">Verdiğiniz Teklif</span>
                  <span className="text-xl font-black text-slate-900">{offer.myPrice.toLocaleString("tr-TR")} TL</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
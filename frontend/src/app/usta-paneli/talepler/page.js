"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import RequestCard from "@/components/ui/RequestCard";
import Spinner from "@/components/ui/Spinner";
import { REQUEST_STATUS } from "@/utils/constants";
import BackButton from "@/components/ui/BackButton";
import { jobService } from "@/services/jobService";
import { commonService } from "@/services/commonService";

export default function AcikTalepler() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState([]);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const [kategoriler, setKategoriler] = useState([{ label: "Tüm Kategoriler", value: "" }]);
  const [ilceler, setIlceler] = useState([{ label: "Tüm İlçeler", value: "" }]);

  // Dinamik kategori/ilçe (common/config) — sahte sabit listeler kaldırıldı
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await commonService.getConfig();
        if (data.categories) {
          setKategoriler([{ label: "Tüm Kategoriler", value: "" }, ...data.categories.map(c => ({ label: c.name, value: c.id.toString() }))]);
        }
        if (data.districts) {
          setIlceler([{ label: "Tüm İlçeler", value: "" }, ...data.districts.map(d => ({ label: d.name, value: d.id.toString() }))]);
        }
      } catch (err) {
        console.warn("Config verileri çekilemedi.", err);
      }
    };
    fetchConfig();
  }, []);

  // GET /api/v1/jobs/requests/  (Açık/bekleyen işler — usta bunlara teklif verebilir)
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await jobService.getJobs();
        const list = response?.results || response?.data?.results || response || [];
        // API'de "yalnızca pending olanları getir" filtresi olmadığından client-side filtreliyoruz
        const onlyOpen = (Array.isArray(list) ? list : []).filter(
          (job) => job.status === "pending" || job.status === "offer_received"
        );
        setRequests(onlyOpen);
        setError("");
      } catch (err) {
        console.error("Talepler alınamadı:", err);
        setRequests([]);
        setError("Açık talepler yüklenemedi. Lütfen sayfayı yenileyin.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((req) => {
    const matchCategory = categoryFilter === "" || String(req.category) === categoryFilter;
    const matchLocation = locationFilter === "" || String(req.district) === locationFilter;
    return matchCategory && matchLocation;
  });

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

        {/* SOL ÜST KÖŞE: GERİ DÖN */}
        <BackButton className="absolute top-6 left-6 md:top-10 md:left-10 z-50 text-slate-500 hover:text-emerald-500 transition-colors" />

        {/* SAĞ ÜST KÖŞE: PROFİL BUTONU */}
        <Link
          href="/usta-paneli/profil"
          className="absolute top-6 right-6 md:top-10 md:right-10 z-50 flex items-center gap-3 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-700 px-4 py-2.5 rounded-2xl transition-all shadow-sm group"
        >
          <span className="text-sm font-bold hidden sm:block group-hover:text-emerald-600 transition-colors">Profilim</span>
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-black shadow-inner">U</div>
        </Link>

        {/* ARKA PLAN EFEKTLERİ */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-400 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-300 rounded-full blur-[120px] opacity-20"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-10 relative z-10">

          {/* BAŞLIK */}
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
              Açık <span className="text-emerald-500">Talepler</span>
            </h1>
            <p className="text-slate-500 font-medium">Bölgenizdeki yeni iş fırsatlarını inceleyin ve hemen teklif verin.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-2xl text-center">
              {error}
            </div>
          )}

          {/* FİLTRELEME ÇUBUĞU */}
          <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-4xl mb-10 flex flex-col sm:flex-row gap-4 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.05)] relative z-20">

            <div className="flex-1 relative">
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 ml-1 uppercase tracking-wider">Kategori</label>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer"
                >
                  {kategoriler.map((kat, index) => <option key={index} value={kat.value}>{kat.label}</option>)}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </span>
              </div>
            </div>

            <div className="flex-1 relative">
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 ml-1 uppercase tracking-wider">Hizmet Bölgesi</label>
              <div className="relative">
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer"
                >
                  {ilceler.map((ilce, index) => <option key={index} value={ilce.value}>{ilce.label}</option>)}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </span>
              </div>
            </div>
          </div>

          {/* İLAN LİSTESİ */}
          <div className="space-y-5">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-16 bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem] shadow-sm">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Talep Bulunamadı</h3>
                <p className="text-slate-500 font-medium">Bu kriterlere uygun açık talep bulunmuyor. Farklı bir filtre deneyebilirsiniz.</p>
              </div>
            ) : (
              filteredRequests.map((req) => (
                <RequestCard
                  key={req.id}
                  request={{
                    id: req.id,
                    title: req.title,
                    category: req.category_name,
                    location: req.district_name,
                    status: req.status,
                    offerCount: req.offer_count,
                    createdAt: req.created_at,
                  }}
                  role="usta"
                />
              ))
            )}
          </div>

        </div>
      </div>
    </>
  );
}
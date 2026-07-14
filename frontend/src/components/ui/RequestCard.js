import Link from "next/link";
import Badge from "./Badge";
// STATUS_UI yoksa uygulamanın çökmesini engellemek için yedek (fallback) yapı eklendi
import { STATUS_UI } from "@/utils/constants";

export default function RequestCard({ request, role = "customer" }) {
  // request objesi beklenen veriler: id, title, category, location, status, offerCount, createdAt
  
  // Status'un açık temada iyi görünmesi için yedek renkler belirlendi
  const statusInfo = STATUS_UI?.[request.status] || { 
    label: "Açık Talep", 
    color: "bg-blue-50 text-blue-600 border-blue-200" 
  };

  // Role göre yönlendirilecek link (Usta paneli mi müşteri paneli mi)
  const linkPath = role === "usta" ? `/usta/talep/${request.id}` : `/talep/${request.id}`;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full cursor-default">
      
      <div className="flex justify-between items-start mb-6 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full shadow-sm">
              {request.category}
            </span>
            {/* Durum etiketi (Badge) */}
            <Badge className={`${statusInfo.color} shadow-sm`}>{statusInfo.label}</Badge>
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">
            {request.title}
          </h3>
        </div>

        {/* Teklif Sayısı Kutusu */}
        <div className="text-center shrink-0 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors shadow-sm">
          <p className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
            {request.offerCount}
          </p>
          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mt-0.5 group-hover:text-emerald-500/70">
            Teklif
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-slate-500 border-t border-slate-100 pt-5 mt-auto gap-4">
        
        {/* Lokasyon ve Tarih */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {request.location}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {request.createdAt}
          </span>
        </div>
        
        {/* Yönlendirme Butonu */}
        <Link 
          href={linkPath} 
          className="text-emerald-600 font-bold text-sm hover:text-emerald-700 flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 px-5 py-2.5 rounded-xl transition-colors shrink-0"
        >
          Detayları Gör
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        
      </div>
    </div>
  );
}
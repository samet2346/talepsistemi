"use client";

import Link from "next/link";
import Badge from "./Badge";
import Button from "./Button";
import { BIDDING_RULES } from "@/utils/constants";

export default function OfferCard({ offer, role = "customer", onSelect, onRevise }) {
  const ustaAdi = offer.provider_name || offer.master_name || offer.ustaName || "Uzman Usta";
  const ustaPuani = offer.trust_score || offer.rating || offer.master_rating;
  const tamamlananIs = offer.provider_completed_jobs || offer.experienceYear || 0;
  const ustaNotu = offer.note || offer.message || offer.bio;
  const ustaTelefonu = offer.provider_phone || offer.providerPhone || offer.telefon || "";
  
  const isUUID = (val) => typeof val === 'string' && val.length === 36 && val.includes('-');
  let ustaId = null;

  if (isUUID(offer.master)) ustaId = offer.master;
  else if (offer.provider && isUUID(offer.provider.id)) ustaId = offer.provider.id;
  else if (isUUID(offer.provider)) ustaId = offer.provider;
  else if (offer.master && isUUID(offer.master.id)) ustaId = offer.master.id;
  else if (isUUID(offer.master_id)) ustaId = offer.master_id;
  else if (isUUID(offer.provider_id)) ustaId = offer.provider_id;
  else if (isUUID(offer.user_id)) ustaId = offer.user_id;

  if (!ustaId) ustaId = "f63d26b4-263b-4276-92a7-f8637b1d24f7";
  
  const maxRevisions = BIDDING_RULES?.MAX_REVISIONS || 3;
  const remainingRevisions = maxRevisions - (offer.revisionCount || 0);
  const isSelected = offer.isSelected || offer.is_accepted || offer.status === 'ACCEPTED';

  return (
    <div className={`relative p-6 sm:p-8 rounded-[2rem] border transition-all duration-300 ${isSelected ? 'bg-white border-2 border-emerald-500 ring-4 ring-emerald-500/10 shadow-lg shadow-emerald-500/5' : 'bg-white border-slate-100 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] hover:border-emerald-200'}`}>

      {isSelected && (
        <div className="absolute -top-3.5 left-6 bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md shadow-emerald-500/20 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
          Kabul Edilen Teklif
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-black text-lg shadow-sm">
            {ustaAdi.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-slate-900 font-black text-lg tracking-tight">{offer.businessName || ustaAdi}</h4>
              <Link href={`/ustalar/${ustaId}`} className="text-xs text-emerald-600 hover:text-emerald-700 font-bold underline flex items-center gap-0.5 ml-1 group">
                Profili Gör 
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </Link>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <Badge className="bg-amber-50 text-amber-600 border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-lg">★ {ustaPuani && Number(ustaPuani) > 0 ? Number(ustaPuani).toFixed(1) : "4.9"}</Badge>
              <Badge className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-lg">{tamamlananIs > 0 ? `${tamamlananIs} Tamamlanan İş` : "Yeni Uzman"}</Badge>
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 flex sm:flex-col justify-between items-center sm:items-end">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold sm:order-2">Teklif Tutarı</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight sm:order-1">{offer.price} <span className="text-emerald-500 text-xl">₺</span></p>
        </div>
      </div>

      <div className="bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-slate-100/80 mb-5">
        <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{ustaNotu || "İlanınız için teklif bıraktım, detayları görüşmek üzere iletişime geçebilirsiniz."}"</p>
      </div>

      <div className="flex justify-end items-center gap-3 mt-2 border-t border-slate-100 pt-4">
        {role === "customer" && !isSelected && (
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <Link href={`/ustalar/${ustaId}`} className="text-center text-xs font-bold border-2 border-slate-200 text-slate-600 py-3 px-5 rounded-xl bg-white hover:border-emerald-500 transition-all text-nowrap">Belgeleri İncele</Link>
            <Button variant="primary" onClick={() => onSelect(offer.id)} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-6 rounded-xl shadow-md">Bu Teklifi Seç</Button>
          </div>
        )}

        {role === "customer" && isSelected && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            <Link href={`/ustalar/${ustaId}`} className="text-center text-xs font-bold border-2 border-slate-200 text-slate-600 py-3 px-5 rounded-xl bg-white hover:border-emerald-500 transition-all text-nowrap flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              Usta Profili
            </Link>

            <div className="sm:ml-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {ustaTelefonu && (
                <span className="text-sm text-slate-700 font-bold bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-center flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  {ustaTelefonu.replace(/\D/g, '').slice(-10)}
                </span>
              )}
              <a href={`https://wa.me/90${ustaTelefonu.replace(/\D/g, '').slice(-10)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-6 py-3 rounded-xl font-black shadow-lg shadow-[#25D366]/10 transition-all active:scale-95 w-full sm:w-auto text-sm">WhatsApp'tan Yaz</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
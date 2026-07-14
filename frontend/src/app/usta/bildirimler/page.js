"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function UstaBildirimler() {
  const [bildirimler, setBildirimler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hata, setHata] = useState(null);
  const [mevcutToken, setMevcutToken] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setMevcutToken(token || "TOKEN BULUNAMADI! LOCALSTORAGE BOŞ!");

    const fetchBildirimler = async () => {
      try {
        const res = await api.get("/notifications/");
        setBildirimler(res.data?.results || res.data || []);
        setHata(null);
      } catch (err) {
        const apiError = err.response?.data?.detail || err.message;
        setHata(typeof apiError === "string" ? apiError : "Bildirimler yüklenemedi.");
        setBildirimler([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBildirimler();
  }, []);

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white font-mono">
      <h1 className="text-2xl font-bold text-green-500 mb-4">🚀 Telsiz Hattı Canlandı</h1>
      
      <div className="bg-slate-800 p-4 rounded-xl mb-6 border border-slate-700 text-xs break-all">
        <p className="font-bold text-yellow-400">🕵️ Tarayıcıdan Okunan Gerçek Token (accessToken):</p>
        <p className="mt-1 text-slate-300">{mevcutToken}</p>
      </div>

      {hata && (
        <div className="bg-red-900/50 border border-red-500 p-4 rounded-xl mb-6 text-red-200">
          <strong>Hata:</strong> {hata}
        </div>
      )}

      {loading ? (
        <p className="text-yellow-500 animate-pulse">Veriler sökülüyor...</p>
      ) : (
        <div>
          <h2 className="text-lg font-bold mb-4 text-green-400">Gelen Bildirim Sayısı: {bildirimler.length}</h2>
          <div className="space-y-4">
            {bildirimler.map((b) => (
              <div key={b.id} className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                <p className="text-green-400 font-bold">🎉 {b.title}</p>
                <p className="text-slate-300 text-sm mt-1">📝 {b.body}</p>
                <p className="text-slate-500 text-xs mt-2">🕒 Durum: {b.is_read ? "Okundu" : "Okunmadı"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import BackButton from "@/components/ui/BackButton";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

export default function GuvenlikPage() {
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const res = await api.get("/accounts/me/");
        setEmail(res.data?.email || "");
      } catch (err) {
        console.error("E-posta alınamadı:", err);
        const user = JSON.parse(localStorage.getItem("user") || "null");
        setEmail(user?.email || "");
      }
    };
    fetchEmail();
  }, []);

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Kayıtlı bir e-posta adresi bulunamadı.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/accounts/password-reset/", { email });
      setResetSent(true);
      toast.success("Sıfırlama bağlantısı e-posta adresinize gönderildi!");
    } catch (err) {
      console.error("Şifre sıfırlama hatası:", err.response?.data || err.message);
      toast.error(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-16">
      <div className="max-w-4xl mx-auto px-4">
        <BackButton className="mb-8 text-slate-400 hover:text-white transition-colors" />

        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">Güvenlik Ayarları</h1>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-2">Şifre Değiştir</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mb-6">
              Kayıtlı e-posta adresinize şifre sıfırlama bağlantısı gönderilir. Bağlantı üzerinden yeni şifrenizi belirleyebilirsiniz.
            </p>

            {resetSent ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✉️</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Talimatlar Gönderildi!</h3>
                <p className="text-sm text-slate-400">
                  E-posta adresinizi kontrol ederek şifrenizi yenileyebilirsiniz.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">
                    E-posta Adresiniz
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 bg-slate-900/50 border border-slate-700/50 rounded-2xl text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    placeholder="ornek@email.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 font-bold rounded-2xl transition-all shadow-lg transform hover:-translate-y-0.5 active:scale-[0.98] ${
                    loading
                      ? "bg-slate-700 text-slate-400 cursor-not-allowed shadow-none"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25"
                  }`}
                >
                  {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

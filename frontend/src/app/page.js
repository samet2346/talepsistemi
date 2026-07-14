"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function Home() {
  const router = useRouter();
  
  // Form ve UI için state'ler
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [error, setError] = useState(""); 
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [openFaq, setOpenFaq] = useState(null); 
  const [showNotifications, setShowNotifications] = useState(false);

  // API state'leri
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [apiCategories, setApiCategories] = useState([]);
  const [apiDistricts, setApiDistricts] = useState([]);

  // SAYFA YÜKLENDİĞİNDE
useEffect(() => {
  const userStatus = localStorage.getItem("isLoggedIn");
  
  if (userStatus === "true") {
    setIsLoggedIn(true);
    
    // JSON parse işlemini zırhla kapladık, veri silinmişse uygulama artık çökmeyecek usta
    try {
      const localData = localStorage.getItem("user");
      const userData = localData ? JSON.parse(localData) : null;
      setCurrentUser(userData);
    } catch (error) {
      console.error("Kullanıcı verisi ayrıştırma hatası:", error);
      setCurrentUser(null);
      setIsLoggedIn(false);
    }
  }

  // Kategorileri çek
  const fetchCategories = async () => {
    try {
      const res = await api.get("/services/");
      setApiCategories(res.data?.results || []);
    } catch (err) {
      console.error("Kategori hatası:", err);
    }
  };

  // İlçeleri çek
  const fetchDistricts = async () => {
    try {
      const res = await api.get("/locations/");
      setApiDistricts(res.data?.results || []);
    } catch (err) {
      console.error("İlçe hatası:", err);
    }
  };

  fetchCategories();
  fetchDistricts();
}, []);

  // Bildirimleri çek (sadece giriş yapılmışsa)
  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications/");
        setNotifications(res.data?.results || []);
        const unreadRes = await api.get("/notifications/unread_count/");
        setUnreadCount(unreadRes.data?.unread_count || 0);
      } catch (err) {
        console.error("Bildirim hatası:", err);
      }
    };
    fetchNotifications();
  }, [isLoggedIn]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setError("Talep oluşturmak için giriş yapmalısınız. Yönlendiriliyorsunuz...");
      setTimeout(() => {
        router.push("/giris");
      }, 1500);
      return;
    }
    if (selectedCategory === "") {
      setError("Lütfen talep oluşturmak için bir hizmet seçin!");
      return;
    }
    setError("");
    router.push(`/talep?hizmet=${selectedCategory}&ilce=${selectedCity}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    document.cookie = "is_provider=; path=/; max-age=0";
    setIsLoggedIn(false);
    setCurrentUser(null);
    router.push("/giris");
};

  const markAllRead = async () => {
    try {
      await api.post("/notifications/mark_all_as_read/");
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Okundu işaretleme hatası:", err);
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert("Bültene başarıyla abone oldunuz!");
    e.target.reset();
  };

  const faqs = [
    { q: "Hizmet verenler nasıl doğrulanıyor?", a: "Tüm uzmanlarımız kimlik doğrulaması, adli sicil kaydı kontrolü ve yetkinlik testlerinden geçerek sisteme dahil edilmektedir." },
    { q: "Platformda ödemem güvende mi?", a: "Evet, ödemeleriniz iş tamamlanıp siz onay verene kadar güvenli havuz hesabımızda tutulur." },
    { q: "İşlemden memnun kalmazsam ne olur?", a: "%100 Memnuniyet Garantisi kapsamında, sorununuzu çözmek için ücretsiz telafi hizmeti veya para iadesi sunuyoruz." },
    { q: "Belirli bir tarih için usta ayarlayabilir miyim?", a: "Kesinlikle! Talep oluştururken hizmetin gerçekleşmesini istediğiniz tam tarihi ve saati seçebilirsiniz." }
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
          
          body {
              background-image: radial-gradient(circle at 50% 0%, #FDFBF7 0%, #FAF7F2 60%, #F5F1EA 100%);
              background-attachment: fixed;
              background-color: #FAF7F2;
          }
          .category-card {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              border-radius: 2rem;
              background: linear-gradient(145deg, #ffffff 0%, #fcfcfc 100%);
              border: 1px solid #f3f4f6;
              box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.04);
              transition: all 0.3s;
              cursor: pointer;
              position: relative;
              overflow: hidden;
              width: 100%;
          }
          .category-card:hover {
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
              transform: translateY(-0.5rem);
              border-color: rgba(16, 185, 129, 0.2);
          }
          .illustrative-icon {
              width: 6rem;
              height: 6rem;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 1.25rem;
              transition: transform 0.5s ease-out;
          }
          .category-card:hover .illustrative-icon { transform: scale(1.1); }
          .search-container-focus:focus-within {
               box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
               border-color: rgba(16, 185, 129, 0.4);
          }
        `
      }} />

      <div className="font-body text-slate-700 antialiased overflow-x-hidden min-h-screen flex flex-col selection:bg-emerald-500/20 selection:text-emerald-700 pb-16 sm:pb-0">
        
        {/* HEADER */}
        <header className="w-full px-4 py-4 lg:px-12 bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[20px] sm:text-[22px]">rocket_launch</span>
              </div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-display">
                Talep<span className="text-emerald-500">Sistemi</span>
              </span>
            </Link>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden lg:flex items-center bg-slate-100 rounded-xl px-4 py-2 border border-transparent focus-within:border-emerald-500 transition-all">
                <span className="material-symbols-outlined text-slate-400 text-[20px] mr-2">search</span>
                <input type="text" placeholder="Hizmet ara..." className="bg-transparent border-none focus:ring-0 text-sm w-44 placeholder:text-slate-400 outline-none" />
              </div>
              
              {isLoggedIn ? (
                <div className="flex items-center gap-2 sm:gap-5 pl-2 sm:pl-4 border-l border-slate-200 animate-in fade-in duration-500">
                  
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      onBlur={() => setTimeout(() => setShowNotifications(false), 200)}
                      className="relative text-slate-400 hover:text-emerald-500 transition-colors flex items-center justify-center outline-none"
                    >
                      <span className="material-symbols-outlined text-[22px] sm:text-[24px]">notifications</span>
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-4 w-72 sm:w-80 bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                          <h3 className="font-black text-slate-800 text-sm">Bildirimler</h3>
                          <button className="text-[10px] font-bold text-emerald-500 hover:underline">Tümünü Okundu İşaretle</button>
                        </div>
                        <div className="max-h-75 overflow-y-auto">
                          <Link href="/taleplerim" className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 text-left">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 mb-0.5">Talebiniz Onaylandı</p>
                              <p className="text-[10px] font-medium text-slate-500 line-clamp-2">Boya badana talebiniz yayına alındı.</p>
                              <p className="text-[9px] font-bold text-slate-400 mt-1">2 dk önce</p>
                            </div>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Link href="/profil" className="flex items-center gap-2 group shrink-0">
                    <div className="text-right hidden md:block">
                      <p className="text-xs font-bold text-slate-900 leading-none">Emircan Ünal</p>
                      <p className="text-[10px] font-medium text-slate-500 mt-1">Müşteri</p>
                    </div>
                    <img 
                      src="https://ui-avatars.com/api/?name=Emircan+Unal&background=10b981&color=fff&bold=true" 
                      alt="Profil" 
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-sm border border-emerald-100 group-hover:ring-2 group-hover:ring-emerald-500/50 transition-all object-cover"
                    />
                  </Link>

                  <button 
                    onClick={handleLogout} 
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                    title="Çıkış Yap"
                  >
                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">logout</span>
                  </button>
                </div>
              ) : (
                <Link href="/giris" className="px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-all duration-300 shadow-lg shadow-emerald-500/20 transform active:scale-95 inline-flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px]">login</span>
                  Giriş Yap
                </Link>
              )}
            </div>
            
          </div>
        </header>

        {/* ANA İÇERİK */}
        <main className="grow flex flex-col items-center justify-center w-full relative z-10">
          
          <section className="relative px-4 pt-10 pb-16 sm:px-6 lg:pt-24 lg:pb-32 w-full max-w-7xl mx-auto flex flex-col items-center text-center">
            <div className="absolute top-20 left-10 w-72 h-72 bg-orange-100/40 rounded-full blur-3xl pointer-events-none -z-10 mix-blend-multiply"></div>
            <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10 mix-blend-multiply"></div>
            
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 sm:px-5 sm:py-2 bg-emerald-50/50 text-emerald-600 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase mx-auto border border-emerald-100 shadow-sm transition-transform hover:scale-105 cursor-default mb-6 sm:mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Her işin ustası, Tek Tık uzağında
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.2] sm:leading-[1.1] font-display mb-4 sm:mb-6 max-w-4xl">
              Hangi konuda <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-emerald-600 italic relative z-10">usta</span> lazım?
            </h1>
            <p className="text-slate-500 text-base sm:text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed font-light mb-8 sm:mb-12">
              Evdeki tadilatlardan yaratıcı projelere kadar, dakikalar içinde bölgenizdeki en iyi uzmanlarla eşleşin.
            </p>

            {/* ARAMA FORMU */}
            <div className="w-full max-w-4xl relative z-20 px-2 sm:px-0">
              {error && (
                <div className="absolute -top-16 left-0 right-0 mx-auto w-max max-w-[90vw] bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-red-500/10 flex items-center gap-2 animate-bounce">
                  <span>⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 p-2 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 text-left">
                <div className="search-container-focus flex-1 flex items-center relative bg-transparent px-4 py-3 md:py-0 border-b md:border-b-0 md:border-r border-slate-100 rounded-none transition-all duration-300">
                  <span className="material-symbols-outlined text-emerald-500 mr-3 text-[22px] sm:text-[24px]">location_on</span>
                  <div className="text-left w-full">
                    <label className="block text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Lokasyon</label>
                    <select value={selectedCity} onChange={(e) => { setSelectedCity(e.target.value); if(error) setError(""); }} className="block w-full bg-transparent border-0 text-slate-800 focus:ring-0 cursor-pointer text-xs sm:text-sm font-bold p-0 outline-none appearance-none">
                      <option value="">İlçe Seçin</option>
                      {apiDistricts.length > 0 ? (
                        apiDistricts.map((d) => (
                          <option key={d.id} value={d.slug || d.id}>{d.name}</option>
                        ))
                      ) : (
                        <>
                          <option value="besiktas">Beşiktaş</option>
                          <option value="sisli">Şişli</option>
                          <option value="umraniye">Ümraniye</option>
                          <option value="kadikoy">Kadıköy</option>
                          <option value="esenyurt">Esenyurt</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="search-container-focus flex-1 flex items-center relative bg-transparent px-4 py-3 md:py-0 transition-all duration-300">
                  <span className="material-symbols-outlined text-emerald-500 mr-3 text-[22px] sm:text-[24px]">home_repair_service</span>
                  <div className="text-left w-full">
                    <label className="block text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Hizmet Tipi</label>
                    <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); if(error) setError(""); }} className={`block w-full bg-transparent border-0 focus:ring-0 cursor-pointer text-xs sm:text-sm font-bold p-0 outline-none appearance-none ${error ? 'text-red-500' : 'text-slate-800'}`}>
                      <option value="" disabled>Ne yaptırmak istiyorsunuz?</option>
                      {apiCategories.length > 0 ? (
                        apiCategories.map((cat) => (
                          <option key={cat.id} value={cat.slug || cat.id}>{cat.name}</option>
                        ))
                      ) : (
                        <>
                          <option value="boya">Boya - Badana</option>
                          <option value="temizlik">Temizlik</option>
                          <option value="nakliyat">Nakliyat</option>
                          <option value="tadilat">Tadilat</option>
                          <option value="elektrik">Elektrik</option>
                          <option value="tesisat">Tesisat</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 shrink-0 w-full md:w-auto">
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px]">search</span>
                  Talep Oluştur
                </button>
              </form>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-slate-500 text-xs sm:text-sm font-bold px-4">
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-emerald-500 text-base sm:text-lg">verified</span> Doğrulanmış Uzmanlar</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-emerald-500 text-base sm:text-lg">payments</span> Şeffaf Fiyatlandırma</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-emerald-500 text-base sm:text-lg">shield</span> Garantili Kalite</span>
            </div>
          </section>

          <section className="mb-14 sm:mb-20 px-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 bg-white/60 backdrop-blur-sm px-5 py-3 rounded-2xl sm:rounded-full border border-white shadow-sm hover:shadow-md transition-shadow cursor-default text-center sm:text-left">
              <div className="flex -space-x-3 sm:space-x-0 sm:-space-x-4">
                <img alt="Usta 1" className="inline-block h-11 w-11 sm:h-14 sm:w-14 rounded-full ring-4 ring-white object-cover shadow-md" src="https://ui-avatars.com/api/?name=Usta+1&background=random"/>
                <img alt="Usta 2" className="inline-block h-11 w-11 sm:h-14 sm:w-14 rounded-full ring-4 ring-white object-cover shadow-md" src="https://ui-avatars.com/api/?name=Usta+2&background=random"/>
                <img alt="Usta 3" className="inline-block h-11 w-11 sm:h-14 sm:w-14 rounded-full ring-4 ring-white object-cover shadow-md" src="https://ui-avatars.com/api/?name=Usta+3&background=random"/>
                <div className="h-11 w-11 sm:h-14 sm:w-14 rounded-full ring-4 ring-white bg-emerald-500 text-white flex flex-col items-center justify-center text-[9px] sm:text-[10px] font-bold shadow-md leading-tight z-10">
                  <span className="text-xs sm:text-sm">5k+</span>Ev
                </div>
              </div>
              <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
              <div className="text-center sm:text-left">
                <div className="flex justify-center sm:justify-start items-center gap-0.5 text-amber-500 mb-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="material-symbols-outlined text-[14px] sm:text-[16px] fill-current" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">Mutlu müşteriler tarafından tavsiye edildi</p>
              </div>
            </div>
          </section>

          <section className="py-14 sm:py-20 w-full bg-white/40 border-y border-white/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-10 sm:mb-16">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2 sm:mb-4 font-display">Nasıl Çalışır?</h2>
                <p className="text-slate-500 text-sm sm:text-lg">Sadece 3 basit adımda işlerinizi halledin</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 relative max-w-5xl mx-auto">
                <div className="hidden md:block absolute top-[25%] left-[20%] right-[20%] h-0.5 border-t-2 border-dashed border-emerald-500/30 -z-10"></div>
                
                <div className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 transform group-hover:rotate-6 shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-3xl sm:text-4xl">manage_search</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">1. Hizmeti Seçin</h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">İhtiyacınıza en uygun profesyonel hizmeti geniş kataloğumuzdan bulun.</p>
                </div>

                <div className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 transform group-hover:-rotate-6 shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-3xl sm:text-4xl">edit_note</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">2. Talep Oluşturun</h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">Neye, ne zaman ihtiyacınız olduğunu belirten basit formumuzu doldurun.</p>
                </div>

                <div className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 transform group-hover:rotate-6 shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-3xl sm:text-4xl">handshake</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">3. Teklifleri Alın</h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">Dakikalar içinde doğrulunmuş uzmanlardan rekabetçi fiyat teklifleri alın.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-14 sm:py-24 w-full bg-white/40 border-y border-white/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-10 sm:mb-16">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2 sm:mb-4 font-display">Kullanıcılarımız Ne Diyor?</h2>
                <div className="flex justify-center gap-0.5 text-emerald-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="material-symbols-outlined fill-current" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                  ))}
                </div>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 font-bold">12.000'den fazla değerlendirme ile 4.9/5 Ortalama Puan</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <img className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-emerald-100" src="https://ui-avatars.com/api/?name=Ayşe+Yılmaz&background=10b981&color=fff" alt="User" />
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-sm sm:text-base">Ayşe Yılmaz</h5>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Kadıköy'de Ev Sahibi</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed italic">"Sadece 10 dakika içinde harika bir tesisatçı buldum. Fiyatlandırma çok şeffaftı ve işçilik kalitesi mükemmeldi."</p>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <img className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-emerald-100" src="https://ui-avatars.com/api/?name=Murat+Kaya&background=10b981&color=fff" alt="User" />
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-sm sm:text-base">Murat Kaya</h5>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Şişli'de İşletmeci</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed italic">"Bir işletmeci olarak, bu platform yeni müşteriler bulma şeklimi tamamen değiştirdi. Buradan gelen taleplerin kalitesi çok yüksek."</p>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <img className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-100" src="https://ui-avatars.com/api/?name=Elif+Demir&background=10b981&color=fff" alt="User" />
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-sm sm:text-base">Elif Demir</h5>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Beşiktaş'ta Kiracı</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed italic">"Mobilya montajından detaylı temizliğe kadar her şey için TalepSistemi'ni kullanıyorum. Hayatımı kolaylaştıran tek uygulama."</p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-14 sm:py-24 w-full max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2 sm:mb-4 font-display">Sıkça Sorulan Sorular</h2>
              <p className="text-slate-500 text-sm sm:text-lg">Platformumuz hakkında bilmeniz gereken her şey</p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300">
                  <button 
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left font-extrabold text-slate-800 hover:bg-slate-50 transition-colors text-sm sm:text-base"
                  >
                    <span>{faq.q}</span>
                    <span className={`material-symbols-outlined text-emerald-500 transition-transform duration-300 shrink-0 ${openFaq === index ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  <div className={`px-5 sm:px-6 overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-40 pb-5 sm:pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 mb-16 sm:mb-24">
            <div className="bg-emerald-500 rounded-[2rem] sm:rounded-[2.5rem] p-6 md:p-16 relative overflow-hidden flex flex-col items-center text-center text-white shadow-2xl shadow-emerald-500/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-900/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
              
              <h2 className="text-xl sm:text-3xl md:text-5xl font-black mb-4 sm:mb-6 relative z-10 font-display">Uzman tavsiyeleri ve özel fırsatlar</h2>
              <p className="text-emerald-50 text-sm sm:text-lg max-w-2xl mx-auto mb-6 sm:mb-10 relative z-10 opacity-90 font-medium">
                100.000'den fazla ev sahibine katılın ve ev bakımı ile indirimler hakkında haftalık ipuçları alın.
              </p>
              
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full max-w-lg relative z-10">
                <input 
                  type="email" 
                  placeholder="E-posta adresiniz" 
                  className="flex-1 px-5 py-3.5 sm:px-6 sm:py-4 bg-white rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-white/30 border-none outline-none placeholder:text-slate-400 text-sm"
                  required
                />
                <button type="submit" className="bg-slate-900 text-white font-extrabold px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl hover:bg-slate-800 transition-colors transform active:scale-95 text-sm">
                  Abone Ol
                </button>
              </form>
            </div>
          </section>

        </main>

        <footer className="bg-white border-t border-slate-200 pt-12 pb-24 sm:pb-8 relative z-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 sm:gap-12 mb-12 sm:mb-16">
              
              <div className="col-span-2 lg:col-span-2">
                <Link href="/" className="flex items-center gap-2 mb-4 group">
                  <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-md">
                    <span className="material-symbols-outlined block text-[20px]">rocket_launch</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-display">Talep<span className="text-emerald-500">Sistemi</span></h2>
                </Link>
                <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed max-w-sm mb-6">
                  Herhangi bir yerel hizmet için birinci sınıf profesyonelleri bulmak, işe almak ve güvenle ödeme yapmak için dünyanın en güvenilir pazar yeri.
                </p>
                <div className="flex gap-3">
                  <a href="#" className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all border border-slate-100"><span className="material-symbols-outlined text-[18px]">share</span></a>
                  <a href="#" className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all border border-slate-100"><span className="material-symbols-outlined text-[18px]">mail</span></a>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 mb-4 text-sm sm:text-base">Şirket</h3>
                <ul className="space-y-3 text-xs sm:text-sm font-bold text-slate-500">
                  <li><Link href="/hakkimizda" className="hover:text-emerald-500 transition-colors">Hakkımızda</Link></li>
                  <li><Link href="/nasil-calisir" className="hover:text-emerald-500 transition-colors">Nasıl Çalışır?</Link></li>
                  <li><Link href="/iletisim" className="hover:text-emerald-500 transition-colors">Bize Ulaşın</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 mb-4 text-sm sm:text-base">Keşfet</h3>
                <ul className="space-y-3 text-xs sm:text-sm font-bold text-slate-500">
                  <li><Link href="/arama" className="hover:text-emerald-500 transition-colors">Tüm Kategoriler</Link></li>
                  <li><Link href="/ustalar-icin" className="hover:text-emerald-500 transition-colors">Uzmanlar İçin</Link></li>
                </ul>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <h3 className="font-extrabold text-slate-900 mb-4 text-sm sm:text-base">Destek</h3>
                <ul className="space-y-3 text-xs sm:text-sm font-bold text-slate-500">
                  <li><Link href="/iletisim" className="hover:text-emerald-500 transition-colors">Yardım Merkezi</Link></li>
                  <li><Link href="/kullanim-sartlari" className="hover:text-emerald-500 transition-colors">Kullanım Şartları</Link></li>
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-center sm:text-left">
              <p className="text-xs sm:text-sm font-bold text-slate-400">© {new Date().getFullYear()} UstaKapında. Tüm hakları saklıdır.</p>
              <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm">
                <Link href="/gizlilik-politikasi" className="font-bold text-slate-400 hover:text-emerald-500 transition-colors">Gizlilik Politikası</Link>
                <Link href="/kullanim-sartlari" className="font-bold text-slate-400 hover:text-emerald-500 transition-colors">Çerez Ayarları</Link>
              </div>
            </div>
          </div>
        </footer>

        {/* MOBİL ALT NAVİGASYON */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 p-2 flex justify-around items-center sm:hidden z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
          <Link href="/" className="flex flex-col items-center gap-1 text-emerald-500 p-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>home</span>
            <span className="text-[10px] font-bold">Anasayfa</span>
          </Link>
          <Link href="/arama" className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 p-2 transition-colors">
            <span className="material-symbols-outlined">search</span>
            <span className="text-[10px] font-bold">Ara</span>
          </Link>
          <Link href="/taleplerim" className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 p-2 transition-colors">
            <span className="material-symbols-outlined">assignment</span>
            <span className="text-[10px] font-bold">Talepler</span>
          </Link>
          <Link href="/profil" className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 p-2 transition-colors">
            <span className="material-symbols-outlined">person</span>
            <span className="text-[10px] font-bold">Profil</span>
          </Link>
        </div>
        
      </div>
    </>
  );
}
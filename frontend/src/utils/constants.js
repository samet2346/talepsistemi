// ==========================================
// 4️⃣ DURUM AKIŞI (STATUS MODELİ)
// ==========================================
// Veritabanında tutulacak ve API'de kontrol edilecek standart durumlar
export const REQUEST_STATUS = {
  PENDING: "pending",             // Beklemede (Henüz teklif yok)
  OFFER_RECEIVED: "offer_received", // Teklif Alındı
  OFFER_UPDATED: "offer_updated",   // Teklif Güncellendi (Revize edildi)
  SELECTED: "selected",           // Usta Seçildi
  IN_PROGRESS: "in_progress",     // İşlemde / Devam Ediyor
  COMPLETED: "completed",         // Tamamlandı
  CANCELLED: "cancelled",         // İptal Edildi
  EXPIRED: "expired",             // Süresi Doldu
};

// UI'da (Arayüzde) göstermek için durum etiketleri ve renk paletleri (Cam efekti/Karanlık temaya uygun)
export const STATUS_UI = {
  [REQUEST_STATUS.PENDING]: { label: "Beklemede", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  [REQUEST_STATUS.OFFER_RECEIVED]: { label: "Teklif Alındı", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  [REQUEST_STATUS.OFFER_UPDATED]: { label: "Teklif Güncellendi", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  [REQUEST_STATUS.SELECTED]: { label: "Usta Seçildi", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  [REQUEST_STATUS.IN_PROGRESS]: { label: "İşlemde", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  [REQUEST_STATUS.COMPLETED]: { label: "Tamamlandı", color: "bg-green-600/10 text-green-600 border-green-600/20" },
  [REQUEST_STATUS.CANCELLED]: { label: "İptal Edildi", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  [REQUEST_STATUS.EXPIRED]: { label: "Süresi Doldu", color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
};

// ==========================================
// 3️⃣ AÇIK AZALTMA MEKANİĞİ (NET KURALLAR)
// ==========================================
export const BIDDING_RULES = {
  MAX_REVISIONS: 3, // Bir usta bir teklifi en fazla 3 kez revize edebilir
  
  // Arayüz yetki kontrolleri (Frontend'de butonları gizlemek/açmak için kullanılacak)
  VISIBILITY: {
    CUSTOMER: {
      CAN_SEE_ALL_OFFERS: true, // Müşteri tüm teklifleri görür
      CAN_SORT_BY_PRICE: true,  // Müşteri fiyat sıralaması yapabilir
    },
    PROVIDER: { // Usta
      CAN_SEE_OTHER_PRICES: false, // Usta diğer fiyatları GÖREMEZ
      CAN_SEE_OWN_OFFER: true,     // Usta sadece kendi teklifini görür
      CAN_SEE_IF_OPEN: true,       // "Talep hala açık" bilgisini görür
    }
  }
};
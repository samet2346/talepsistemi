import api from '@/services/api';

// Varsayılan kategori yedeği (API cevap vermediğinde kullanılır)
const FALLBACK_CATEGORIES = [
  { id: 1, name: "Boya Badana", slug: "boya-badana" },
  { id: 2, name: "Temizlik", slug: "temizlik" },
  { id: 3, name: "Nakliyat", slug: "nakliyat" },
  { id: 4, name: "Elektrik", slug: "elektrik" },
  { id: 5, name: "Tesisat", slug: "tesisat" }
];

export const commonService = {
  // Başlangıç ayarları, tüm kategoriler ve ilçeleri tek seferde çeker
  getConfig: async () => {
    try {
      const response = await api.get('/common/config/');
      
      // Eğer API başarılı döner ama categories boşsa, yedek listeyi ekle
      if (!response.data.categories || response.data.categories.length === 0) {
        response.data.categories = FALLBACK_CATEGORIES;
      }
      
      return response.data;
    } catch (error) {
      console.warn("Config verileri çekilemedi, varsayılan liste kullanılıyor:", error);
      // Hata durumunda boş bırakmak yerine yedekleri döndür
      return { 
        categories: FALLBACK_CATEGORIES, 
        districts: [{ id: 1, name: "Merkez" }], 
        settings: {} 
      };
    }
  },

  getLocations: async (city = 'istanbul') => {
    try {
      const response = await api.get(`/locations/?city=${city}`);
      return response.data;
    } catch (error) {
      console.error("Lokasyonlar çekilemedi:", error);
      return [];
    }
  },

  getCategoryTree: async () => {
    try {
      const response = await api.get('/services/tree/');
      return response.data;
    } catch (error) {
      console.warn("Kategori ağacı çekilemedi, varsayılan yapı yükleniyor...");
      return FALLBACK_CATEGORIES.map(cat => ({
        ...cat,
        subcategories: [] // Ağaç yapısı bozulmasın diye boş dizi
      }));
    }
  }
};
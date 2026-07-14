import api from './api';

export const masterService = {
  // P2P Usta vitrinini (is_provider=True olan kullanıcıları) listeler. Filtreleme destekler.
  // Örn params: { category: 'boya', district: 'kadikoy', min_rating: 4 }
  getMasters: async (params = {}) => {
    const response = await api.get('/masters/list/', { params });
    return response.data;
  },

  // Belirli bir ustanın (id veya slug ile) detaylı profilini getirir
  getMasterDetail: async (id) => {
    const response = await api.get(`/masters/list/${id}/`);
    return response.data;
  }
};
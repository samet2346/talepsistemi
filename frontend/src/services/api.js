import axios from 'axios';

const api = axios.create({
  // 🚀 KESİN ÇÖZÜM: Fallback adresini localhost'a çektik. Next.js private IP hatası vermeyecek!
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Her istekte token'ı otomatik ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
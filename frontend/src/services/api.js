import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1', 
  headers: { 'Content-Type': 'application/json' },
});

// İstek interceptor'ı (Token yönetimi)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Yanıt interceptor'ı (401 hatası ve yönlendirme)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      if (window.location.pathname !== '/giris') window.location.href = '/giris';
    }
    return Promise.reject(error);
  }
);

export default api;
import axios from 'axios';

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔥 YENİ: Token süresi dolunca (401) otomatik giriş sayfasına at
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');

      if (window.location.pathname !== '/giris') {
        window.location.href = '/giris';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
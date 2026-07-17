import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/accounts/login/', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/accounts/register/', userData);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/accounts/me/');
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
  }
};
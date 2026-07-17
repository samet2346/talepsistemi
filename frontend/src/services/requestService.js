import api from './api';

export const requestService = {
  createRequest: async (requestData) => {
    const response = await api.post('/jobs/requests/', requestData);
    return response.data;
  },
  getRequestById: async (id) => {
    const response = await api.get(`/jobs/requests/${id}/`);
    return response.data;
  },
  getMyRequests: async () => {
    const response = await api.get('/jobs/requests/');
    return response.data;
  },
  cancelRequest: async (id) => {
    const response = await api.patch(`/jobs/requests/${id}/`, { status: 'cancelled' });
    return response.data;
  }
};
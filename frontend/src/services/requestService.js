import api from './api';

export const requestService = {
  createRequest: async (requestData) => {
    const response = await api.post('/requests', requestData);
    return response.data;
  },
  
  getRequestById: async (id) => {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },
  
  getMyRequests: async () => {
    const response = await api.get('/requests/my-requests');
    return response.data;
  },
  
  cancelRequest: async (id) => {
    const response = await api.patch(`/requests/${id}/cancel`); 
    return response.data;
  }
};
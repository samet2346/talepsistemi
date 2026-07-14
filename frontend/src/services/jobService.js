import api from '@/services/api';

export const jobService = {
  getJobs: async (params = {}) => {
    const response = await api.get('/jobs/requests/', { params });
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await api.post('/jobs/requests/', jobData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getJobDetail: async (id) => {
    const response = await api.get(`/jobs/requests/${id}/`);
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await api.patch(`/jobs/requests/${id}/`, jobData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/requests/${id}/`);
    return response.data;
  },

  giveOffer: async (jobId, offerData) => {
    const response = await api.post(`/jobs/requests/${jobId}/give-offer/`, offerData);
    return response.data;
  },

  getJobBids: async (jobId, params = {}) => {
    const response = await api.get(`/jobs/requests/${jobId}/bids/`, { params });
    return response.data;
  },

  acceptOffer: async (jobId, offerId) => {
    const response = await api.post(`/jobs/requests/${jobId}/accept-offer/${offerId}/`);
    return response.data;
  },

  completeJob: async (jobId) => {
    const response = await api.post(`/jobs/requests/${jobId}/complete-job/`);
    return response.data;
  },

  // EKSİK OLAN FONKSİYON BURADA
  submitReview: async (reviewData) => {
    const response = await api.post('/reviews/', reviewData);
    return response.data;
  },

  // Usta cevapları için (isteğe bağlı ama lazım olabilir)
  replyReview: async (reviewId, replyData) => {
    const response = await api.post(`/reviews/${reviewId}/reply/`, replyData);
    return response.data;
  }
};
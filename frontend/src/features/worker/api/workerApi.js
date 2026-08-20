import apiClient from '../../../shared/api/axiosClient';

export const fetchWorkers = (params) => apiClient.get('/workers', { params });
export const getWorkerProfile = (id) => apiClient.get(`/workers/${id}`);
export const updateWorkerProfile = (id, payload) => apiClient.put(`/workers/${id}`, payload);

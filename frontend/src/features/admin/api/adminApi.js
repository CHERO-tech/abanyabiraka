import apiClient from '../../../shared/api/axiosClient';

export const fetchDashboardStats = () => apiClient.get('/admin/dashboard');
export const fetchApprovals = () => apiClient.get('/admin/approvals');
export const fetchReports = () => apiClient.get('/admin/reports');
export const updateCategory = (payload) => apiClient.put('/admin/categories', payload);

import apiClient from '../../../shared/api/axiosClient';

export const loginUser = (payload) => apiClient.post('/auth/login', payload);
export const registerUser = (payload) => apiClient.post('/auth/register', payload);
export const verifyOtp = (payload) => apiClient.post('/auth/verify-otp', payload);
export const resetPassword = (payload) => apiClient.post('/auth/reset-password', payload);

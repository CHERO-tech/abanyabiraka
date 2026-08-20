import apiClient from '../../../shared/api/axiosClient';

export const createBooking = (payload) => apiClient.post('/bookings', payload);
export const getBookingStatus = (id) => apiClient.get(`/bookings/${id}`);
export const submitReview = (payload) => apiClient.post('/reviews', payload);

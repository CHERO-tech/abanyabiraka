// One function per backend endpoint. Each returns the response body (not the axios response).
// Endpoint list and request/response fields: see docs/frontend-api-integration.md.
import apiClient from './client';

const data = (request) => request.then((response) => response.data);

export const authApi = {
  register: (payload) => data(apiClient.post('/auth/register', payload)),
  verifyOtp: (payload) => data(apiClient.post('/auth/verify-otp', payload)),
  resendOtp: (payload) => data(apiClient.post('/auth/resend-otp', payload)),
  login: (payload) => data(apiClient.post('/auth/login', payload)),
  forgotPassword: (payload) => data(apiClient.post('/auth/forgot-password', payload)),
  resetPassword: (payload) => data(apiClient.post('/auth/reset-password', payload)),
  me: () => data(apiClient.get('/auth/me')),
};

export const workersApi = {
  // filters: { categoryId, district, sector, minRating, available, minYearsOfExperience, verified }
  search: (filters = {}) => data(apiClient.get('/workers', { params: dropEmpty(filters) })),
  get: (id) => data(apiClient.get(`/workers/${id}`)),
  update: (id, payload) => data(apiClient.put(`/workers/${id}`, payload)),
  addPortfolioItem: (id, file, caption) => data(apiClient.post(`/workers/${id}/portfolio`, toForm({ file }), { params: dropEmpty({ caption }) })),
  uploadDocument: (id, file, documentType) => data(apiClient.post(`/workers/${id}/qualification-documents`, toForm({ file }), { params: { documentType } })),
  verifyIdentity: (id) => data(apiClient.patch(`/workers/${id}/verify-identity`)),
};

export const categoriesApi = {
  list: () => data(apiClient.get('/categories')),
  create: (name) => data(apiClient.post('/categories', { name })),
  update: (id, name) => data(apiClient.put(`/categories/${id}`, { name })),
  remove: (id) => data(apiClient.delete(`/categories/${id}`)),
  professions: (categoryId) => data(apiClient.get(categoryId ? `/categories/${categoryId}/professions` : '/categories/professions')),
  createProfession: (name, categoryId) => data(apiClient.post('/categories/professions', { name, categoryId })),
  removeProfession: (id) => data(apiClient.delete(`/categories/professions/${id}`)),
};

export const bookingsApi = {
  // payload: { workerId, bookingDate: 'YYYY-MM-DDTHH:mm:ss', description }
  create: (payload) => data(apiClient.post('/bookings', payload)),
  forClient: (clientId) => data(apiClient.get('/bookings', { params: { clientId } })),
  forWorker: (workerId) => data(apiClient.get('/bookings', { params: { workerId } })),
  accept: (id) => data(apiClient.patch(`/bookings/${id}/accept`)),
  reject: (id) => data(apiClient.patch(`/bookings/${id}/reject`)),
  complete: (id) => data(apiClient.patch(`/bookings/${id}/complete`)),
};

export const reviewsApi = {
  // payload: { rating: 1-5, comment }
  create: (bookingId, payload) => data(apiClient.post(`/bookings/${bookingId}/review`, payload)),
  forWorker: (workerId) => data(apiClient.get('/reviews', { params: { workerId } })),
};

function dropEmpty(params) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''));
}

function toForm(fields) {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => form.append(key, value));
  return form;
}

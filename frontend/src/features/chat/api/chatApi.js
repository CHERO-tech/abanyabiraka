import apiClient from '../../../shared/api/axiosClient';

export const fetchMessages = (conversationId) => apiClient.get(`/chats/${conversationId}/messages`);
export const sendMessage = (conversationId, payload) => apiClient.post(`/chats/${conversationId}/messages`, payload);

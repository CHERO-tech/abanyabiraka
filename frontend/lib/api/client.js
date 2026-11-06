import axios from 'axios';
import { clearSession, readSession } from '../session';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// Uploaded files are served by the backend at /uploads/..., outside /api.
export const FILES_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

// 75 s: on Render's free plan the backend sleeps when idle and needs ~50 s to wake up, so the first
// request after a quiet spell is slow. A shorter timeout made sign-up "fail" even though it worked.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 75000,
});

// Attach the JWT to every request when the user is logged in.
apiClient.interceptors.request.use((config) => {
  const session = readSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

// A missing/expired token makes Spring Security answer 403 with an EMPTY body (the JWT filter just
// skips a bad token, so the request is anonymous). A real permission problem is also 403 but carries
// { message }. So: 401, or 403 without a message, means "session is gone" -> log in again.
// Auth endpoints are skipped: a wrong password should show its message, and AuthProvider handles a
// stale token on /auth/me by quietly logging out (so public pages don't bounce to /login).
export function isSessionError(error) {
  const status = error?.response?.status;
  return status === 401 || (status === 403 && !error.response.data?.message);
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCall = error.config?.url?.startsWith('/auth/');
    if (isSessionError(error) && !isAuthCall && readSession() && typeof window !== 'undefined') {
      clearSession();
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.assign(`/login?next=${next}&expired=1`);
    }
    return Promise.reject(error);
  },
);

// The backend's error body is { success: false, message: "..." }.
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ECONNABORTED') return 'The server took too long to answer (it may have been waking up). Please try again in a moment.';
  if (error?.code === 'ERR_NETWORK') return `Cannot reach the server at ${API_BASE_URL}. Is the backend running?`;
  return fallback;
}

export function fileUrl(path) {
  if (!path) return '';
  return path.startsWith('http') ? path : `${FILES_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default apiClient;

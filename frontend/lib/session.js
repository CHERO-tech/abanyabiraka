// The logged-in session lives in localStorage so it survives page reloads.
// Shape: { token, userId, fullName, role, identifier }
// `identifier` is the email/phone used to log in - the backend JWT subject.

const STORAGE_KEY = 'abanyabiraka.session';

export function readSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeSession(session) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage can be unavailable (private mode); the user just stays logged in for this tab.
  }
}

export function clearSession() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}

// Where each role lands after logging in.
export function homeForRole(role) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'WORKER') return '/dashboard/worker';
  return '/dashboard/client';
}

'use client';

import Link from 'next/link';
import { AlertTriangle, Info, Loader2, LogOut } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { clearSession, homeForRole } from '@/lib/session';

// Small shared pieces for loading / error / empty states and the signed-in header area.

export function LoadingScreen({ label = 'Loading...' }) {
  return <main className="grid min-h-screen place-items-center bg-canvas"><Spinner label={label} /></main>;
}

export function Spinner({ label = 'Loading...' }) {
  return <p role="status" className="flex items-center gap-2 text-sm text-black/50"><Loader2 size={17} className="animate-spin text-brand-500" /> {label}</p>;
}

export function ErrorNote({ children, onRetry }) {
  if (!children) return null;
  return <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700"><AlertTriangle size={17} className="mt-0.5 shrink-0" /><span className="flex-1">{children}</span>{onRetry && <button type="button" onClick={onRetry} className="font-semibold underline">Retry</button>}</div>;
}

// Shown on pages whose backend is not available on this branch yet (chat, admin users/reports...).
export function PreviewBanner({ children }) {
  return <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800"><Info size={17} className="mt-0.5 shrink-0" /><span>{children}</span></div>;
}

// "Log in / Join" when logged out, "Dashboard / Log out" when logged in.
export function AccountLinks() {
  const { session, ready } = useAuth();

  if (!ready) return <div className="h-10 w-40" />;

  if (!session) {
    return <div className="flex items-center gap-3 text-sm font-semibold"><Link className="hidden px-3 py-2 text-black/65 hover:text-brand-600 sm:block" href="/login">Log in</Link><Link className="rounded-full bg-brand-500 px-4 py-2.5 text-white shadow-soft transition hover:bg-brand-600" href="/register">Join Abanyabiraka</Link></div>;
  }

  return <div className="flex items-center gap-3 text-sm font-semibold"><Link className="rounded-full bg-brand-500 px-4 py-2.5 text-white shadow-soft transition hover:bg-brand-600" href={homeForRole(session.role)}>My dashboard</Link><LogoutButton to="/" /></div>;
}

// Logging out does a full page load instead of updating React state: otherwise the page's
// RequireRole guard sees "no session" first and redirects to /login?next=<this page>, which would
// send the NEXT person who logs in on this browser to the previous user's page.
export function LogoutButton({ to = '/login' }) {
  return <button type="button" onClick={() => { clearSession(); window.location.assign(to); }} className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-black/55 hover:text-brand-600" aria-label="Log out"><LogOut size={17} /><span className="hidden sm:inline">Log out</span></button>;
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { homeForRole } from '@/lib/session';
import { LoadingScreen } from './ui';

// Page guard used by the layout.js of protected route folders.
//   not logged in  -> redirect to /login?next=<this page>
//   wrong role     -> "no access" screen with a link to the user's own dashboard
// This is a UX guard only - the backend still checks the JWT and role on every request.
export default function RequireRole({ roles, children }) {
  const { session, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, session, pathname, router]);

  if (!ready || !session) return <LoadingScreen label="Checking your session..." />;

  if (!roles.includes(session.role)) {
    return <main className="grid min-h-screen place-items-center bg-canvas px-5"><section className="w-full max-w-md rounded-3xl border border-black/8 bg-white p-8 text-center shadow-soft"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600"><ShieldAlert size={26} /></div><h1 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">This page isn&apos;t for your account.</h1><p className="mt-3 text-sm leading-6 text-black/55">You are signed in as <strong className="text-ink">{session.role.toLowerCase()}</strong>. This area is for {roles.map((role) => role.toLowerCase()).join(' or ')} accounts.</p><Link href={homeForRole(session.role)} className="mt-6 flex items-center justify-center rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600">Go to my dashboard</Link></section></main>;
  }

  return children;
}

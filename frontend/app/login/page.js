'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import { authApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/api/client';
import { homeForRole } from '@/lib/session';
import { useAuth } from '@/components/AuthProvider';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const sessionExpired = searchParams.get('expired') === '1';

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNeedsVerification(false);
    setIsSubmitting(true);
    const contact = identifier.trim();
    try {
      const auth = await authApi.login({ identifier: contact, password });
      await signIn(auth, contact);
      // Only follow ?next= for in-app paths, never to another site.
      const next = searchParams.get('next');
      router.replace(next && next.startsWith('/') && !next.startsWith('//') ? next : homeForRole(auth.role));
    } catch (err) {
      // 403 here means the account exists but OTP verification was never completed.
      setNeedsVerification(err.response?.status === 403);
      setError(getErrorMessage(err, 'Could not sign you in. Please try again.'));
      setIsSubmitting(false);
    }
  }

  return <section className="rounded-3xl border border-black/8 bg-white p-6 shadow-soft sm:p-9"><p className="eyebrow">Sign in</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-ink">Welcome back to Abanyabiraka.</h1><p className="mt-3 text-sm leading-6 text-black/55">Use your email or phone number to continue.</p>{sessionExpired && <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Your session has expired. Please sign in again.</p>}<form onSubmit={handleSubmit} className="mt-8 space-y-5"><label className="block text-sm font-semibold text-black/70">Email or phone number<input required value={identifier} onChange={(event) => setIdentifier(event.target.value)} type="text" autoComplete="username" placeholder="you@example.com" className="mt-2 block w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 font-normal text-ink outline-none placeholder:text-black/35 focus:border-brand-500 focus:ring-4 focus:ring-brand-50" /></label><label className="block text-sm font-semibold text-black/70">Password<div className="relative mt-2"><input required value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" className="block w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 pr-12 font-normal text-ink outline-none placeholder:text-black/35 focus:border-brand-500 focus:ring-4 focus:ring-brand-50" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-black/40 hover:text-brand-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label><div className="flex justify-end"><Link href="/reset-password" className="text-sm font-semibold text-brand-600 hover:text-brand-700">Forgot password?</Link></div>{error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700">{error}{needsVerification && <Link href={`/verify-otp?contact=${encodeURIComponent(identifier.trim())}`} className="mt-1 block font-semibold underline">Enter your verification code</Link>}</div>}<button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-wait disabled:opacity-60">{isSubmitting ? 'Signing in...' : 'Sign in'} {!isSubmitting && <ArrowRight size={17} />}</button></form><div className="my-7 flex items-center gap-3 text-xs text-black/35"><span className="h-px flex-1 bg-black/10" /> or <span className="h-px flex-1 bg-black/10" /></div><Link href="/register" className="flex w-full items-center justify-center rounded-xl border border-black/10 px-5 py-3.5 text-sm font-semibold text-ink transition hover:border-brand-300 hover:text-brand-600">Create a new account</Link><p className="mt-6 text-center text-xs leading-5 text-black/40">By continuing, you agree to Abanyabiraka&apos;s <Link href="/terms" className="underline">terms and privacy policy</Link>.</p></section>;
}

export default function LoginPage() {
  return <main className="min-h-screen bg-canvas"><header className="border-b border-black/5 bg-white"><div className="container-shell flex h-20 items-center justify-between"><Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-[-0.04em]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-lg text-white">A</span>abanyabiraka</Link><Link href="/register" className="text-sm font-semibold text-black/55 hover:text-brand-600">New here? <span className="text-brand-600">Create an account</span></Link></div></header><div className="container-shell grid min-h-[calc(100vh-5rem)] items-center gap-12 py-12 lg:grid-cols-[1fr_460px]"><section className="hidden lg:block"><p className="eyebrow">Welcome back</p><h1 className="mt-4 max-w-xl text-6xl font-semibold leading-[1.02] tracking-[-0.06em] text-ink">Your trusted work network is waiting.</h1><p className="mt-6 max-w-lg text-lg leading-8 text-black/55">Sign in to manage bookings, continue conversations, and keep your favourite professionals close.</p><div className="mt-10 grid max-w-lg gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft"><ShieldCheck className="text-brand-500" size={22} /><h2 className="mt-8 font-semibold">Verified by design</h2><p className="mt-2 text-sm leading-6 text-black/50">Identity and qualifications are part of every professional profile.</p></div><div className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft"><LockKeyhole className="text-brand-500" size={22} /><h2 className="mt-8 font-semibold">Your conversations, private</h2><p className="mt-2 text-sm leading-6 text-black/50">Keep booking details and messages in one secure place.</p></div></div></section><Suspense fallback={null}><LoginForm /></Suspense></div></main>;
}

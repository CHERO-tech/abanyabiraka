'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, RefreshCw, ShieldCheck } from 'lucide-react';

function VerificationForm() {
  const searchParams = useSearchParams();
  const contact = searchParams.get('contact') || 'your email or phone number';
  const [code, setCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit verification code.');
      return;
    }
    setError('');
    setSubmitted(true);
  }

  if (submitted) {
    return <section className="w-full max-w-lg rounded-3xl border border-black/8 bg-white p-8 text-center shadow-soft md:p-12"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600"><CheckCircle2 size={32} /></div><p className="eyebrow mt-6">Contact verified</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">Your account is ready.</h1><p className="mx-auto mt-4 max-w-sm leading-7 text-black/60">Your verification step is complete. You can now continue to Abanyabiraka.</p><Link href="/login" className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 font-semibold text-white hover:bg-brand-600">Continue to login <ArrowRight size={17} /></Link></section>;
  }

  return <section className="w-full max-w-lg rounded-3xl border border-black/8 bg-white p-6 shadow-soft sm:p-9"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Mail size={25} /></div><p className="eyebrow mt-6 text-center">Verify your contact</p><h1 className="mt-3 text-center text-3xl font-semibold tracking-[-0.05em] text-ink">Enter your verification code.</h1><p className="mx-auto mt-4 max-w-sm text-center text-sm leading-6 text-black/55">We sent a six-digit code to <strong className="text-ink">{contact}</strong>.</p><form onSubmit={handleSubmit} className="mt-8"><label className="block text-sm font-semibold text-black/70">Verification code<input required inputMode="numeric" maxLength={6} value={code} onChange={(event) => { setCode(event.target.value.replace(/\D/g, '')); setError(''); }} placeholder="000000" aria-label="Six digit verification code" className="mt-2 block w-full rounded-xl border border-black/10 px-4 py-4 text-center text-2xl font-semibold tracking-[0.45em] outline-none placeholder:text-black/20 focus:border-brand-500 focus:ring-4 focus:ring-brand-50" /></label>{error && <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button type="submit" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 font-semibold text-white hover:bg-brand-600">Verify code <ArrowRight size={17} /></button></form><div className="mt-6 text-center text-sm text-black/50"><span>Didn&apos;t receive it? </span><button type="button" onClick={() => setResent(true)} className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700"><RefreshCw size={14} /> Resend code</button>{resent && <p className="mt-2 text-xs text-emerald-700">A new code has been requested.</p>}</div><div className="mt-7 flex items-start gap-3 rounded-xl bg-canvas p-4 text-sm leading-6 text-black/55"><ShieldCheck className="mt-0.5 shrink-0 text-brand-500" size={18} /><span>Your verification code expires soon. Never share it with anyone.</span></div><Link href="/register" className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-black/50 hover:text-brand-600"><ArrowLeft size={15} /> Back to registration</Link></section>;
}
export default function VerifyOtpPage() {
  return <main className="grid min-h-screen place-items-center bg-canvas px-5 py-12"><Suspense fallback={<p className="text-sm text-black/50">Loading verification...</p>}><VerificationForm /></Suspense></main>;
}

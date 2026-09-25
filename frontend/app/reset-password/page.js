'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';

export default function ResetPasswordPage() {
  const [step, setStep] = useState('contact');
  const [contact, setContact] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');

  function requestCode(event) {
    event.preventDefault();
    setError('');
    setStep('code');
  }

  function resetPassword(event) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit reset code.');
      return;
    }
    if (password.length < 8) {
      setError('Your new password must contain at least 8 characters.');
      return;
    }
    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setStep('success');
  }

  if (step === 'success') {
    return <main className="grid min-h-screen place-items-center bg-canvas px-5 py-12"><section className="w-full max-w-lg rounded-3xl border border-black/8 bg-white p-8 text-center shadow-soft md:p-12"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600"><CheckCircle2 size={32} /></div><p className="eyebrow mt-6">Password updated</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">You&apos;re ready to sign in.</h1><p className="mx-auto mt-4 max-w-sm leading-7 text-black/60">Your password has been reset successfully. Use your new password to access your account.</p><Link href="/login" className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 font-semibold text-white hover:bg-brand-600">Continue to login <ArrowRight size={17} /></Link></section></main>;
  }

  return <main className="min-h-screen bg-canvas"><header className="border-b border-black/5 bg-white"><div className="container-shell flex h-20 items-center justify-between"><Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-[-0.04em]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-lg text-white">A</span>abanyabiraka</Link><Link href="/login" className="flex items-center gap-2 text-sm font-semibold text-black/55 hover:text-brand-600"><ArrowLeft size={16} /> Back to login</Link></div></header><div className="container-shell grid min-h-[calc(100vh-5rem)] items-center gap-12 py-12 lg:grid-cols-[1fr_460px]"><section className="hidden lg:block"><p className="eyebrow">Account recovery</p><h1 className="mt-4 max-w-xl text-6xl font-semibold leading-[1.02] tracking-[-0.06em] text-ink">A fresh start is a few steps away.</h1><p className="mt-6 max-w-lg text-lg leading-8 text-black/55">Reset your password securely and get back to finding trusted help or growing your service business.</p><div className="mt-10 flex items-center gap-3 text-sm text-black/55"><LockKeyhole className="text-brand-500" size={21} /> Your account stays protected throughout recovery.</div></section><section className="rounded-3xl border border-black/8 bg-white p-6 shadow-soft sm:p-9">{step === 'contact' ? <><div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Mail size={25} /></div><p className="eyebrow mt-6">Forgot your password?</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-ink">Find your account.</h1><p className="mt-3 text-sm leading-6 text-black/55">Enter the email or phone number linked to your account and we&apos;ll send a reset code.</p><form onSubmit={requestCode} className="mt-8"><label className="block text-sm font-semibold text-black/70">Email or phone number<input required value={contact} onChange={(event) => setContact(event.target.value)} type="text" placeholder="you@example.com or +250 788 000 000" className="mt-2 block w-full rounded-xl border border-black/10 px-4 py-3.5 font-normal outline-none placeholder:text-black/35 focus:border-brand-500 focus:ring-4 focus:ring-brand-50" /></label><button type="submit" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 font-semibold text-white hover:bg-brand-600">Send reset code <ArrowRight size={17} /></button></form></> : <><div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><LockKeyhole size={25} /></div><p className="eyebrow mt-6">Reset password</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-ink">Choose a new password.</h1><p className="mt-3 text-sm leading-6 text-black/55">Enter the six-digit code sent to <strong className="text-ink">{contact}</strong>, then create a new password.</p><form onSubmit={resetPassword} className="mt-8 space-y-5"><label className="block text-sm font-semibold text-black/70">Reset code<input required inputMode="numeric" maxLength={6} value={code} onChange={(event) => { setCode(event.target.value.replace(/\D/g, '')); setError(''); }} placeholder="000000" className="mt-2 block w-full rounded-xl border border-black/10 px-4 py-3.5 text-center text-xl font-semibold tracking-[0.35em] outline-none placeholder:text-black/20 focus:border-brand-500 focus:ring-4 focus:ring-brand-50" /></label><label className="block text-sm font-semibold text-black/70">New password<div className="relative mt-2"><input required minLength={8} type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="block w-full rounded-xl border border-black/10 px-4 py-3.5 pr-11 font-normal outline-none placeholder:text-black/35 focus:border-brand-500 focus:ring-4 focus:ring-brand-50" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-black/40 hover:text-brand-600" aria-label={showPassword ? 'Hide new password' : 'Show new password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label><label className="block text-sm font-semibold text-black/70">Confirm new password<div className="relative mt-2"><input required minLength={8} type={showConfirmation ? 'text' : 'password'} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Repeat your new password" className="block w-full rounded-xl border border-black/10 px-4 py-3.5 pr-11 font-normal outline-none placeholder:text-black/35 focus:border-brand-500 focus:ring-4 focus:ring-brand-50" /><button type="button" onClick={() => setShowConfirmation((visible) => !visible)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-black/40 hover:text-brand-600" aria-label={showConfirmation ? 'Hide confirmation password' : 'Show confirmation password'}>{showConfirmation ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 font-semibold text-white hover:bg-brand-600">Update password <ArrowRight size={17} /></button></form><button type="button" onClick={() => { setStep('contact'); setError(''); }} className="mt-5 w-full text-center text-sm font-semibold text-black/50 hover:text-brand-600">Use a different contact</button></>}</section></div></main>;
}

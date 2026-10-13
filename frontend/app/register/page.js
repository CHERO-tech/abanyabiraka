'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BriefcaseBusiness, Check, Eye, EyeOff, UserRound } from 'lucide-react';
import { authApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/api/client';

const roles = [
  { value: 'client', label: 'I need a service', description: 'Find and book trusted professionals.', icon: UserRound },
  { value: 'worker', label: 'I offer services', description: 'Build a profile and meet new clients.', icon: BriefcaseBusiness },
];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('client');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = form.get('password');
    const confirmation = form.get('confirmation');
    const contact = String(form.get('contact')).trim();

    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    // The backend takes email OR phone; one field here, split on "@".
    const isEmail = contact.includes('@');
    try {
      await authApi.register({
        fullName: String(form.get('name')).trim(),
        email: isEmail ? contact : undefined,
        phone: isEmail ? undefined : contact,
        password,
        role: role.toUpperCase(),
      });
      router.push(`/verify-otp?contact=${encodeURIComponent(contact)}`);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create your account. Please try again.'));
      setIsSubmitting(false);
    }
  }

  return <main className="min-h-screen bg-canvas"><header className="border-b border-black/5 bg-white"><div className="container-shell flex h-20 items-center justify-between"><Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-[-0.04em]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-lg text-white">A</span>abanyabiraka</Link><p className="text-sm text-black/55">Already registered? <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign in</Link></p></div></header><div className="container-shell grid min-h-[calc(100vh-5rem)] items-center gap-12 py-12 lg:grid-cols-[.9fr_1.1fr]"><section className="hidden lg:block"><p className="eyebrow">Join the community</p><h1 className="mt-4 max-w-lg text-6xl font-semibold leading-[1.02] tracking-[-0.06em] text-ink">Start with the right kind of account.</h1><p className="mt-6 max-w-md text-lg leading-8 text-black/55">Whether you need help or provide it, Abanyabiraka makes local work easier to find and easier to trust.</p><div className="mt-10 space-y-4 text-sm text-black/60"><p className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-700">1</span> Choose how you&apos;ll use Abanyabiraka</p><p className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-700">2</span> Add your basic account details</p><p className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-700">3</span> Verify your contact details</p></div></section><section className="rounded-3xl border border-black/8 bg-white p-6 shadow-soft sm:p-9"><p className="eyebrow">Create an account</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-ink">Welcome to Abanyabiraka.</h1><p className="mt-3 text-sm leading-6 text-black/55">Choose your role to get a tailored experience.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{roles.map(({ value, label, description, icon: Icon }) => <button type="button" key={value} onClick={() => setRole(value)} className={`rounded-2xl border p-4 text-left transition ${role === value ? 'border-brand-500 bg-brand-50 ring-4 ring-brand-50' : 'border-black/10 bg-white hover:border-brand-200'}`}><div className="flex items-center justify-between"><Icon size={21} className={role === value ? 'text-brand-600' : 'text-black/45'} />{role === value && <Check size={18} className="text-brand-600" />}</div><p className="mt-5 text-sm font-semibold">{label}</p><p className="mt-1 text-xs leading-5 text-black/50">{description}</p></button>)}</div><form onSubmit={handleSubmit} className="mt-7 space-y-5"><label className="block text-sm font-semibold text-black/70">Full name<input required name="name" type="text" autoComplete="name" placeholder="Your full name" className="mt-2 block w-full rounded-xl border border-black/10 px-4 py-3.5 font-normal outline-none placeholder:text-black/35 focus:border-brand-500 focus:ring-4 focus:ring-brand-50" /></label><label className="block text-sm font-semibold text-black/70">Email or phone number<input required name="contact" type="text" autoComplete="email" placeholder="you@example.com or +250 788 000 000" className="mt-2 block w-full rounded-xl border border-black/10 px-4 py-3.5 font-normal outline-none placeholder:text-black/35 focus:border-brand-500 focus:ring-4 focus:ring-brand-50" /></label><div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-semibold text-black/70">Password<div className="relative mt-2"><input required name="password" minLength={8} type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 8 characters" className="block w-full rounded-xl border border-black/10 px-4 py-3.5 pr-11 font-normal outline-none placeholder:text-black/35 focus:border-brand-500 focus:ring-4 focus:ring-brand-50" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-black/40 hover:text-brand-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label><label className="block text-sm font-semibold text-black/70">Confirm password<div className="relative mt-2"><input required name="confirmation" minLength={8} type={showConfirmation ? 'text' : 'password'} autoComplete="new-password" placeholder="Repeat your password" className="block w-full rounded-xl border border-black/10 px-4 py-3.5 pr-11 font-normal outline-none placeholder:text-black/35 focus:border-brand-500 focus:ring-4 focus:ring-brand-50" /><button type="button" onClick={() => setShowConfirmation((visible) => !visible)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-black/40 hover:text-brand-600" aria-label={showConfirmation ? 'Hide confirmation password' : 'Show confirmation password'}>{showConfirmation ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label></div><label className="flex items-start gap-3 text-sm leading-6 text-black/55"><input required name="terms" type="checkbox" className="mt-1 h-4 w-4 accent-orange-500" /> <span>I agree to the <Link href="/terms" className="font-semibold text-brand-600">Terms of Service</Link> and <Link href="/terms" className="font-semibold text-brand-600">Privacy Policy</Link>.</span></label>{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-wait disabled:opacity-60">{isSubmitting ? 'Creating account...' : 'Create account'} {!isSubmitting && <ArrowRight size={17} />}</button></form></section></div></main>;
}

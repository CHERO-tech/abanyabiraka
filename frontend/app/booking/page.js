'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, CheckCircle2, Clock3, MapPin, ShieldCheck, Star } from 'lucide-react';
import { bookingsApi, workersApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/api/client';
import { formatRating, initials, workerLocation, workerTrade } from '@/lib/format';
import { ErrorNote, LoadingScreen } from '@/components/ui';

function BookingForm() {
  const searchParams = useSearchParams();
  const workerId = searchParams.get('worker');
  const [worker, setWorker] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!workerId) return;
    workersApi.get(workerId).then(setWorker).catch((err) => setLoadError(getErrorMessage(err, 'Could not load this professional.')));
  }, [workerId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      // Backend expects a LocalDateTime string without timezone: "2026-10-20T08:00:00".
      await bookingsApi.create({ workerId: Number(workerId), bookingDate: `${date}T${time}:00`, description: note.trim() });
      setSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send your booking request.'));
      setIsSubmitting(false);
    }
  }

  if (!workerId || loadError) {
    return <main className="grid min-h-screen place-items-center bg-canvas px-5"><section className="w-full max-w-md rounded-3xl border border-black/8 bg-white p-8 text-center shadow-soft"><h1 className="text-2xl font-semibold tracking-[-0.04em]">Choose a professional first.</h1><p className="mt-3 text-sm leading-6 text-black/55">{loadError || 'Bookings are made from a professional\'s profile.'}</p><Link href="/workers" className="mt-6 flex items-center justify-center rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600">Browse professionals</Link></section></main>;
  }
  if (!worker) return <LoadingScreen label="Loading booking details..." />;

  if (submitted) {
    return <main className="grid min-h-screen place-items-center bg-canvas px-5 py-12"><section className="w-full max-w-lg rounded-3xl border border-black/8 bg-white p-8 text-center shadow-soft md:p-12"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600"><CheckCircle2 size={32} /></div><p className="eyebrow mt-6">Booking request sent</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">You&apos;re on your way.</h1><p className="mx-auto mt-4 max-w-sm leading-7 text-black/60">{worker.fullName.split(' ')[0]} will review your request and confirm shortly. We&apos;ll notify you when the booking status changes.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"><Link href="/workers" className="flex items-center justify-center gap-2 rounded-xl border border-black/10 px-5 py-3 text-sm font-semibold hover:border-brand-300 hover:text-brand-600">Find another professional</Link><Link href="/dashboard/client" className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600">Track my bookings <ArrowRight size={16} /></Link></div></section></main>;
  }

  return <main className="min-h-screen bg-canvas"><header className="border-b border-black/5 bg-white"><div className="container-shell flex h-20 items-center justify-between gap-6"><Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-[-0.04em]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-lg text-white">A</span>abanyabiraka</Link><Link href={`/workers/${workerId}`} className="flex items-center gap-2 text-sm font-semibold text-black/55 hover:text-brand-600"><ArrowLeft size={16} /> Back to profile</Link></div></header><div className="container-shell grid gap-8 py-10 md:py-16 lg:grid-cols-[1fr_380px]"><section><p className="eyebrow">Request a booking</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-ink md:text-5xl">Tell us what you need.</h1><p className="mt-5 max-w-xl leading-7 text-black/55">Choose a convenient time and describe the work so your professional can arrive prepared.</p><form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-black/8 bg-white p-6 shadow-soft md:p-8"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-black/70">Preferred date<input required type="date" min={new Date().toISOString().split('T')[0]} value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 block w-full rounded-xl border border-black/10 bg-white px-3 py-3 font-normal text-ink outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50" /></label><label className="text-sm font-semibold text-black/70">Preferred time<select required value={time} onChange={(event) => setTime(event.target.value)} className="mt-2 block w-full rounded-xl border border-black/10 bg-white px-3 py-3 font-normal text-ink outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50"><option value="">Select a time</option><option value="08:00">Morning, 8:00 - 12:00</option><option value="12:00">Afternoon, 12:00 - 16:00</option><option value="16:00">Evening, 16:00 - 19:00</option></select></label></div><label className="mt-5 block text-sm font-semibold text-black/70">Describe the job<textarea required minLength={15} rows={6} value={note} onChange={(event) => setNote(event.target.value)} placeholder="For example: Two-bedroom flat, weekly clean, Saturday mornings" className="mt-2 block w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-3 font-normal leading-6 text-ink outline-none placeholder:text-black/35 focus:border-brand-500 focus:ring-4 focus:ring-brand-50" /></label><div className="mt-6 flex items-start gap-3 rounded-xl bg-brand-50 p-4 text-sm leading-6 text-brand-700"><ShieldCheck className="mt-0.5 shrink-0" size={19} /><span>You can agree on the exact scope and price in chat before work begins.</span></div>{error && <div className="mt-5"><ErrorNote>{error}</ErrorNote></div>}<button type="submit" disabled={isSubmitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-wait disabled:opacity-60">{isSubmitting ? 'Sending...' : 'Send booking request'} {!isSubmitting && <ArrowRight size={17} />}</button></form></section><aside className="h-fit rounded-2xl border border-black/8 bg-white p-6 shadow-soft lg:sticky lg:top-6"><p className="eyebrow">Your professional</p><div className="mt-5 flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-100 text-lg font-bold text-brand-700">{initials(worker.fullName)}</div><div><h2 className="font-semibold">{worker.fullName}</h2><p className="mt-1 text-sm text-brand-600">{workerTrade(worker)}</p></div></div><div className="mt-6 space-y-4 border-y border-black/5 py-5 text-sm"><p className="flex items-center gap-2 text-black/55"><MapPin size={17} /> {workerLocation(worker)}</p><p className="flex items-center gap-2 text-black/55"><Star size={17} fill="currentColor" className="text-brand-500" /> <strong className="text-ink">{formatRating(worker.rating)}</strong> rating</p><p className={`flex items-center gap-2 ${worker.available ? 'text-emerald-700' : 'text-black/45'}`}><Clock3 size={17} /> {worker.available ? 'Taking bookings' : 'Not taking bookings'}</p></div><div className="mt-5 flex items-start gap-3 text-sm leading-6 text-black/55"><CalendarDays className="mt-0.5 shrink-0 text-brand-500" size={18} /><span>Requests are confirmed by the professional before they become active bookings.</span></div>{worker.verified && <span className="mt-5 flex items-center gap-2 text-xs font-semibold text-brand-700"><BadgeCheck size={15} /> Verified profile</span>}</aside></div></main>;
}

export default function BookingPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-canvas"><p className="text-sm text-black/50">Loading booking details...</p></main>}><BookingForm /></Suspense>;
}

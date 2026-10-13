'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, CheckCircle2, ChevronRight, MessageCircle, Search, Star, X } from 'lucide-react';
import { bookingsApi, reviewsApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/api/client';
import { formatDateTime, initials, StatusPill } from '@/lib/format';
import { useAuth } from '@/components/AuthProvider';
import { ErrorNote, LogoutButton, Spinner } from '@/components/ui';

const TABS = {
  Upcoming: (booking) => booking.status === 'PENDING' || booking.status === 'ACCEPTED',
  Completed: (booking) => booking.status === 'COMPLETED',
  All: () => true,
};

// Review form for one COMPLETED booking: POST /api/bookings/{id}/review
function ReviewDialog({ booking, onClose, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await reviewsApi.create(booking.id, { rating, comment: comment.trim() || undefined });
      onDone(`Thanks! Your review of ${booking.workerName} was published.`);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save your review.'));
      setIsSubmitting(false);
    }
  }

  return <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="review-title"><form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Leave a review</p><h2 id="review-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">How did {booking.workerName} do?</h2></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-black/40 hover:text-black" aria-label="Close"><X size={18} /></button></div><div className="mt-6 flex gap-1" role="radiogroup" aria-label="Rating">{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} role="radio" aria-checked={rating === value} aria-label={`${value} star${value > 1 ? 's' : ''}`} onClick={() => setRating(value)} className="p-1"><Star size={30} className={value <= rating ? 'text-brand-500' : 'text-black/15'} fill="currentColor" /></button>)}</div><label className="mt-5 block text-sm font-semibold text-black/70">Comment (optional)<textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={4} placeholder="What went well? What could be better?" className="mt-2 block w-full resize-y rounded-xl border border-black/10 px-3 py-3 font-normal leading-6 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50" /></label>{error && <div className="mt-4"><ErrorNote>{error}</ErrorNote></div>}<button type="submit" disabled={isSubmitting} className="mt-6 flex w-full items-center justify-center rounded-xl bg-brand-500 py-3 font-semibold text-white hover:bg-brand-600 disabled:opacity-60">{isSubmitting ? 'Publishing...' : 'Publish review'}</button></form></div>;
}

export default function ClientDashboardPage() {
  const { session, profile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [reviewing, setReviewing] = useState(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(() => {
    // clientId comes from GET /api/auth/me. No client row yet = no bookings yet.
    if (!profile) return;
    if (!profile.clientId) {
      setBookings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    bookingsApi.forClient(profile.clientId)
      .then((list) => setBookings([...list].sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))))
      .catch((err) => setError(getErrorMessage(err, 'Could not load your bookings.')))
      .finally(() => setLoading(false));
  }, [profile]);

  useEffect(load, [load]);

  const visibleBookings = bookings.filter(TABS[activeTab]);
  const activeCount = bookings.filter(TABS.Upcoming).length;
  const pendingCount = bookings.filter((booking) => booking.status === 'PENDING').length;
  const completedCount = bookings.filter(TABS.Completed).length;
  const firstName = (profile?.fullName || session.fullName || '').split(' ')[0];

  return <main className="min-h-screen bg-canvas"><header className="border-b border-black/5 bg-white"><div className="container-shell flex h-20 items-center justify-between gap-5"><Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-[-0.04em]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-lg text-white">A</span>abanyabiraka</Link><nav className="hidden items-center gap-6 text-sm font-medium text-black/55 md:flex"><Link href="/workers" className="hover:text-brand-600">Find a professional</Link><Link href="/chat" className="hover:text-brand-600">Messages</Link></nav><div className="flex items-center gap-3"><span className="hidden text-sm font-semibold text-black/60 sm:block">{session.fullName}</span><span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">{initials(session.fullName)}</span><LogoutButton /></div></div></header><div className="container-shell py-8 md:py-10"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">Client dashboard</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-ink md:text-5xl">Welcome, {firstName}.</h1><p className="mt-4 text-black/55">Keep track of your bookings and the professionals you work with.</p></div><Link href="/workers" className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600"><Search size={17} /> Find a professional</Link></div>{notice && <div role="status" className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><CheckCircle2 size={17} /> {notice}</div>}<div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft"><div className="flex items-center justify-between"><p className="text-sm text-black/50">Active bookings</p><CalendarDays className="text-brand-500" size={19} /></div><p className="mt-4 text-3xl font-semibold">{activeCount}</p><p className="mt-2 text-xs text-black/45">{pendingCount} waiting for a reply</p></div><div className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft"><div className="flex items-center justify-between"><p className="text-sm text-black/50">Completed jobs</p><CheckCircle2 className="text-brand-500" size={19} /></div><p className="mt-4 text-3xl font-semibold">{completedCount}</p><p className="mt-2 text-xs text-black/45">You can review each one</p></div><Link href="/chat" className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft hover:border-brand-200"><div className="flex items-center justify-between"><p className="text-sm text-black/50">Messages</p><MessageCircle className="text-brand-500" size={19} /></div><p className="mt-4 text-sm font-semibold text-ink">Open your conversations</p><p className="mt-2 text-xs text-black/45">Chat is in preview</p></Link></div><section className="mt-8 rounded-2xl border border-black/8 bg-white shadow-soft"><div className="flex items-center justify-between border-b border-black/5 p-5"><div><p className="eyebrow">Your activity</p><h2 className="mt-1 text-xl font-semibold">Bookings</h2></div><div className="flex gap-1 rounded-lg bg-canvas p-1">{Object.keys(TABS).map((tab) => <button type="button" key={tab} onClick={() => setActiveTab(tab)} className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${activeTab === tab ? 'bg-white text-brand-600 shadow-sm' : 'text-black/45'}`}>{tab}</button>)}</div></div>{error && <div className="p-5"><ErrorNote onRetry={load}>{error}</ErrorNote></div>}{loading ? <div className="flex justify-center p-10"><Spinner label="Loading bookings..." /></div> : <div className="divide-y divide-black/5">{visibleBookings.map((booking) => <div key={booking.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">{initials(booking.workerName)}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{booking.workerName || 'Professional'}</h3><StatusPill status={booking.status} /><span className="text-xs text-black/35">#{booking.id}</span></div>{booking.description && <p className="mt-1 line-clamp-2 text-sm text-black/55">{booking.description}</p>}<p className="mt-2 flex items-center gap-1 text-xs text-black/45"><CalendarDays size={13} /> {formatDateTime(booking.bookingDate)}</p></div><div className="flex items-center gap-3">{booking.status === 'COMPLETED' && <button type="button" onClick={() => setReviewing(booking)} className="flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100"><Star size={14} /> Review</button>}<Link href={`/workers/${booking.workerId}`} className="flex items-center gap-1 text-sm font-semibold text-brand-600">Profile <ChevronRight size={15} /></Link></div></div>)}{!visibleBookings.length && !error && <p className="p-10 text-center text-sm text-black/50">{bookings.length ? 'No bookings in this view.' : 'You have no bookings yet. Find a professional to get started.'}</p>}</div>}<div className="border-t border-black/5 p-4"><Link href="/workers" className="flex items-center justify-center gap-2 text-sm font-semibold text-brand-600">Request another service <ArrowRight size={15} /></Link></div></section></div>{reviewing && <ReviewDialog booking={reviewing} onClose={() => setReviewing(null)} onDone={(message) => { setReviewing(null); setNotice(message); }} />}</main>;
}

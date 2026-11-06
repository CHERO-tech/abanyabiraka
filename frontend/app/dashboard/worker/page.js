'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, BadgeCheck, BriefcaseBusiness, CalendarDays, Check, CheckCircle2, Clock3, Edit3, MessageCircle, Star, UserRound } from 'lucide-react';
import { bookingsApi, workersApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/api/client';
import { formatDateTime, formatRating, initials, profileChecklist, StatusPill } from '@/lib/format';
import { useAuth } from '@/components/AuthProvider';
import { ErrorNote, LoadingScreen, LogoutButton, Spinner } from '@/components/ui';

export default function WorkerDashboardPage() {
  const { session, profile } = useAuth();
  const [worker, setWorker] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState('');

  const workerId = profile?.workerId;

  const load = useCallback(() => {
    if (!workerId) return;
    setLoading(true);
    setError('');
    Promise.all([workersApi.get(workerId), bookingsApi.forWorker(workerId)])
      .then(([workerData, list]) => {
        setWorker(workerData);
        setBookings([...list].sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate)));
      })
      .catch((err) => setError(getErrorMessage(err, 'Could not load your dashboard.')))
      .finally(() => setLoading(false));
  }, [workerId]);

  useEffect(load, [load]);

  // accept / reject / complete -> PATCH /api/bookings/{id}/<action>, then swap in the updated booking.
  async function act(booking, action, verb) {
    setBusyId(booking.id);
    setError('');
    try {
      const updated = await bookingsApi[action](booking.id);
      setBookings((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice(`${booking.clientName || 'The client'}'s booking was ${verb}.`);
      window.setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update the booking.'));
    } finally {
      setBusyId(null);
    }
  }

  if (!profile) return <LoadingScreen label="Loading your dashboard..." />;
  if (!workerId) {
    return <main className="grid min-h-screen place-items-center bg-canvas px-5"><section className="max-w-md rounded-3xl border border-black/8 bg-white p-8 text-center shadow-soft"><h1 className="text-2xl font-semibold">No worker profile found.</h1><p className="mt-3 text-sm leading-6 text-black/55">Your account doesn&apos;t have a worker profile yet. Profiles are created when a worker account verifies its code. Please contact support.</p><div className="mt-5 flex justify-center"><LogoutButton /></div></section></main>;
  }

  const requests = bookings.filter((booking) => booking.status === 'PENDING');
  const active = bookings.filter((booking) => booking.status === 'ACCEPTED');
  const history = bookings.filter((booking) => booking.status === 'COMPLETED' || booking.status === 'REJECTED').reverse();
  const checklist = profileChecklist(worker);
  const completion = Math.round((checklist.filter(([, done]) => done).length / checklist.length) * 100);
  const firstName = session.fullName.split(' ')[0];

  return <main className="min-h-screen bg-canvas"><header className="border-b border-black/5 bg-white"><div className="container-shell flex h-20 items-center justify-between gap-5"><Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-[-0.04em]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-lg text-white">A</span>abanyabiraka</Link><nav className="hidden items-center gap-6 text-sm font-medium text-black/55 md:flex"><Link href="/dashboard/worker" className="text-brand-600">Dashboard</Link><Link href="/chat" className="hover:text-brand-600">Messages</Link><Link href={`/workers/${workerId}`} className="hover:text-brand-600">Public profile</Link></nav><div className="flex items-center gap-3"><span className="hidden text-sm font-semibold text-black/60 sm:block">{session.fullName}</span><Link href="/dashboard/worker/profile" className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">{initials(session.fullName)}</Link><LogoutButton /></div></div></header><div className="container-shell py-8 md:py-10"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">Worker dashboard</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-ink md:text-5xl">Welcome, {firstName}.</h1><p className="mt-4 text-black/55">Manage your work, respond to clients, and keep your profile ready to be discovered.</p></div><Link href="/dashboard/worker/profile" className="flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-ink hover:border-brand-300 hover:text-brand-600"><Edit3 size={17} /> Edit profile</Link></div>{notice && <div role="status" className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><CheckCircle2 size={17} /> {notice}</div>}{error && <div className="mt-6"><ErrorNote onRetry={load}>{error}</ErrorNote></div>}{loading && !worker ? <div className="mt-10 flex justify-center"><Spinner label="Loading..." /></div> : <><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft"><div className="flex items-center justify-between"><p className="text-sm text-black/50">New requests</p><Clock3 className="text-brand-500" size={19} /></div><p className="mt-4 text-3xl font-semibold">{requests.length}</p><p className="mt-2 text-xs text-black/45">Waiting for your reply</p></div><div className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft"><div className="flex items-center justify-between"><p className="text-sm text-black/50">Active bookings</p><CalendarDays className="text-brand-500" size={19} /></div><p className="mt-4 text-3xl font-semibold">{active.length}</p><p className="mt-2 text-xs text-black/45">{active[0] ? `Next: ${formatDateTime(active[0].bookingDate)}` : 'Nothing scheduled'}</p></div><div className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft"><div className="flex items-center justify-between"><p className="text-sm text-black/50">Completed jobs</p><BriefcaseBusiness className="text-brand-500" size={19} /></div><p className="mt-4 text-3xl font-semibold">{bookings.filter((booking) => booking.status === 'COMPLETED').length}</p><p className="mt-2 text-xs text-black/45">Since joining Abanyabiraka</p></div><div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 shadow-soft"><div className="flex items-center justify-between"><p className="text-sm text-brand-700">Your rating</p><Star className="text-brand-600" size={19} fill="currentColor" /></div><p className="mt-4 text-3xl font-semibold text-brand-700">{formatRating(worker?.rating)}</p><p className="mt-2 text-xs font-semibold text-brand-700">From client reviews</p></div></div><div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_1fr]"><section className="rounded-2xl border border-black/8 bg-white shadow-soft"><div className="flex items-center justify-between border-b border-black/5 p-5"><div><p className="eyebrow">Needs your response</p><h2 className="mt-1 text-xl font-semibold">Booking requests</h2></div><span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{requests.length} new</span></div><div className="divide-y divide-black/5">{requests.length ? requests.map((booking) => <article key={booking.id} className="p-5"><div className="flex items-start gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">{initials(booking.clientName)}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{booking.clientName || 'Client'}</h3><span className="text-xs text-black/35">#{booking.id}</span></div>{booking.description && <p className="mt-2 text-sm leading-6 text-black/55">{booking.description}</p>}<p className="mt-3 flex items-center gap-1 text-xs text-black/45"><CalendarDays size={13} /> {formatDateTime(booking.bookingDate)}</p></div></div><div className="mt-4 flex gap-2 border-t border-black/5 pt-4"><button type="button" disabled={busyId === booking.id} onClick={() => act(booking, 'accept', 'accepted')} className="flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-60"><Check size={15} /> Accept request</button><button type="button" disabled={busyId === booking.id} onClick={() => act(booking, 'reject', 'declined')} className="rounded-lg border border-black/10 px-4 py-2 text-xs font-semibold text-black/55 hover:border-red-200 hover:text-red-600 disabled:opacity-60">Decline</button><Link href="/chat" className="ml-auto flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold text-black/55 hover:border-brand-300 hover:text-brand-600"><MessageCircle size={15} /> Message</Link></div></article>) : <div className="p-10 text-center"><CheckCircle2 className="mx-auto text-brand-500" size={30} /><p className="mt-3 text-sm text-black/50">You are all caught up.</p></div>}</div></section><section className="rounded-2xl border border-black/8 bg-white shadow-soft"><div className="border-b border-black/5 p-5"><p className="eyebrow">Scheduled work</p><h2 className="mt-1 text-xl font-semibold">Accepted bookings</h2></div><div className="divide-y divide-black/5">{active.length ? active.map((booking) => <div key={booking.id} className="flex items-center gap-3 p-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{initials(booking.clientName)}</div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold">{booking.clientName || 'Client'}</h3><p className="mt-1 text-xs text-black/45">{formatDateTime(booking.bookingDate)}</p></div><button type="button" disabled={busyId === booking.id} onClick={() => act(booking, 'complete', 'marked as completed')} className="shrink-0 rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold text-black/60 hover:border-brand-300 hover:text-brand-600 disabled:opacity-60">Mark complete</button></div>) : <p className="p-8 text-center text-sm text-black/50">No accepted bookings right now.</p>}</div>{history.length > 0 && <><div className="border-y border-black/5 bg-canvas px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-black/40">History</div><div className="divide-y divide-black/5">{history.slice(0, 5).map((booking) => <div key={booking.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm"><span className="truncate">{booking.clientName || 'Client'} · {formatDateTime(booking.bookingDate)}</span><StatusPill status={booking.status} /></div>)}</div></>}</section></div><div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]"><section className="rounded-2xl border border-black/8 bg-white p-6 shadow-soft"><div className="flex items-start gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><BadgeCheck size={23} /></div><div className="flex-1"><div className="flex items-center justify-between gap-3"><div><p className="eyebrow">Profile visibility</p><h2 className="mt-1 text-xl font-semibold">{worker?.verified ? 'Verified and visible' : 'Waiting for admin approval'}</h2></div><span className="text-sm font-bold text-brand-600">{completion}%</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-brand-100"><div className="h-full rounded-full bg-brand-500" style={{ width: `${completion}%` }} /></div><p className="mt-3 text-sm leading-6 text-black/55">{worker?.verified ? 'Clients can find you in search.' : 'Clients can only find you in search after an admin approves your profile.'} Still missing: {checklist.filter(([, done]) => !done).map(([label]) => label.toLowerCase()).join(', ') || 'nothing'}.</p><Link href="/dashboard/worker/profile" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">Complete profile <ArrowRight size={15} /></Link></div></div></section><section className="rounded-2xl border border-black/8 bg-white p-6 shadow-soft"><div className="flex items-start gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><UserRound size={23} /></div><div><p className="eyebrow">Public profile</p><h2 className="mt-1 text-xl font-semibold">See what clients see</h2><p className="mt-3 text-sm leading-6 text-black/55">{worker?.available ? 'You are currently accepting new bookings.' : 'You are not accepting new bookings. Turn this on in your profile.'}</p><Link href={`/workers/${workerId}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">View public profile <ArrowRight size={15} /></Link></div></div></section></div></>}</div></main>;
}

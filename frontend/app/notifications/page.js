'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, BadgeCheck, Bell, CalendarCheck, Check, CheckCheck, MessageCircle, ShieldCheck, Star } from 'lucide-react';

const initialNotifications = [
  { id: 1, type: 'booking', title: 'Booking request accepted', text: 'Eric Nsengimana accepted your auto mechanic request for tomorrow at 09:30.', time: '10 minutes ago', unread: true },
  { id: 2, type: 'message', title: 'New message from Aline Mukamana', text: 'I can confirm the Saturday morning slot.', time: '32 minutes ago', unread: true },
  { id: 3, type: 'verification', title: 'Your profile is verified', text: 'You can now book services and message verified professionals on Abanyabiraka.', time: 'Yesterday', unread: false },
  { id: 4, type: 'review', title: 'Your review was submitted', text: 'Thank you for helping the community choose trusted local services.', time: '2 days ago', unread: false },
  { id: 5, type: 'booking', title: 'Booking completed', text: 'Your housekeeping booking with Claudine Uwase is ready for a review.', time: '3 days ago', unread: false },
];

const iconByType = { booking: CalendarCheck, message: MessageCircle, verification: ShieldCheck, review: Star };
const toneByType = { booking: 'bg-orange-100 text-orange-700', message: 'bg-sky-100 text-sky-700', verification: 'bg-emerald-100 text-emerald-700', review: 'bg-amber-100 text-amber-700' };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState('All');
  const unreadCount = notifications.filter((notification) => notification.unread).length;
  const visibleNotifications = useMemo(() => filter === 'Unread' ? notifications.filter((notification) => notification.unread) : notifications, [filter, notifications]);

  function markRead(id) {
    setNotifications((current) => current.map((notification) => notification.id === id ? { ...notification, unread: false } : notification));
  }

  function markAllRead() {
    setNotifications((current) => current.map((notification) => ({ ...notification, unread: false })));
  }

  return <main className="min-h-screen bg-canvas"><header className="border-b border-black/5 bg-white"><div className="container-shell flex h-20 items-center justify-between gap-5"><Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-[-0.04em]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-lg text-white">A</span>abanyabiraka</Link><div className="flex items-center gap-4"><Link href="/dashboard/client" className="flex items-center gap-2 text-sm font-semibold text-black/55 hover:text-brand-600"><ArrowLeft size={16} /> Dashboard</Link><Link href="/chat" className="hidden text-sm font-semibold text-brand-600 sm:block">Messages</Link></div></div></header><div className="container-shell max-w-4xl py-8 md:py-12"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Stay up to date</p><div className="mt-2 flex items-center gap-3"><h1 className="text-4xl font-semibold tracking-[-0.05em] text-ink">Notifications</h1>{unreadCount > 0 && <span className="rounded-full bg-brand-500 px-2.5 py-1 text-xs font-bold text-white">{unreadCount} new</span>}</div><p className="mt-4 text-black/55">Booking updates, messages, and account activity in one place.</p></div><button type="button" onClick={markAllRead} disabled={!unreadCount} className="flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black/60 hover:border-brand-300 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"><CheckCheck size={17} /> Mark all as read</button></div><div className="mt-8 flex gap-1 rounded-xl bg-white p-1 shadow-soft sm:w-fit"><button type="button" onClick={() => setFilter('All')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${filter === 'All' ? 'bg-brand-500 text-white' : 'text-black/50 hover:text-brand-600'}`}>All notifications</button><button type="button" onClick={() => setFilter('Unread')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${filter === 'Unread' ? 'bg-brand-500 text-white' : 'text-black/50 hover:text-brand-600'}`}>Unread {unreadCount > 0 && `(${unreadCount})`}</button></div><section className="mt-5 overflow-hidden rounded-2xl border border-black/8 bg-white shadow-soft"><div className="divide-y divide-black/5">{visibleNotifications.map((notification) => { const Icon = iconByType[notification.type] || Bell; return <article key={notification.id} className={`flex gap-4 p-5 transition ${notification.unread ? 'bg-brand-50/40' : ''}`}><div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${toneByType[notification.type]}`}><Icon size={19} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div className="flex items-center gap-2"><h2 className={`text-sm ${notification.unread ? 'font-bold' : 'font-semibold'}`}>{notification.title}</h2>{notification.unread && <span className="h-2 w-2 rounded-full bg-brand-500" />}</div><span className="shrink-0 text-xs text-black/35">{notification.time}</span></div><p className="mt-2 text-sm leading-6 text-black/55">{notification.text}</p><div className="mt-3 flex items-center gap-4">{notification.type === 'message' && <Link href="/chat" className="text-xs font-semibold text-brand-600 hover:text-brand-700">Open messages</Link>}{notification.type === 'booking' && <Link href="/dashboard/client" className="text-xs font-semibold text-brand-600 hover:text-brand-700">View booking</Link>}{notification.type === 'review' && <Link href="/workers/3" className="text-xs font-semibold text-brand-600 hover:text-brand-700">View professional</Link>}{notification.unread && <button type="button" onClick={() => markRead(notification.id)} className="flex items-center gap-1 text-xs font-semibold text-black/45 hover:text-brand-600"><Check size={14} /> Mark read</button>}</div></div></article>; })}{!visibleNotifications.length && <div className="p-14 text-center"><BadgeCheck className="mx-auto text-brand-500" size={32} /><h2 className="mt-4 font-semibold">You&apos;re all caught up</h2><p className="mt-2 text-sm text-black/50">There are no unread notifications right now.</p></div>}</div></section></div></main>;
}

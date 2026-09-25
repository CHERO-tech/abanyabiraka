'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Ban, CheckCircle2, ChevronRight, Search, ShieldCheck, UserRound, Users, X } from 'lucide-react';

const initialUsers = [
  { id: 'USR-2846', name: 'Aline Mukamana', contact: 'aline@example.com', role: 'Worker', status: 'Active', joined: 'Today', verified: true },
  { id: 'USR-2845', name: 'Diane K.', contact: 'diane@example.com', role: 'Client', status: 'Active', joined: 'Yesterday', verified: false },
  { id: 'USR-2844', name: 'Eric Nsengimana', contact: '+250 788 321 456', role: 'Worker', status: 'Active', joined: '2 days ago', verified: true },
  { id: 'USR-2843', name: 'Patrick M.', contact: 'patrick@example.com', role: 'Client', status: 'Suspended', joined: '3 days ago', verified: false },
  { id: 'USR-2842', name: 'Claudine Uwase', contact: 'claudine@example.com', role: 'Worker', status: 'Active', joined: '4 days ago', verified: true },
];

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('All roles');
  const [status, setStatus] = useState('All statuses');
  const [notice, setNotice] = useState('');
  const visibleUsers = useMemo(() => users.filter((user) => (role === 'All roles' || user.role === role) && (status === 'All statuses' || user.status === status) && `${user.name} ${user.contact} ${user.id}`.toLowerCase().includes(query.toLowerCase())), [query, role, status, users]);

  function toggleStatus(id) {
    const user = users.find((item) => item.id === id);
    const nextStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    setUsers((current) => current.map((item) => item.id === id ? { ...item, status: nextStatus } : item));
    setNotice(`${user.name} is now ${nextStatus.toLowerCase()}.`);
    window.setTimeout(() => setNotice(''), 2800);
  }

  return <main className="min-h-screen bg-canvas"><header className="border-b border-black/5 bg-white"><div className="container-shell flex h-20 items-center justify-between gap-5"><Link href="/admin" className="flex items-center gap-2 text-lg font-bold tracking-[-0.04em]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-lg text-white">A</span>abanyabiraka <span className="hidden text-sm font-normal text-black/35 sm:inline">/ Admin</span></Link><Link href="/admin" className="flex items-center gap-2 text-sm font-semibold text-black/55 hover:text-brand-600"><ArrowLeft size={16} /> Dashboard</Link></div></header><div className="container-shell py-8 md:py-10"><p className="eyebrow">Account management</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-ink md:text-5xl">Users</h1><p className="mt-4 max-w-xl leading-7 text-black/55">View client and worker accounts, monitor verification, and manage access to the marketplace.</p>{notice && <div role="status" className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><CheckCircle2 size={17} /> {notice}</div>}<div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft"><p className="text-sm text-black/50">Total users</p><p className="mt-3 text-3xl font-semibold">{users.length}</p></div><div className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft"><p className="text-sm text-black/50">Workers</p><p className="mt-3 text-3xl font-semibold">{users.filter((user) => user.role === 'Worker').length}</p></div><div className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft"><p className="text-sm text-black/50">Suspended</p><p className="mt-3 text-3xl font-semibold">{users.filter((user) => user.status === 'Suspended').length}</p></div></div><section className="mt-8 overflow-hidden rounded-2xl border border-black/8 bg-white shadow-soft"><div className="flex flex-col gap-3 border-b border-black/5 p-5 md:flex-row md:items-center"><label className="flex flex-1 items-center gap-3 rounded-xl bg-canvas px-3 py-2.5"><Search size={17} className="text-black/40" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users" className="min-w-0 flex-1 bg-transparent text-sm outline-none" aria-label="Search users" /></label><select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none"><option>All roles</option><option>Client</option><option>Worker</option></select><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none"><option>All statuses</option><option>Active</option><option>Suspended</option></select></div><div className="divide-y divide-black/5">{visibleUsers.map((user) => <div key={user.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700"><UserRound size={19} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{user.name}</h2><span className="rounded-full bg-canvas px-2 py-1 text-[11px] font-semibold text-black/55">{user.role}</span>{user.verified && <span className="flex items-center gap-1 text-xs font-semibold text-brand-600"><ShieldCheck size={13} /> Verified</span>}</div><p className="mt-1 text-sm text-black/50">{user.contact} · Joined {user.joined}</p><p className="mt-1 text-xs text-black/35">{user.id}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{user.status}</span><button type="button" onClick={() => toggleStatus(user.id)} className="flex items-center justify-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold text-black/55 hover:border-brand-300 hover:text-brand-600">{user.status === 'Active' ? <><Ban size={15} /> Suspend</> : <><CheckCircle2 size={15} /> Reactivate</>}</button><ChevronRight size={17} className="hidden text-black/25 md:block" /></div>)}{!visibleUsers.length && <p className="p-10 text-center text-sm text-black/50">No users match these filters.</p>}</div></section></div></main>;
}

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, BarChart3, Check, CheckCircle2, Edit3, LayoutDashboard, Plus, Search, Settings, ToggleLeft, ToggleRight, Trash2, Users } from 'lucide-react';

const initialCategories = [
  { id: 1, name: 'Home services', description: 'Repairs, cleaning, laundry, and household support.', workers: 328, bookings: 914, status: 'Active', updated: 'Today' },
  { id: 2, name: 'Automotive', description: 'Mechanics, diagnostics, servicing, and roadside repairs.', workers: 214, bookings: 606, status: 'Active', updated: 'Yesterday' },
  { id: 3, name: 'Beauty & fashion', description: 'Hair, makeup, tailoring, and personal styling.', workers: 182, bookings: 478, status: 'Active', updated: '2 days ago' },
  { id: 4, name: 'Events & catering', description: 'Cooks, decorators, photographers, and event support.', workers: 156, bookings: 344, status: 'Active', updated: '3 days ago' },
  { id: 5, name: 'Agriculture', description: 'Gardeners, landscapers, and seasonal farm services.', workers: 96, bookings: 208, status: 'Inactive', updated: '1 week ago' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [notice, setNotice] = useState('');
  const visibleCategories = categories.filter((category) => `${category.name} ${category.description}`.toLowerCase().includes(query.toLowerCase()));

  function flash(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2800);
  }

  function addCategory(event) {
    event.preventDefault();
    const newCategory = { id: Date.now(), name, description, workers: 0, bookings: 0, status: 'Active', updated: 'Just now' };
    setCategories((current) => [newCategory, ...current]);
    setName('');
    setDescription('');
    setShowForm(false);
    flash(`${name} was added to the marketplace.`);
  }

  function toggleCategory(id) {
    const category = categories.find((item) => item.id === id);
    const nextStatus = category.status === 'Active' ? 'Inactive' : 'Active';
    setCategories((current) => current.map((item) => item.id === id ? { ...item, status: nextStatus, updated: 'Just now' } : item));
    flash(`${category.name} is now ${nextStatus.toLowerCase()}.`);
  }

  function removeCategory(id) {
    const category = categories.find((item) => item.id === id);
    setCategories((current) => current.filter((item) => item.id !== id));
    flash(`${category.name} was removed.`);
  }

  return <main className="min-h-screen bg-canvas"><header className="border-b border-black/5 bg-white"><div className="container-shell flex h-20 items-center justify-between gap-5"><Link href="/admin" className="flex items-center gap-2 text-lg font-bold tracking-[-0.04em]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-lg text-white">A</span>abanyabiraka <span className="hidden text-sm font-normal text-black/35 sm:inline">/ Admin</span></Link><Link href="/admin" className="flex items-center gap-2 text-sm font-semibold text-black/55 hover:text-brand-600"><ArrowLeft size={16} /> Dashboard</Link></div></header><div className="container-shell py-8 md:py-10"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">Marketplace configuration</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-ink md:text-5xl">Service categories</h1><p className="mt-4 max-w-xl leading-7 text-black/55">Keep the services easy to browse, relevant to clients, and useful for local professionals.</p></div><button type="button" onClick={() => setShowForm((visible) => !visible)} className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600"><Plus size={17} /> Add category</button></div>{notice && <div role="status" className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><CheckCircle2 size={17} /> {notice}</div>}{showForm && <form onSubmit={addCategory} className="mt-6 grid gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-5 md:grid-cols-[.7fr_1fr_auto] md:items-end"><label className="text-sm font-semibold text-black/70">Category name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Home tutoring" className="mt-2 block w-full rounded-xl border border-black/10 bg-white px-3 py-3 font-normal outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50" /></label><label className="text-sm font-semibold text-black/70">Description<input required value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short description for clients" className="mt-2 block w-full rounded-xl border border-black/10 bg-white px-3 py-3 font-normal outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50" /></label><button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-black"><Check size={17} /> Save</button></form>}<div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft"><p className="text-sm text-black/50">Total categories</p><p className="mt-3 text-3xl font-semibold tracking-[-0.05em]">{categories.length}</p></div><div className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft"><p className="text-sm text-black/50">Active categories</p><p className="mt-3 text-3xl font-semibold tracking-[-0.05em]">{categories.filter((category) => category.status === 'Active').length}</p></div><div className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft"><p className="text-sm text-black/50">Listed professionals</p><p className="mt-3 text-3xl font-semibold tracking-[-0.05em]">{categories.reduce((total, category) => total + category.workers, 0).toLocaleString()}</p></div></div><section className="mt-8 overflow-hidden rounded-2xl border border-black/8 bg-white shadow-soft"><div className="flex flex-col justify-between gap-4 border-b border-black/5 p-5 sm:flex-row sm:items-center"><div><p className="eyebrow">Category manager</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">All service categories</h2></div><label className="flex items-center gap-3 rounded-xl bg-canvas px-3 py-2.5 sm:w-72"><Search size={17} className="text-black/40" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search categories" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/40" aria-label="Search categories" /></label></div><div className="divide-y divide-black/5">{visibleCategories.length ? visibleCategories.map((category) => <div key={category.id} className="flex flex-col gap-5 p-5 md:flex-row md:items-center"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><Settings size={19} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{category.name}</h3><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${category.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{category.status}</span></div><p className="mt-1 text-sm text-black/50">{category.description}</p><p className="mt-2 text-xs text-black/35">Updated {category.updated}</p></div><div className="grid grid-cols-2 gap-4 text-sm md:flex md:items-center md:gap-7"><span className="flex items-center gap-1.5 text-black/55"><Users size={15} className="text-brand-500" /> {category.workers} workers</span><span className="flex items-center gap-1.5 text-black/55"><BarChart3 size={15} className="text-brand-500" /> {category.bookings} bookings</span></div><div className="flex gap-2"><button type="button" onClick={() => toggleCategory(category.id)} className="rounded-lg border border-black/10 p-2 text-black/45 hover:border-brand-300 hover:text-brand-600" aria-label={`Toggle ${category.name}`}>{category.status === 'Active' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}</button><button type="button" className="rounded-lg border border-black/10 p-2 text-black/45 hover:border-brand-300 hover:text-brand-600" aria-label={`Edit ${category.name}`}><Edit3 size={17} /></button><button type="button" onClick={() => removeCategory(category.id)} className="rounded-lg border border-black/10 p-2 text-black/45 hover:border-red-200 hover:text-red-600" aria-label={`Delete ${category.name}`}><Trash2 size={17} /></button></div></div>) : <p className="p-10 text-center text-sm text-black/50">No categories match your search.</p>}</div></section><Link href="/admin" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700">Back to dashboard <ArrowRight size={15} /></Link></div></main>;
}

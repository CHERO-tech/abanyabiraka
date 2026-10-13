'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronDown, Edit3, Plus, Search, Settings, Trash2, X } from 'lucide-react';
import { categoriesApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/api/client';
import { ErrorNote, LogoutButton, Spinner } from '@/components/ui';

const fieldClass = 'block w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [openId, setOpenId] = useState(null);
  const [newProfession, setNewProfession] = useState('');
  const [notice, setNotice] = useState('');

  // Categories and all professions are loaded once; professions are grouped by categoryId below.
  const load = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([categoriesApi.list(), categoriesApi.professions()])
      .then(([categoryList, professionList]) => { setCategories(categoryList); setProfessions(professionList); })
      .catch((err) => setError(getErrorMessage(err, 'Could not load categories.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  function flash(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2800);
  }

  // Runs one API call; shows its error message, or refreshes and flashes a success message.
  async function run(action, success) {
    setError('');
    try {
      await action();
      flash(success);
      load();
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    }
  }

  async function addCategory(event) {
    event.preventDefault();
    if (await run(() => categoriesApi.create(name.trim()), `${name.trim()} was added.`)) {
      setName('');
      setShowForm(false);
    }
  }

  async function renameCategory(event, category) {
    event.preventDefault();
    if (await run(() => categoriesApi.update(category.id, editName.trim()), `Renamed to ${editName.trim()}.`)) setEditingId(null);
  }

  function removeCategory(category) {
    if (!window.confirm(`Delete "${category.name}"? This cannot be undone.`)) return;
    run(() => categoriesApi.remove(category.id), `${category.name} was removed.`);
  }

  async function addProfession(event, category) {
    event.preventDefault();
    if (await run(() => categoriesApi.createProfession(newProfession.trim(), category.id), `${newProfession.trim()} was added to ${category.name}.`)) setNewProfession('');
  }

  function removeProfession(profession) {
    if (!window.confirm(`Delete the profession "${profession.name}"?`)) return;
    run(() => categoriesApi.removeProfession(profession.id), `${profession.name} was removed.`);
  }

  const visibleCategories = categories.filter((category) => category.name.toLowerCase().includes(query.toLowerCase()));
  const professionsOf = (categoryId) => professions.filter((profession) => profession.categoryId === categoryId);

  return <main className="min-h-screen bg-canvas"><header className="border-b border-black/5 bg-white"><div className="container-shell flex h-20 items-center justify-between gap-5"><Link href="/admin" className="flex items-center gap-2 text-lg font-bold tracking-[-0.04em]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-lg text-white">A</span>abanyabiraka <span className="hidden text-sm font-normal text-black/35 sm:inline">/ Admin</span></Link><div className="flex items-center gap-3"><Link href="/admin" className="flex items-center gap-2 text-sm font-semibold text-black/55 hover:text-brand-600"><ArrowLeft size={16} /> Dashboard</Link><LogoutButton /></div></div></header><div className="container-shell py-8 md:py-10"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">Marketplace configuration</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-ink md:text-5xl">Service categories</h1><p className="mt-4 max-w-xl leading-7 text-black/55">Categories group the marketplace; each has professions that workers pick on their profile.</p></div><button type="button" onClick={() => setShowForm((visible) => !visible)} className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600"><Plus size={17} /> Add category</button></div>{notice && <div role="status" className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><CheckCircle2 size={17} /> {notice}</div>}{error && <div className="mt-6"><ErrorNote>{error}</ErrorNote></div>}{showForm && <form onSubmit={addCategory} className="mt-6 grid gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-5 md:grid-cols-[1fr_auto] md:items-end"><label className="text-sm font-semibold text-black/70">Category name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Home repairs" className={`mt-2 ${fieldClass}`} /></label><button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-black"><Check size={17} /> Save</button></form>}<div className="mt-8 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft"><p className="text-sm text-black/50">Categories</p><p className="mt-3 text-3xl font-semibold tracking-[-0.05em]">{categories.length}</p></div><div className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft"><p className="text-sm text-black/50">Professions</p><p className="mt-3 text-3xl font-semibold tracking-[-0.05em]">{professions.length}</p></div></div><section className="mt-8 overflow-hidden rounded-2xl border border-black/8 bg-white shadow-soft"><div className="flex flex-col justify-between gap-4 border-b border-black/5 p-5 sm:flex-row sm:items-center"><div><p className="eyebrow">Category manager</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">All service categories</h2></div><label className="flex items-center gap-3 rounded-xl bg-canvas px-3 py-2.5 sm:w-72"><Search size={17} className="text-black/40" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search categories" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/40" aria-label="Search categories" /></label></div>{loading ? <div className="flex justify-center p-10"><Spinner label="Loading categories..." /></div> : <div className="divide-y divide-black/5">{visibleCategories.length ? visibleCategories.map((category) => { const list = professionsOf(category.id); const open = openId === category.id; return <div key={category.id}><div className="flex flex-col gap-4 p-5 md:flex-row md:items-center"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><Settings size={19} /></div><div className="min-w-0 flex-1">{editingId === category.id ? <form onSubmit={(event) => renameCategory(event, category)} className="flex gap-2"><input required autoFocus value={editName} onChange={(event) => setEditName(event.target.value)} className={fieldClass} aria-label="New category name" /><button type="submit" className="rounded-lg bg-ink px-3 text-white" aria-label="Save name"><Check size={16} /></button><button type="button" onClick={() => setEditingId(null)} className="rounded-lg border border-black/10 px-3" aria-label="Cancel"><X size={16} /></button></form> : <><h3 className="font-semibold">{category.name}</h3><button type="button" onClick={() => setOpenId(open ? null : category.id)} className="mt-1 flex items-center gap-1 text-sm text-black/50 hover:text-brand-600">{list.length} profession{list.length === 1 ? '' : 's'} <ChevronDown size={14} className={open ? 'rotate-180' : ''} /></button></>}</div><div className="flex gap-2"><button type="button" onClick={() => { setEditingId(category.id); setEditName(category.name); }} className="rounded-lg border border-black/10 p-2 text-black/45 hover:border-brand-300 hover:text-brand-600" aria-label={`Rename ${category.name}`}><Edit3 size={17} /></button><button type="button" onClick={() => removeCategory(category)} className="rounded-lg border border-black/10 p-2 text-black/45 hover:border-red-200 hover:text-red-600" aria-label={`Delete ${category.name}`}><Trash2 size={17} /></button></div></div>{open && <div className="border-t border-black/5 bg-canvas px-5 py-4 md:pl-[5.25rem]"><div className="flex flex-wrap gap-2">{list.map((profession) => <span key={profession.id} className="flex items-center gap-1 rounded-full border border-black/10 bg-white py-1 pl-3 pr-1 text-sm">{profession.name}<button type="button" onClick={() => removeProfession(profession)} className="rounded-full p-1 text-black/35 hover:text-red-600" aria-label={`Delete ${profession.name}`}><X size={13} /></button></span>)}{!list.length && <span className="text-sm text-black/45">No professions yet.</span>}</div><form onSubmit={(event) => addProfession(event, category)} className="mt-3 flex max-w-md gap-2"><input required value={newProfession} onChange={(event) => setNewProfession(event.target.value)} placeholder="Add a profession, e.g. Plumber" className={fieldClass} /><button type="submit" className="flex items-center gap-1 rounded-xl bg-brand-500 px-3 text-sm font-semibold text-white hover:bg-brand-600"><Plus size={15} /> Add</button></form></div>}</div>; }) : <p className="p-10 text-center text-sm text-black/50">{categories.length ? 'No categories match your search.' : 'No categories yet. Add the first one above.'}</p>}</div>}</section><Link href="/admin" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700">Back to dashboard <ArrowRight size={15} /></Link></div></main>;
}

'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, BadgeCheck, Filter, MapPin, Search, SlidersHorizontal, Star } from 'lucide-react';
import { categoriesApi, workersApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/api/client';
import { formatRating, initials, workerLocation, workerTrade } from '@/lib/format';
import { DISTRICTS } from '@/lib/rwanda';
import { AccountLinks, ErrorNote, Spinner } from '@/components/ui';

const tones = ['bg-orange-100 text-orange-700', 'bg-slate-100 text-slate-700', 'bg-amber-100 text-amber-700', 'bg-stone-200 text-stone-700'];

function Header() {
  return <header className="border-b border-black/5 bg-white"><div className="container-shell flex h-20 items-center gap-8"><Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-[-0.04em]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-lg text-white">A</span>abanyabiraka</Link><nav className="ml-auto hidden items-center gap-7 text-sm font-medium text-black/60 md:flex"><Link className="hover:text-brand-600" href="/">Home</Link><Link className="text-brand-600" href="/workers">Find a professional</Link><Link className="hover:text-brand-600" href="/for-workers">For workers</Link></nav><AccountLinks /></div></header>;
}

function WorkerCard({ worker, index }) {
  return <article className="flex flex-col rounded-2xl border border-black/8 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-brand-200"><div className="flex items-start justify-between gap-4"><div className={`grid h-14 w-14 place-items-center rounded-full text-sm font-bold ${tones[index % tones.length]}`}>{initials(worker.fullName)}</div>{worker.verified && <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700"><BadgeCheck size={13} /> Verified</span>}</div><div className="mt-5"><h2 className="font-semibold text-ink">{worker.fullName}</h2><p className="mt-1 text-sm text-brand-600">{workerTrade(worker)}</p></div><div className="mt-4 flex items-center gap-2 text-sm text-black/60"><span className="flex items-center gap-1 font-semibold text-ink"><Star size={15} fill="currentColor" className="text-brand-500" /> {formatRating(worker.rating)}</span>{worker.yearsOfExperience != null && <><span className="text-black/25">|</span><span>{worker.yearsOfExperience} yrs experience</span></>}</div><p className="mt-3 flex items-center gap-1.5 text-sm text-black/50"><MapPin size={15} /> {workerLocation(worker)}</p><div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4"><span className={`text-xs font-semibold ${worker.available ? 'text-emerald-700' : 'text-black/45'}`}>{worker.available ? 'Available' : 'Not taking bookings'}</span><Link href={`/workers/${worker.id}`} className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">View profile <ArrowRight size={15} /></Link></div></article>;
}

function WorkersSearch() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [categoryId, setCategoryId] = useState('');
  const [district, setDistrict] = useState('');
  const [minRating, setMinRating] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState('recommended');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // Categories for the filter. The homepage links here with ?category=<name>; match it to an id.
  useEffect(() => {
    categoriesApi.list().then((list) => {
      setCategories(list);
      const wanted = searchParams.get('category')?.toLowerCase();
      const match = wanted && list.find((category) => category.name.toLowerCase() === wanted);
      if (match) setCategoryId(String(match.id));
    }).catch(() => setCategories([]));
  }, [searchParams]);

  // Category, district, rating and availability are filtered by the backend.
  // Only approved (verified) workers are listed publicly.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    workersApi.search({ verified: true, categoryId, district, minRating, available: availableOnly || undefined })
      .then((list) => { if (!cancelled) setWorkers(list); })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err, 'Could not load professionals.')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [categoryId, district, minRating, availableOnly, reloadKey]);

  // The free-text box and sorting run in the browser - the backend has no text search yet.
  const visibleWorkers = useMemo(() => {
    const text = query.trim().toLowerCase();
    const list = workers.filter((worker) => !text || `${worker.fullName} ${workerTrade(worker)} ${worker.categoryName || ''} ${workerLocation(worker)}`.toLowerCase().includes(text));
    if (sort === 'rating') return [...list].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    if (sort === 'experience') return [...list].sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));
    return list;
  }, [workers, query, sort]);

  function resetFilters() {
    setQuery('');
    setCategoryId('');
    setDistrict('');
    setMinRating('');
    setAvailableOnly(false);
  }

  const selectClass = 'mt-2 block w-full rounded-xl border border-black/10 bg-white px-3 py-3 font-normal text-ink outline-none focus:border-brand-500 md:w-56';

  return <main className="min-h-screen bg-canvas"><Header /><section className="border-b border-black/5 bg-white"><div className="container-shell py-12 md:py-16"><Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-black/50 hover:text-brand-600"><ArrowLeft size={16} /> Back to home</Link><p className="eyebrow">Find your professional</p><h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.05em] text-ink md:text-6xl">The right person for the job.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-black/55 md:text-lg">Compare verified local professionals by trade, location, and the experience of clients who booked them.</p><div className="mt-8 flex max-w-3xl flex-col gap-3 rounded-2xl border border-black/10 bg-white p-2 shadow-soft sm:flex-row"><label className="flex flex-1 items-center gap-3 rounded-xl bg-canvas px-4 py-3"><Search size={19} className="text-black/40" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/40" placeholder="Search by name, trade, or location" aria-label="Search workers" /></label><button type="button" onClick={() => setFiltersOpen((open) => !open)} className="flex items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-black/65 hover:border-brand-300 hover:text-brand-600 sm:w-32"><SlidersHorizontal size={17} /> Filters</button></div></div></section><section className="container-shell py-10"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><p className="text-sm text-black/50">{loading ? 'Loading professionals...' : <>Showing <span className="font-semibold text-ink">{visibleWorkers.length}</span> of {workers.length} professionals</>}</p></div><div className="flex items-center gap-2 text-sm text-black/45"><Filter size={15} /> Sort by <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-lg border border-black/10 bg-white px-3 py-2 font-semibold text-ink outline-none focus:border-brand-500"><option value="recommended">Recommended</option><option value="rating">Highest rated</option><option value="experience">Most experienced</option></select></div></div><div className={`mt-6 flex flex-wrap items-end gap-3 overflow-hidden transition-all ${filtersOpen ? 'max-h-[40rem] opacity-100' : 'max-h-0 opacity-0 md:max-h-40 md:opacity-100'}`}><label className="w-full text-sm font-semibold text-black/65 md:w-auto">Service category<select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className={selectClass}><option value="">All services</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="w-full text-sm font-semibold text-black/65 md:w-auto">District<select value={district} onChange={(event) => setDistrict(event.target.value)} className={selectClass}><option value="">All districts</option>{DISTRICTS.map((item) => <option key={item}>{item}</option>)}</select></label><label className="w-full text-sm font-semibold text-black/65 md:w-auto">Minimum rating<select value={minRating} onChange={(event) => setMinRating(event.target.value)} className={selectClass}><option value="">Any rating</option><option value="4">4.0 and above</option><option value="4.5">4.5 and above</option><option value="5">5.0 only</option></select></label><label className="flex items-center gap-2 pb-3 text-sm font-semibold text-black/65"><input type="checkbox" checked={availableOnly} onChange={(event) => setAvailableOnly(event.target.checked)} className="h-4 w-4 accent-orange-500" /> Available now</label></div>{error && <div className="mt-8"><ErrorNote onRetry={() => setReloadKey((key) => key + 1)}>{error}</ErrorNote></div>}{loading ? <div className="mt-10 flex justify-center"><Spinner label="Loading professionals..." /></div> : <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{visibleWorkers.map((worker, index) => <WorkerCard key={worker.id} worker={worker} index={index} />)}</div>}{!loading && !error && visibleWorkers.length === 0 && <div className="mt-8 rounded-2xl border border-dashed border-brand-200 bg-brand-50 px-6 py-16 text-center"><h2 className="text-xl font-semibold">No professionals found</h2><p className="mt-2 text-sm text-black/55">{workers.length ? 'Try a different search or reset one of your filters.' : 'No approved professionals are listed yet. Check back soon.'}</p><button type="button" onClick={resetFilters} className="mt-5 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">Reset filters</button></div>}</section></main>;
}

export default function WorkersPage() {
  return <Suspense fallback={null}><WorkersSearch /></Suspense>;
}

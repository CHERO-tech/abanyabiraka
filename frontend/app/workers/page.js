'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, Filter, MapPin, Search, SlidersHorizontal, Star } from 'lucide-react';
import { PROS } from '../../src/features/worker/components/marketplaceData';

const categories = ['All services', 'Housekeeping & laundry', 'Auto mechanic', 'Childcare', 'Gardening & landscaping'];
const locations = ['All districts', 'Kicukiro, Kigali', 'Gasabo, Kigali', 'Nyarugenge, Kigali', 'Musanze'];

const workers = PROS.map(([name, specialty, rating, jobs, location, availability], index) => ({
  id: index + 1,
  name,
  specialty,
  rating,
  jobs,
  location,
  availability,
  initials: name.split(' ').map((part) => part[0]).slice(0, 2).join(''),
  tone: ['bg-orange-100 text-orange-700', 'bg-slate-100 text-slate-700', 'bg-amber-100 text-amber-700', 'bg-stone-200 text-stone-700'][index],
}));

function Header() {
  return <header className="border-b border-black/5 bg-white"><div className="container-shell flex h-20 items-center gap-8"><Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-[-0.04em]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-lg text-white">A</span>abanyabiraka</Link><nav className="ml-auto hidden items-center gap-7 text-sm font-medium text-black/60 md:flex"><Link className="hover:text-brand-600" href="/">Home</Link><Link className="text-brand-600" href="/workers">Find a professional</Link><Link className="hover:text-brand-600" href="/for-workers">For workers</Link></nav><Link className="rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600" href="/register">Join Abanyabiraka</Link></div></header>;
}

function WorkerCard({ worker }) {
  return <article className="flex flex-col rounded-2xl border border-black/8 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-brand-200"><div className="flex items-start justify-between gap-4"><div className={`grid h-14 w-14 place-items-center rounded-full text-sm font-bold ${worker.tone}`}>{worker.initials}</div><span className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700"><BadgeCheck size={13} /> Verified</span></div><div className="mt-5"><h2 className="font-semibold text-ink">{worker.name}</h2><p className="mt-1 text-sm text-brand-600">{worker.specialty}</p></div><div className="mt-4 flex items-center gap-2 text-sm text-black/60"><span className="flex items-center gap-1 font-semibold text-ink"><Star size={15} fill="currentColor" className="text-brand-500" /> {worker.rating}</span><span className="text-black/25">|</span><span>{worker.jobs}</span></div><p className="mt-3 flex items-center gap-1.5 text-sm text-black/50"><MapPin size={15} /> {worker.location}</p><div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4"><span className={`text-xs font-semibold ${worker.availability.startsWith('Available') ? 'text-emerald-700' : 'text-black/45'}`}>{worker.availability}</span><Link href={`/workers/${worker.id}`} className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">View profile <ArrowRight size={15} /></Link></div></article>;
}

export default function WorkersPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All services');
  const [location, setLocation] = useState('All districts');
  const [rating, setRating] = useState('Any rating');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredWorkers = useMemo(() => workers.filter((worker) => {
    const matchesQuery = `${worker.name} ${worker.specialty} ${worker.location}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesCategory = category === 'All services' || worker.specialty === category;
    const matchesLocation = location === 'All districts' || worker.location === location;
    const matchesRating = rating === 'Any rating' || Number(worker.rating) >= Number(rating);
    return matchesQuery && matchesCategory && matchesLocation && matchesRating;
  }), [category, location, query, rating]);

  return <main className="min-h-screen bg-canvas"><Header /><section className="border-b border-black/5 bg-white"><div className="container-shell py-12 md:py-16"><Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-black/50 hover:text-brand-600"><ArrowLeft size={16} /> Back to home</Link><p className="eyebrow">Find your professional</p><h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.05em] text-ink md:text-6xl">The right person for the job.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-black/55 md:text-lg">Compare verified local professionals by trade, location, and the experience of clients who booked them.</p><div className="mt-8 flex max-w-3xl flex-col gap-3 rounded-2xl border border-black/10 bg-white p-2 shadow-soft sm:flex-row"><label className="flex flex-1 items-center gap-3 rounded-xl bg-canvas px-4 py-3"><Search size={19} className="text-black/40" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/40" placeholder="Search by name, trade, or location" aria-label="Search workers" /></label><button type="button" onClick={() => setFiltersOpen((open) => !open)} className="flex items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-black/65 hover:border-brand-300 hover:text-brand-600 sm:w-32"><SlidersHorizontal size={17} /> Filters</button></div></div></section><section className="container-shell py-10"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><p className="text-sm text-black/50">Showing <span className="font-semibold text-ink">{filteredWorkers.length}</span> of {workers.length} professionals</p></div><div className="flex items-center gap-2 text-sm text-black/45"><Filter size={15} /> Sort by <select className="rounded-lg border border-black/10 bg-white px-3 py-2 font-semibold text-ink outline-none focus:border-brand-500" defaultValue="recommended"><option value="recommended">Recommended</option><option value="rating">Highest rated</option><option value="jobs">Most experienced</option></select></div></div><div className={`mt-6 grid gap-3 overflow-hidden transition-all ${filtersOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 md:max-h-24 md:opacity-100'}`}><label className="text-sm font-semibold text-black/65">Service category<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 block w-full rounded-xl border border-black/10 bg-white px-3 py-3 font-normal text-ink outline-none focus:border-brand-500 md:w-64">{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-semibold text-black/65">Location<select value={location} onChange={(event) => setLocation(event.target.value)} className="mt-2 block w-full rounded-xl border border-black/10 bg-white px-3 py-3 font-normal text-ink outline-none focus:border-brand-500 md:w-64">{locations.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-semibold text-black/65">Minimum rating<select value={rating} onChange={(event) => setRating(event.target.value)} className="mt-2 block w-full rounded-xl border border-black/10 bg-white px-3 py-3 font-normal text-ink outline-none focus:border-brand-500 md:w-64"><option>Any rating</option><option value="4.5">4.5 and above</option><option value="4.8">4.8 and above</option><option value="5">5.0 only</option></select></label></div><div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredWorkers.map((worker) => <WorkerCard key={worker.id} worker={worker} />)}</div>{filteredWorkers.length === 0 && <div className="mt-8 rounded-2xl border border-dashed border-brand-200 bg-brand-50 px-6 py-16 text-center"><h2 className="text-xl font-semibold">No professionals found</h2><p className="mt-2 text-sm text-black/55">Try a different search or reset one of your filters.</p><button type="button" onClick={() => { setQuery(''); setCategory('All services'); setLocation('All districts'); setRating('Any rating'); }} className="mt-5 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">Reset filters</button></div>}</section></main>;
}
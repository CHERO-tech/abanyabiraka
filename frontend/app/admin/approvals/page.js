'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BadgeCheck, Check, CheckCircle2, ChevronRight, MapPin, Search, ShieldCheck, Users } from 'lucide-react';
import { workersApi } from '@/lib/api';
import { fileUrl, getErrorMessage } from '@/lib/api/client';
import { initials, workerLocation, workerTrade } from '@/lib/format';
import { ErrorNote, LogoutButton, PreviewBanner, Spinner } from '@/components/ui';

export default function WorkerApprovalsPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');
  const [approving, setApproving] = useState(false);
  const [notice, setNotice] = useState('');

  // The approval queue = every worker the admin hasn't verified yet.
  const load = useCallback(() => {
    setLoading(true);
    setError('');
    workersApi.search({ verified: false })
      .then((list) => { setWorkers(list); setSelectedId((current) => current ?? list[0]?.id ?? null); })
      .catch((err) => setError(getErrorMessage(err, 'Could not load the approval queue.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const selectedWorker = workers.find((worker) => worker.id === selectedId) || null;
  const filteredWorkers = useMemo(() => workers.filter((worker) => `${worker.fullName} ${workerTrade(worker)} ${workerLocation(worker)}`.toLowerCase().includes(query.toLowerCase())), [query, workers]);

  async function approve() {
    setApproving(true);
    setError('');
    try {
      await workersApi.verifyIdentity(selectedWorker.id);
      const remaining = workers.filter((worker) => worker.id !== selectedWorker.id);
      setWorkers(remaining);
      setSelectedId(remaining[0]?.id ?? null);
      setNotice(`${selectedWorker.fullName} was approved and is now visible in search.`);
      window.setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not approve this worker.'));
    } finally {
      setApproving(false);
    }
  }

  return <main className="min-h-screen bg-canvas"><header className="border-b border-black/5 bg-white"><div className="container-shell flex h-20 items-center justify-between gap-5"><Link href="/admin" className="flex items-center gap-2 text-lg font-bold tracking-[-0.04em]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-lg text-white">A</span>abanyabiraka <span className="hidden text-sm font-normal text-black/35 sm:inline">/ Admin</span></Link><div className="flex items-center gap-3"><Link href="/admin" className="flex items-center gap-2 text-sm font-semibold text-black/55 hover:text-brand-600"><ArrowLeft size={16} /> Dashboard</Link><LogoutButton /></div></div></header><div className="container-shell py-8 md:py-10"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">Admin review queue</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-ink md:text-5xl">Worker approvals</h1><p className="mt-4 max-w-xl leading-7 text-black/55">Approve a professional to make them visible to clients with a verified badge.</p></div><div className="flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700"><BadgeCheck size={18} /> {workers.length} pending review</div></div>{notice && <div role="status" className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><CheckCircle2 size={17} /> {notice}</div>}{error && <div className="mt-6"><ErrorNote onRetry={load}>{error}</ErrorNote></div>}<div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]"><section className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-soft"><div className="border-b border-black/5 p-4"><label className="flex items-center gap-3 rounded-xl bg-canvas px-3 py-2.5"><Search size={17} className="text-black/40" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search applications" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/40" aria-label="Search applications" /></label><p className="mt-3 text-right text-xs text-black/45">{filteredWorkers.length} results</p></div>{loading ? <div className="flex justify-center p-8"><Spinner /></div> : <div className="divide-y divide-black/5">{filteredWorkers.length ? filteredWorkers.map((worker) => <button type="button" key={worker.id} onClick={() => setSelectedId(worker.id)} className={`flex w-full items-center gap-3 p-4 text-left transition ${selectedWorker?.id === worker.id ? 'border-l-4 border-brand-500 bg-brand-50' : 'border-l-4 border-transparent hover:bg-canvas'}`}><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">{initials(worker.fullName)}</div><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{worker.fullName}</strong><span className="mt-1 block truncate text-xs text-black/50">{workerTrade(worker)} · {workerLocation(worker)}</span></span><ChevronRight size={16} className="shrink-0 text-black/25" /></button>) : <p className="p-8 text-center text-sm text-black/50">No applications waiting.</p>}</div>}</section>{selectedWorker ? <section className="rounded-2xl border border-black/8 bg-white p-6 shadow-soft md:p-8"><div className="flex flex-col justify-between gap-5 border-b border-black/5 pb-6 sm:flex-row sm:items-start"><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-100 text-lg font-bold text-brand-700">{initials(selectedWorker.fullName)}</div><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-semibold tracking-[-0.04em]">{selectedWorker.fullName}</h2><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Pending</span></div><p className="mt-1 text-brand-600">{workerTrade(selectedWorker)}</p><p className="mt-2 flex items-center gap-1.5 text-sm text-black/50"><MapPin size={15} /> {workerLocation(selectedWorker)}</p></div></div><Link href={`/workers/${selectedWorker.id}`} className="text-sm font-semibold text-brand-600">Open profile</Link></div><div className="grid gap-6 py-7 md:grid-cols-2"><div><p className="eyebrow">Application summary</p><p className="mt-3 whitespace-pre-line leading-7 text-black/60">{selectedWorker.bio || 'No introduction written yet.'}</p><div className="mt-5 space-y-2 text-sm text-black/55">{selectedWorker.yearsOfExperience != null && <p className="flex items-center gap-2"><Users size={17} className="text-brand-500" /> {selectedWorker.yearsOfExperience} years of experience</p>}<p>Contact: {[selectedWorker.phone, selectedWorker.email].filter(Boolean).join(' · ') || 'none'}</p></div></div><div><p className="eyebrow">Portfolio</p>{selectedWorker.portfolio?.length ? <div className="mt-3 grid grid-cols-3 gap-2">{selectedWorker.portfolio.map((item) => <img key={item.id} src={fileUrl(item.fileUrl)} alt={item.caption || item.fileName} className="aspect-square w-full rounded-lg object-cover" />)}</div> : <p className="mt-3 text-sm text-black/45">No portfolio photos.</p>}<div className="mt-5"><PreviewBanner>Uploaded ID and certificate files can&apos;t be listed here yet. The backend has no endpoint that returns a worker&apos;s documents.</PreviewBanner></div></div></div><div className="flex items-start gap-3 rounded-xl bg-brand-50 p-4 text-sm leading-6 text-brand-700"><ShieldCheck className="mt-0.5 shrink-0" size={19} /><span>Approving this application makes the worker discoverable and displays a verified badge on their profile.</span></div><div className="mt-7 flex justify-end border-t border-black/5 pt-6"><button type="button" disabled={approving} onClick={approve} className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"><Check size={17} /> {approving ? 'Approving...' : 'Approve worker'}</button></div></section> : <section className="grid min-h-96 place-items-center rounded-2xl border border-dashed border-brand-200 bg-brand-50 p-8 text-center"><div><CheckCircle2 className="mx-auto text-brand-600" size={34} /><h2 className="mt-4 text-xl font-semibold">Queue is clear</h2><p className="mt-2 text-sm text-black/55">There are no pending applications.</p></div></section>}</div></div></main>;
}

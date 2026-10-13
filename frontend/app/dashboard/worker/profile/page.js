'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, Check, CheckCircle2, FileText, ImagePlus, MapPin, Plus, ShieldCheck, Upload, X } from 'lucide-react';
import { categoriesApi, workersApi } from '@/lib/api';
import { fileUrl, getErrorMessage } from '@/lib/api/client';
import { profileChecklist } from '@/lib/format';
import { DISTRICTS } from '@/lib/rwanda';
import { useAuth } from '@/components/AuthProvider';
import { ErrorNote, LoadingScreen } from '@/components/ui';

const DOCUMENT_TYPES = ['National ID', 'Professional certificate', 'Training certificate', 'Business registration', 'Other'];
const inputClass = 'mt-2 block w-full rounded-xl border border-black/10 bg-white px-4 py-3 font-normal outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50';

export default function WorkerProfileEditorPage() {
  const { profile, refreshProfile } = useAuth();
  const workerId = profile?.workerId;
  const [worker, setWorker] = useState(null);
  const [categories, setCategories] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [form, setForm] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  // Load the worker + categories, then turn the response (which has names) into form values (which need ids).
  useEffect(() => {
    if (!workerId) return;
    Promise.all([workersApi.get(workerId), categoriesApi.list()])
      .then(([workerData, categoryList]) => {
        setWorker(workerData);
        setCategories(categoryList);
        const category = categoryList.find((item) => item.name === workerData.categoryName);
        setForm({
          fullName: workerData.fullName || '',
          bio: workerData.bio || '',
          categoryId: category ? String(category.id) : '',
          professionNames: workerData.professions || [],
          district: workerData.district || '',
          sector: workerData.sector || '',
          yearsOfExperience: workerData.yearsOfExperience ?? '',
          available: workerData.available,
        });
      })
      .catch((err) => setLoadError(getErrorMessage(err, 'Could not load your profile.')));
  }, [workerId]);

  // Professions belong to a category; reload the list when the category changes.
  useEffect(() => {
    if (!form?.categoryId) {
      setProfessions([]);
      return;
    }
    categoriesApi.professions(form.categoryId).then(setProfessions).catch(() => setProfessions([]));
  }, [form?.categoryId]);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

  function toggleProfession(name) {
    setForm((current) => ({ ...current, professionNames: current.professionNames.includes(name) ? current.professionNames.filter((item) => item !== name) : [...current.professionNames, name] }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const updated = await workersApi.update(workerId, {
        fullName: form.fullName.trim(),
        bio: form.bio.trim(),
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        // Only send professions that belong to the selected category.
        professionIds: professions.filter((item) => form.professionNames.includes(item.name)).map((item) => item.id),
        district: form.district || undefined,
        sector: form.sector.trim() || undefined,
        yearsOfExperience: form.yearsOfExperience === '' ? undefined : Number(form.yearsOfExperience),
        available: form.available,
      });
      setWorker(updated);
      refreshProfile();
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Could not save your profile.'));
    } finally {
      setSaving(false);
    }
  }

  if (loadError) return <main className="container-shell py-16"><ErrorNote>{loadError}</ErrorNote></main>;
  if (!form) return <LoadingScreen label="Loading your profile..." />;

  const checklist = profileChecklist(worker);
  const completion = Math.round((checklist.filter(([, done]) => done).length / checklist.length) * 100);

  return <main className="min-h-screen bg-canvas"><header className="border-b border-black/5 bg-white"><div className="container-shell flex h-20 items-center justify-between gap-5"><Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-[-0.04em]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-lg text-white">A</span>abanyabiraka</Link><div className="flex items-center gap-4"><Link href="/dashboard/worker" className="flex items-center gap-2 text-sm font-semibold text-black/55 hover:text-brand-600"><ArrowLeft size={16} /> Dashboard</Link><Link href={`/workers/${workerId}`} className="hidden text-sm font-semibold text-brand-600 sm:block">View public profile</Link></div></div></header><div className="container-shell py-8 md:py-10"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">Worker profile</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-ink md:text-5xl">Make your profile work harder.</h1><p className="mt-4 max-w-xl leading-7 text-black/55">Complete your details so clients can understand your services and book with confidence.</p></div>{worker.verified ? <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"><BadgeCheck size={18} /> Verified profile</div> : <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700"><ShieldCheck size={18} /> Awaiting admin approval</div>}</div>{saved && <div role="status" className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><CheckCircle2 size={17} /> Your profile changes were saved.</div>}{saveError && <div className="mt-6"><ErrorNote>{saveError}</ErrorNote></div>}<div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]"><div className="space-y-8"><form id="profile-form" onSubmit={saveProfile} className="space-y-8"><section className="rounded-2xl border border-black/8 bg-white p-6 shadow-soft md:p-8"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><FileText size={20} /></div><div><h2 className="text-xl font-semibold">Basic information</h2><p className="mt-1 text-sm text-black/45">This is what clients see first.</p></div></div><div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-black/70">Full name<input required value={form.fullName} onChange={update('fullName')} className={inputClass} /></label><label className="text-sm font-semibold text-black/70">Service category<select value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value, professionNames: [] }))} className={inputClass}><option value="">Choose a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="text-sm font-semibold text-black/70">Years of experience<input type="number" min={0} max={70} value={form.yearsOfExperience} onChange={update('yearsOfExperience')} className={inputClass} /></label><label className="text-sm font-semibold text-black/70 sm:col-span-2">Short introduction<textarea value={form.bio} onChange={update('bio')} rows={4} placeholder="What do you do, and what should clients know about working with you?" className={`${inputClass} resize-y leading-6`} /></label></div>{!categories.length && <p className="mt-4 text-sm text-black/45">No service categories exist yet. An admin needs to add them first.</p>}</section><section className="rounded-2xl border border-black/8 bg-white p-6 shadow-soft md:p-8"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><Plus size={20} /></div><div><h2 className="text-xl font-semibold">Professions</h2><p className="mt-1 text-sm text-black/45">Select everything you are confident offering.</p></div></div><div className="mt-6 flex flex-wrap gap-2">{professions.map((item) => { const selected = form.professionNames.includes(item.name); return <button type="button" key={item.id} onClick={() => toggleProfession(item.name)} className={`rounded-full border px-3 py-2 text-sm font-medium transition ${selected ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-black/10 text-black/55 hover:border-brand-200'}`}>{selected && <Check size={14} className="mr-1 inline" />}{item.name}</button>; })}{!professions.length && <p className="text-sm text-black/45">{form.categoryId ? 'This category has no professions yet.' : 'Choose a service category first.'}</p>}</div></section></form><PortfolioSection workerId={workerId} items={worker.portfolio || []} onAdded={(item) => setWorker((current) => ({ ...current, portfolio: [...(current.portfolio || []), item] }))} /><DocumentsSection workerId={workerId} /></div><aside className="space-y-6 lg:sticky lg:top-6 lg:h-fit"><section className="rounded-2xl border border-black/8 bg-white p-6 shadow-soft"><p className="eyebrow">Profile completion</p><div className="mt-3 flex items-end justify-between"><p className="text-3xl font-semibold">{completion}%</p><span className="text-sm font-semibold text-brand-600">{completion === 100 ? 'Complete' : 'Keep going'}</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-brand-100"><div className="h-full rounded-full bg-brand-500" style={{ width: `${completion}%` }} /></div><ul className="mt-5 space-y-3 text-sm text-black/60">{checklist.map(([label, done]) => <li key={label} className="flex items-center gap-2">{done ? <CheckCircle2 size={17} className="text-emerald-600" /> : <span className="h-[17px] w-[17px] rounded-full border border-brand-500" />} {label}</li>)}</ul><p className="mt-4 text-xs leading-5 text-black/40">Saved values count; unsaved changes don&apos;t yet.</p></section><section className="rounded-2xl border border-black/8 bg-white p-6 shadow-soft"><p className="eyebrow">Availability</p><h2 className="mt-2 text-xl font-semibold">When can clients book you?</h2><label className="mt-5 flex items-center gap-3 text-sm text-black/65"><input form="profile-form" type="checkbox" checked={form.available} onChange={update('available')} className="h-4 w-4 accent-orange-500" /> Accepting new bookings</label><label className="mt-4 block text-sm font-semibold text-black/65">District<select form="profile-form" value={form.district} onChange={update('district')} className={inputClass}><option value="">Choose your district</option>{DISTRICTS.map((district) => <option key={district}>{district}</option>)}</select></label><label className="mt-4 block text-sm font-semibold text-black/65">Sector<input form="profile-form" value={form.sector} onChange={update('sector')} placeholder="e.g. Kimironko" className={inputClass} /></label><div className="mt-4 flex items-start gap-2 text-xs leading-5 text-black/45"><MapPin size={15} className="mt-0.5 shrink-0 text-brand-500" /> Your district helps clients find nearby professionals.</div></section><button form="profile-form" type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 font-semibold text-white hover:bg-brand-600 disabled:opacity-60">{saving ? 'Saving...' : 'Save profile'} {!saving && <ArrowRight size={17} />}</button><Link href="/dashboard/worker" className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white py-3.5 text-sm font-semibold text-black/60 hover:border-brand-300 hover:text-brand-600"><X size={17} /> Cancel</Link></aside></div></div></main>;
}

// Portfolio photos upload immediately (POST /api/workers/{id}/portfolio), separate from "Save profile".
function PortfolioSection({ workerId, items, onAdded }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function upload(event) {
    event.preventDefault();
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      onAdded(await workersApi.addPortfolioItem(workerId, file, caption.trim()));
      setFile(null);
      setCaption('');
      event.target.reset();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not upload this photo.'));
    } finally {
      setUploading(false);
    }
  }

  return <section className="rounded-2xl border border-black/8 bg-white p-6 shadow-soft md:p-8"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><ImagePlus size={20} /></div><div><h2 className="text-xl font-semibold">Portfolio</h2><p className="mt-1 text-sm text-black/45">Photos of your work. They upload right away.</p></div></div>{items.length > 0 && <div className="mt-6 grid gap-3 sm:grid-cols-3">{items.map((item) => <figure key={item.id} className="overflow-hidden rounded-xl bg-canvas"><img src={fileUrl(item.fileUrl)} alt={item.caption || item.fileName} className="aspect-[1.15] w-full object-cover" />{item.caption && <figcaption className="p-2 text-xs font-semibold">{item.caption}</figcaption>}</figure>)}</div>}<form onSubmit={upload} className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><input required type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} className="min-w-0 rounded-xl border border-black/10 px-3 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-brand-700" /><input value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Caption (optional)" className="min-w-0 rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-brand-500" /><button type="submit" disabled={uploading || !file} className="flex items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold hover:border-brand-300 hover:text-brand-600 disabled:opacity-50"><Upload size={16} /> {uploading ? 'Uploading...' : 'Upload'}</button></form>{error && <div className="mt-3"><ErrorNote>{error}</ErrorNote></div>}</section>;
}

// Qualification documents for admin review (POST /api/workers/{id}/qualification-documents).
// The backend has no "list my documents" endpoint yet, so only this visit's uploads are shown.
function DocumentsSection({ workerId }) {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[0]);
  const [uploaded, setUploaded] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function upload(event) {
    event.preventDefault();
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const document = await workersApi.uploadDocument(workerId, file, documentType);
      setUploaded((current) => [...current, document]);
      setFile(null);
      event.target.reset();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not upload this document.'));
    } finally {
      setUploading(false);
    }
  }

  return <section className="rounded-2xl border border-black/8 bg-white p-6 shadow-soft md:p-8"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><ShieldCheck size={20} /></div><div><h2 className="text-xl font-semibold">Verification documents</h2><p className="mt-1 text-sm text-black/45">Your ID and certificates, reviewed by an admin before you appear in search.</p></div></div>{uploaded.length > 0 && <ul className="mt-5 space-y-2">{uploaded.map((document) => <li key={document.id} className="flex items-center gap-3 rounded-xl bg-canvas px-3 py-3 text-sm"><FileText size={17} className="text-brand-500" /><span className="flex-1 truncate">{document.documentType}: {document.fileName}</span><span className="text-xs font-semibold text-amber-700">{document.status}</span></li>)}</ul>}<form onSubmit={upload} className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><select value={documentType} onChange={(event) => setDocumentType(event.target.value)} className="rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:border-brand-500">{DOCUMENT_TYPES.map((type) => <option key={type}>{type}</option>)}</select><input required type="file" accept="image/*,application/pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} className="min-w-0 rounded-xl border border-black/10 px-3 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-brand-700" /><button type="submit" disabled={uploading || !file} className="flex items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold hover:border-brand-300 hover:text-brand-600 disabled:opacity-50"><Upload size={16} /> {uploading ? 'Uploading...' : 'Upload'}</button></form>{error && <div className="mt-3"><ErrorNote>{error}</ErrorNote></div>}</section>;
}

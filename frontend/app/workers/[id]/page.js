import Link from 'next/link';
import { ArrowLeft, ArrowRight, BadgeCheck, BriefcaseBusiness, CalendarDays, CheckCircle2, Clock3, MapPin, MessageCircle, ShieldCheck, Star } from 'lucide-react';
import { PROS } from '../../../src/features/worker/components/marketplaceData';

const workerDetails = {
  '1': {
    bio: 'Aline helps busy households keep their homes fresh and cared for. She brings careful attention to detail, dependable communication, and more than five years of experience in housekeeping and laundry services.',
    skills: ['Deep cleaning', 'Laundry & ironing', 'Move-out cleaning', 'Regular housekeeping'],
    portfolio: ['Move-out reset', 'Fresh laundry care', 'Weekly home care'],
    reviews: [['Diane K.', 'Aline was punctual, thorough, and very easy to communicate with. The house felt completely refreshed.', '2 weeks ago'], ['Patrick M.', 'I booked Aline for a move-out clean and the result was excellent. I would gladly book her again.', '1 month ago']],
  },
  '2': {
    bio: 'Eric is an experienced auto mechanic who works on everyday vehicles, diagnostics, servicing, and roadside repairs. He explains the work clearly before getting started.',
    skills: ['Engine diagnostics', 'Brake service', 'Oil changes', 'Roadside repairs'],
    portfolio: ['Engine diagnostics', 'Brake replacement', 'Routine servicing'],
    reviews: [['Derrick M.', 'Eric found the issue quickly and explained the repair in a way I could understand.', '3 weeks ago']],
  },
  '3': {
    bio: 'Claudine provides patient, attentive childcare for families in Kigali. Her profile includes checked references and a focus on safe, engaging care for children.',
    skills: ['Infant care', 'Homework support', 'Meal preparation', 'Day and evening care'],
    portfolio: ['After-school care', 'Weekend childcare', 'Family references'],
    reviews: [['Solange N.', 'Claudine was kind, attentive, and kept us updated throughout the evening.', '1 month ago']],
  },
  '4': {
    bio: 'Jean Bosco creates and maintains healthy gardens for homes and small businesses. He works carefully, from seasonal planting to regular lawn maintenance.',
    skills: ['Lawn care', 'Tree trimming', 'Planting', 'Garden maintenance'],
    portfolio: ['Garden maintenance', 'Seasonal planting', 'Lawn restoration'],
    reviews: [['Alex R.', 'Our garden has never looked better. Jean Bosco is reliable and knows his plants.', '2 months ago']],
  },
};

function getWorker(id) {
  const source = PROS[Number(id) - 1] || PROS[0];
  const [name, specialty, rating, jobs, location, availability] = source;
  return { name, specialty, rating, jobs, location, availability, initials: name.split(' ').map((part) => part[0]).slice(0, 2).join(''), ...workerDetails[id] || workerDetails['1'] };
}

export function generateStaticParams() {
  return PROS.map((_, index) => ({ id: String(index + 1) }));
}

export default async function WorkerProfilePage({ params }) {
  const { id } = await params;
  const worker = getWorker(id);

  return <main className="min-h-screen bg-canvas"><header className="border-b border-black/5 bg-white"><div className="container-shell flex h-20 items-center justify-between gap-6"><Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-[-0.04em]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-lg text-white">A</span>abanyabiraka</Link><Link href="/workers" className="flex items-center gap-2 text-sm font-semibold text-black/55 hover:text-brand-600"><ArrowLeft size={16} /> Back to professionals</Link></div></header><section className="border-b border-black/5 bg-white"><div className="container-shell py-12 md:py-16"><div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="grid h-28 w-28 shrink-0 place-items-center rounded-[2rem] bg-brand-100 text-3xl font-bold text-brand-700">{worker.initials}</div><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-4xl font-semibold tracking-[-0.05em] text-ink md:text-5xl">{worker.name}</h1><span className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700"><BadgeCheck size={14} /> Verified</span></div><p className="mt-2 text-lg text-brand-600">{worker.specialty}</p><p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-black/50"><span className="flex items-center gap-1.5"><MapPin size={16} /> {worker.location}</span><span className="flex items-center gap-1.5"><BriefcaseBusiness size={16} /> {worker.jobs}</span><span className="flex items-center gap-1.5"><Star size={16} fill="currentColor" className="text-brand-500" /> {worker.rating} rating</span></p></div></div><div className="flex flex-wrap gap-3"><Link href={`/booking?worker=${id}`} className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600">Book this professional <ArrowRight size={17} /></Link><Link href="/chat" className="flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-brand-300 hover:text-brand-600"><MessageCircle size={17} /> Message</Link></div></div></div></section><section className="container-shell grid gap-8 py-10 lg:grid-cols-[1fr_360px]"><div className="space-y-8"><section className="rounded-2xl border border-black/8 bg-white p-6 shadow-soft"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><ShieldCheck size={21} /></span><div><h2 className="font-semibold">About this professional</h2><p className="text-xs text-black/45">Identity and qualifications reviewed</p></div></div><p className="mt-5 max-w-3xl leading-7 text-black/60">{worker.bio}</p><div className="mt-6 flex flex-wrap gap-2">{worker.skills.map((skill) => <span key={skill} className="flex items-center gap-1.5 rounded-full bg-canvas px-3 py-2 text-sm text-black/65"><CheckCircle2 size={15} className="text-brand-500" /> {skill}</span>)}</div></section><section><div className="flex items-end justify-between"><div><p className="eyebrow">Selected work</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">A look at the work</h2></div><span className="text-sm text-black/45">Portfolio</span></div><div className="mt-5 grid gap-4 sm:grid-cols-3">{worker.portfolio.map((item, index) => <div key={item} className={`flex aspect-[1.15] flex-col justify-end rounded-2xl p-4 text-white ${['bg-gradient-to-br from-brand-600 to-brand-800', 'bg-gradient-to-br from-stone-600 to-stone-900', 'bg-gradient-to-br from-amber-500 to-orange-800'][index]}`}><span className="text-xs uppercase tracking-[0.14em] text-white/65">Project {index + 1}</span><span className="mt-1 font-semibold">{item}</span></div>)}</div></section><section><div className="flex items-end justify-between"><div><p className="eyebrow">Client feedback</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Reviews from completed jobs</h2></div><span className="flex items-center gap-1 text-sm font-semibold"><Star size={15} fill="currentColor" className="text-brand-500" /> {worker.rating}</span></div><div className="mt-5 space-y-3">{worker.reviews.map(([name, review, date]) => <blockquote key={name} className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft"><div className="flex items-center justify-between gap-4"><span className="font-semibold">{name}</span><span className="text-xs text-black/40">{date}</span></div><div className="mt-2 flex gap-0.5 text-brand-500">★★★★★</div><p className="mt-3 leading-6 text-black/60">{review}</p></blockquote>)}</div></section></div><aside className="h-fit rounded-2xl border border-black/8 bg-white p-6 shadow-soft lg:sticky lg:top-6"><p className="eyebrow">Ready to get started?</p><h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Book {worker.name.split(' ')[0]} for your next job.</h2><div className="mt-6 space-y-4 border-y border-black/5 py-5"><div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-black/55"><CalendarDays size={17} /> Availability</span><span className="font-semibold text-emerald-700">{worker.availability}</span></div><div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-black/55"><Clock3 size={17} /> Response time</span><span className="font-semibold">Usually within 1 hour</span></div></div><Link href={`/booking?worker=${id}`} className="mt-6 flex items-center justify-center rounded-xl bg-brand-500 py-3 font-semibold text-white transition hover:bg-brand-600">Request a booking</Link><p className="mt-3 text-center text-xs leading-5 text-black/40">You can agree on scope and price in chat before work begins.</p></aside></section></main>;
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, BadgeCheck, Search } from 'lucide-react';

// Scroll-driven video hero: the section is several screens tall, its inner panel sticks to the top,
// and scrolling cross-fades between the clips below. Put the files in frontend/public/videos/.
// A missing or unplayable file shows a striped placeholder instead of breaking the page.
const SCENES = [
  { label: 'Laundry', src: '/videos/laundry.mp4', title: 'Laundry done by hand, done properly.', sub: 'Washing, ironing and folding by workers your neighbours already booked and rated.' },
  { label: 'Mechanic', src: '/videos/mechanic.mp4', title: 'Your car, back on the road today.', sub: 'Certified mechanics for diagnostics, servicing and roadside repairs in your district.' },
  { label: 'Babysitter', src: '/videos/babysitter.mp4', title: 'Care you can leave the house for.', sub: 'Childcare with checked references, verified identity and reviews from other parents.' },
  { label: 'Gardener', src: '/videos/gardener.mp4', title: 'A garden that looks looked-after.', sub: 'Lawn care, trimming and planting, booked by the visit or by the season.' },
  { label: 'Cleaner', src: '/videos/cleaner.mp4', title: 'A home that resets itself.', sub: 'Deep cleans and regular housekeeping, arranged in a few taps and tracked to completion.' },
];

const SUGGESTIONS = ['Babysitter', 'Mechanic', 'Gardener', 'Cleaner', 'Laundry', 'Electrician'];
const LAST = SCENES.length - 1;

export default function VideoHero() {
  const stageRef = useRef(null);
  const videoRefs = useRef([]);
  const [flow, setFlow] = useState(0); // 0..LAST: how far through the scenes the user has scrolled
  const [failed, setFailed] = useState({}); // scene index -> true when its video couldn't load
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    const onChange = (event) => setReducedMotion(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const stage = stageRef.current;
      if (!stage) return;
      const total = stage.offsetHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -stage.getBoundingClientRect().top / (total || 1)));
      setFlow(Math.round(progress * LAST * 1000) / 1000);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Only the clips that are (partly) visible play; the rest are paused to save CPU and data.
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      const visible = Math.abs(flow - i) < 1 && !reducedMotion;
      if (visible && video.paused) video.play().catch(() => {});
      if (!visible && !video.paused) video.pause();
    });
  }, [flow, reducedMotion]);

  const jumpToScene = useCallback((i) => {
    const stage = stageRef.current;
    if (!stage) return;
    const total = stage.offsetHeight - window.innerHeight;
    const top = stage.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (i / LAST) * total, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [reducedMotion]);

  const sceneIdx = Math.min(LAST, Math.max(0, Math.round(flow)));
  const scene = SCENES[sceneIdx];
  const textOpacity = Math.max(0, Math.min(1, 1 - Math.abs(flow - sceneIdx) * 2.4));

  return <section ref={stageRef} className="relative" style={{ height: `${SCENES.length * 100 + 60}vh` }} aria-label="Featured services">
    <div className="sticky top-0 flex h-screen items-center overflow-hidden bg-[#15100C]">
      {SCENES.map((s, i) => {
        const near = Math.max(0, 1 - Math.abs(flow - i));
        const scale = reducedMotion ? 1 : 1.1 - 0.07 * near;
        return <div key={s.label} aria-hidden="true" className="absolute inset-0 will-change-[opacity,transform]" style={{ opacity: near, transform: `scale(${scale.toFixed(4)})` }}>
          {failed[i]
            ? <div className="flex h-full w-full items-end justify-end p-6 pb-10 bg-[repeating-linear-gradient(135deg,#2A2119_0_14px,#322618_14px_28px)]"><span className="font-mono text-xs uppercase tracking-[0.08em] text-[#A08E74]">video needed: {s.label.toLowerCase()} ({s.src})</span></div>
            : <video ref={(el) => { videoRefs.current[i] = el; }} src={s.src} muted loop playsInline preload={i === 0 ? 'auto' : 'metadata'} onError={() => setFailed((current) => ({ ...current, [i]: true }))} className="h-full w-full object-cover" />}
        </div>;
      })}

      <div className="absolute inset-0 z-[5] bg-[linear-gradient(105deg,rgba(14,10,7,.7)_0%,rgba(14,10,7,.5)_48%,rgba(14,10,7,.21)_100%),linear-gradient(to_top,rgba(14,10,7,.7)_0%,rgba(14,10,7,0)_42%)]" />

      <div className="container-shell relative z-10 py-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-md"><BadgeCheck size={16} className="text-brand-300" /> Every professional verified before they appear</div>

        <div className="mt-6 transition-[opacity,transform] duration-300" style={{ opacity: textOpacity, transform: `translateY(${((1 - textOpacity) * 14).toFixed(2)}px)` }} aria-live="polite">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">{scene.label}</span>
          <h1 className="max-w-[19ch] text-4xl font-semibold leading-[1.03] tracking-[-0.05em] text-white md:text-6xl">{scene.title}</h1>
          <p className="mt-4 max-w-[50ch] text-base leading-7 text-white/80 md:text-lg">{scene.sub}</p>
        </div>

        <form action="/workers" className="mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border border-white/25 bg-white/15 p-2 backdrop-blur-lg sm:flex-row">
          <label className="flex flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3"><Search className="text-black/40" size={20} /><input name="q" className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-black/40" placeholder="What service do you need?" aria-label="What service do you need?" /></label>
          <button type="submit" className="focus-ring flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600">Search <ArrowRight size={17} /></button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((name) => <a key={name} href={`/workers?q=${encodeURIComponent(name)}`} className="rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-sm text-white/90 transition hover:border-white hover:bg-white/20">{name}</a>)}
        </div>
      </div>

      <div className="absolute right-4 top-1/2 z-[12] hidden -translate-y-1/2 flex-col gap-1 md:flex lg:right-10">
        {SCENES.map((s, i) => {
          const fill = Math.max(0, Math.min(1, 1 - Math.abs(flow - i)));
          return <button key={s.label} type="button" onClick={() => jumpToScene(i)} className={`flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${sceneIdx === i ? 'text-brand-100' : 'text-white/50 hover:text-white/80'}`}>
            <span className="relative block h-0.5 w-8 shrink-0 overflow-hidden rounded bg-white/30"><span className="absolute inset-0 origin-left bg-brand-500" style={{ transform: `scaleX(${fill.toFixed(3)})` }} /></span>{s.label}
          </button>;
        })}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-[12] h-[3px] bg-white/15"><div className="h-full bg-brand-500" style={{ width: `${((flow / LAST) * 100).toFixed(2)}%` }} /></div>
      <div className="absolute bottom-6 left-1/2 z-[12] flex -translate-x-1/2 flex-col items-center gap-2 text-white/70 transition-opacity duration-500" style={{ opacity: flow < 0.25 ? 1 : 0 }} aria-hidden="true">
        <span className="text-[11px] uppercase tracking-[0.16em]">Scroll</span>
        <span className="h-6 w-px bg-gradient-to-b from-white/80 to-transparent" />
      </div>
    </div>
  </section>;
}

import { useEffect, useState } from 'react';
import { SCENES, SLIDES, SUGGESTIONS } from './marketplaceData';

export default function HeroScroll({ query, onQuery, onSearch, onSceneChange }) {
  const [flow, setFlow] = useState(0);
  useEffect(() => {
    const sync = () => {
      const stage = document.getElementById('stage');
      if (!stage) return;
      const total = stage.offsetHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -stage.getBoundingClientRect().top / (total || 1)));
      setFlow(progress * (SLIDES.length - 1));
    };
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
    return () => { window.removeEventListener('scroll', sync); window.removeEventListener('resize', sync); };
  }, []);
  const sceneIndex = Math.min(SLIDES.length - 1, Math.max(0, Math.round(flow)));
  const jumpToScene = (index) => {
    const stage = document.getElementById('stage');
    if (!stage) return;
    const total = stage.offsetHeight - window.innerHeight;
    window.scrollTo({ top: stage.getBoundingClientRect().top + window.scrollY + (index / (SLIDES.length - 1)) * total, behavior: 'smooth' });
    onSceneChange?.(index);
  };
  return (
    <section className="hero-stage" id="stage">
      <div className="hero-sticky">
        {SLIDES.map((slide, index) => (
          <div className="hero-layer" key={slide.label} style={{ opacity: Math.max(0, 1 - Math.abs(flow - index)), transform: `scale(${(1.1 - 0.07 * Math.max(0, 1 - Math.abs(flow - index))).toFixed(4)})` }}>
            {slide.src ? <video src={encodeURI(slide.src)} autoPlay muted loop playsInline /> : <span>{slide.note}</span>}
          </div>
        ))}
        <div className="hero-overlay" />
        <div className="hero-content page-width">
          <div className="verification-pill"><span />Every professional verified before they appear</div>
          <div className="hero-copy">
            <span className="eyebrow gold">{SCENES[sceneIndex][0]}</span>
            <h1>{SCENES[sceneIndex][1]}</h1>
            <p>{SCENES[sceneIndex][2]}</p>
          </div>
          <div className="hero-actions">
            <button className="button button-primary" onClick={onSearch}>Find a Service</button>
            <button className="button button-glass" onClick={() => jumpToScene(1)}>Become a Professional</button>
          </div>
          <form className="hero-search" onSubmit={(event) => { event.preventDefault(); onSearch(); }}>
            <input value={query} onChange={onQuery} placeholder="What service do you need?" aria-label="What service do you need?" />
            <button className="button button-gold" type="submit">Search services</button>
          </form>
          <div className="suggestions">
            {SUGGESTIONS.map((suggestion) => <button key={suggestion} onClick={() => { onQuery({ target: { value: suggestion } }); onSearch(); }}>{suggestion}</button>)}
          </div>
        </div>
        <div className="scene-rail" aria-label="Featured services">
          {SLIDES.map((slide, index) => <button className={sceneIndex === index ? 'active' : ''} key={slide.label} onClick={() => jumpToScene(index)}><span style={{ transform: `scaleX(${Math.max(0, 1 - Math.abs(flow - index))})` }} />{slide.label}</button>)}
        </div>
        <div className="scroll-cue">Scroll<span /></div>
      </div>
    </section>
  );
}
import { useEffect, useMemo, useState } from 'react';
import HeroScroll from '../components/HeroScroll';
import BookingDialog from '../components/BookingDialog';
import { Footer, HowSection, MarketplaceHeader, ProfessionalsSection, ServicesSection, TestimonialsSection, WhySection } from '../components/MarketplaceSections';
import { PROS, SERVICES } from '../components/marketplaceData';
import '../../../marketplace.css';

export default function WorkerSearchPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(null);
  const [favourites, setFavourites] = useState({});
  const [booking, setBooking] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingNote, setBookingNote] = useState('');
  const [bookingDone, setBookingDone] = useState(false);
  const visibleServices = useMemo(() => SERVICES.filter(([name, description]) => (!category || name === category) && (!query.trim() || `${name} ${description}`.toLowerCase().includes(query.trim().toLowerCase()))), [category, query]);
  const visiblePros = useMemo(() => { const matches = PROS.filter(([name, specialty, , , location]) => (!category || specialty.toLowerCase().includes(category.toLowerCase().replace(/r$/, '')) || specialty.toLowerCase().includes(category.toLowerCase())) && (!query.trim() || `${name} ${specialty} ${location}`.toLowerCase().includes(query.trim().toLowerCase()))); return matches.length ? matches : PROS; }, [category, query]);

  useEffect(() => { const reveal = () => document.querySelectorAll('.section').forEach((element) => { if (element.getBoundingClientRect().top < window.innerHeight * 0.94) element.classList.add('is-visible'); }); window.addEventListener('scroll', reveal, { passive: true }); reveal(); return () => window.removeEventListener('scroll', reveal); }, []);
  const search = () => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  const viewProfessionals = (name) => { setCategory(name); setQuery(''); document.getElementById('professionals')?.scrollIntoView({ behavior: 'smooth' }); };
  const closeBooking = () => { setBooking(null); setBookingDone(false); setBookingDate(''); setBookingNote(''); };

  return <><MarketplaceHeader favouriteCount={Object.values(favourites).filter(Boolean).length} /><HeroScroll query={query} onQuery={(event) => setQuery(event.target.value)} onSearch={search} onSceneChange={search} /><ServicesSection services={visibleServices} activeCategory={category} onCategory={(value) => { setCategory(value); setQuery(''); }} onView={viewProfessionals} /><HowSection /><WhySection /><ProfessionalsSection professionals={visiblePros} favourites={favourites} onFavourite={(name) => setFavourites((current) => ({ ...current, [name]: !current[name] }))} onBook={(index) => setBooking(index)} /><TestimonialsSection /><section className="cta-section"><h2>Need help? Find the right professional today.</h2><p>Search by trade and district, compare verified profiles, and book in a few minutes.</p><button className="button button-gold" onClick={search}>Get Started</button></section><Footer /><BookingDialog professional={booking === null ? null : PROS[booking]} date={bookingDate} note={bookingNote} done={bookingDone} onDate={(event) => setBookingDate(event.target.value)} onNote={(event) => setBookingNote(event.target.value)} onConfirm={() => bookingDate && setBookingDone(true)} onClose={closeBooking} /></>;
}

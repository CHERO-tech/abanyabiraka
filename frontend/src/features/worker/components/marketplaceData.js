const UPLOADS = '/uploads/';

export const SLIDES = [
  { label: 'Laundry', src: `${UPLOADS}A realistic, warm, cinematic video of a beautiful young African woman washing clothes by hand outdoors in a clean, modest African home setting. She is sitting beside a large basin filled with water and colorful clothes, g.mp4` },
  { label: 'Mechanic', src: `${UPLOADS}A realistic, cinematic video of a young African male mechanical technician working in a professional auto repair workshop. He is wearing clean mechanic work clothes and safety gloves, inspecting and repairing a car engine.mp4` },
  { label: 'Babysitter', src: `${UPLOADS}A realistic, cinematic video of a young African female babysitter caring for a happy 4-year-old African child in a bright, comfortable family home. The babysitter is sitting with the child, helping them play with colorful.mp4` },
  { label: 'Gardener', src: `${UPLOADS}A realistic, cinematic video of a young African male gardener maintaining a beautiful residential garden. He is carefully cutting and trimming the grass using a professional lawn mower while wearing appropriate work cloth.mp4` },
  { label: 'Cleaner', note: 'video needed - home cleaning scene' },
];

export const SCENES = [
  ['Laundry', 'Laundry done by hand, done properly.', 'Washing, ironing and folding by workers your neighbours already booked and rated.'],
  ['Mechanic', 'Your car, back on the road today.', 'Certified mechanics for diagnostics, servicing and roadside repairs in your district.'],
  ['Babysitter', 'Care you can leave the house for.', 'Childcare with checked references, verified identity and reviews from other parents.'],
  ['Gardener', 'A garden that looks looked-after.', 'Lawn care, trimming and planting, booked by the visit or by the season.'],
  ['Cleaner', 'A home that resets itself.', 'Deep cleans and regular housekeeping, arranged in a few taps and tracked to completion.'],
];

export const SERVICES = [
  ['Babysitter', 'Vetted childcare by the hour or the day, with references checked.', '4.9', '', 2],
  ['Mechanic', 'Engine diagnostics, servicing and roadside repairs near you.', '4.8', '', 1],
  ['Gardener', 'Lawn care, trimming, planting and seasonal garden upkeep.', '4.7', '', 3],
  ['Cleaner', 'Deep cleans and regular housekeeping for homes and offices.', '4.9', 'video needed - home cleaning', null],
  ['Laundry', 'Hand washing, machine washing, ironing and folding.', '4.8', '', 0],
  ['Electrician', 'Wiring, installations, fault finding and safety checks.', '4.9', 'video needed - electrician', null],
];

export const STEPS = [
  ['01', 'Search for a service', 'Filter by trade, district, rating and availability to see who is close by.'],
  ['02', 'Choose a trusted professional', 'Compare verified profiles, past work and client reviews before deciding.'],
  ['03', 'Book the service', 'Pick a date, describe the job, and send the request straight from the profile.'],
  ['04', 'Get the job done', 'Track the booking status, then rate the work once it is complete.'],
];

export const REASONS = [
  ['Verified professionals', 'Identity documents and qualifications are reviewed by an administrator before a profile goes live.'],
  ['Easy booking', 'Request a date and describe the job in one step. The professional accepts or declines, and you see the status.'],
  ['Transparent pricing', 'Rates and scope are agreed in chat before work starts, so there are no surprises afterwards.'],
  ['Customer reviews', 'Ratings come only from completed jobs, and the average updates automatically.'],
  ['Secure communication', 'Message, share photos and files inside the platform, with read receipts on both sides.'],
  ['Reliable local services', 'Search by district and sector so the person you hire is genuinely nearby.'],
];

export const PROS = [
  ['Aline Mukamana', 'Housekeeping & laundry', '4.9', '128 jobs', 'Kicukiro, Kigali', 'Available today'],
  ['Eric Nsengimana', 'Auto mechanic', '4.8', '96 jobs', 'Gasabo, Kigali', 'Available today'],
  ['Claudine Uwase', 'Childcare', '5.0', '74 jobs', 'Nyarugenge, Kigali', 'Booked until Fri'],
  ['Jean Bosco Habimana', 'Gardening & landscaping', '4.7', '142 jobs', 'Musanze', 'Available today'],
];

export const TESTIMONIALS = [
  ['My electrician arrived the same afternoon and showed me his verified certificate before starting. The wiring has been faultless since.', 'Diane K.', 'Kimironko - Electrical repair'],
  ['I booked a cleaner for a move-out and the whole thing was settled in chat. Clear price, clear time, no follow-up calls needed.', 'Patrick M.', 'Remera - Deep clean'],
  ['Finding someone I trusted with my daughter was the hard part. Reading real reviews from other parents made the choice easy.', 'Solange N.', 'Kicukiro - Childcare'],
];

export const FOOTER_COLS = [
  ['Platform', ['Find a service', 'Become a professional', 'How it works', 'Verification', 'Pricing']],
  ['Categories', ['Home Services', 'Automotive', 'Electronics & Tech', 'Beauty & Fashion', 'Health & Care', 'Agriculture']],
  ['Company', ['About us', 'Careers', 'Press', 'Help centre', 'Report a problem']],
];

export const SUGGESTIONS = ['Babysitter', 'Mechanic', 'Gardener', 'Cleaner', 'Laundry', 'Electrician'];

export function stars(rating) {
  const full = Math.round(Number.parseFloat(rating));
  return Array.from({ length: 5 }, (_, index) => (index < full ? '\u2605' : '\u2606')).join('');
}
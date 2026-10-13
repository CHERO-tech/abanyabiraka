// Display helpers shared by pages.

export function initials(name = '') {
  return name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || '?';
}

// Backend LocalDateTime comes as "2026-10-20T09:00:00" (no timezone) - treat it as local time.
export function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatRating(rating) {
  const value = Number(rating);
  return value > 0 ? value.toFixed(1) : 'New';
}

export function workerLocation(worker) {
  return [worker.sector, worker.district].filter(Boolean).join(', ') || 'Location not set';
}

export function workerTrade(worker) {
  return worker.professions?.length ? worker.professions.join(', ') : worker.categoryName || 'Profession not set';
}

// Booking status -> label + Tailwind classes.
export const BOOKING_STATUS = {
  PENDING: { label: 'Pending', className: 'bg-amber-50 text-amber-700' },
  ACCEPTED: { label: 'Accepted', className: 'bg-emerald-50 text-emerald-700' },
  REJECTED: { label: 'Declined', className: 'bg-red-50 text-red-600' },
  COMPLETED: { label: 'Completed', className: 'bg-slate-100 text-slate-600' },
};

export function StatusPill({ status }) {
  const style = BOOKING_STATUS[status] || { label: status, className: 'bg-slate-100 text-slate-600' };
  return <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${style.className}`}>{style.label}</span>;
}

// Which profile fields count towards "profile completion". Used by the worker dashboard and profile editor.
export function profileChecklist(worker) {
  return [
    ['Short introduction', Boolean(worker?.bio)],
    ['Service category', Boolean(worker?.categoryName)],
    ['Professions', Boolean(worker?.professions?.length)],
    ['District', Boolean(worker?.district)],
    ['Years of experience', worker?.yearsOfExperience != null],
    ['Portfolio photo', Boolean(worker?.portfolio?.length)],
    ['Identity verified by admin', Boolean(worker?.verified)],
  ];
}

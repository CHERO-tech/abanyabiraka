import InfoPage from '@/components/InfoPage';

export const metadata = { title: 'How it works | Abanyabiraka' };

export default function Page() {
  return <InfoPage
    eyebrow="How it works"
    title="From search to a finished job, in four steps."
    intro="Abanyabiraka connects clients with verified local professionals. Here is how a booking works."
    sections={[
      { title: 'Search', body: 'Browse verified professionals by service category, district and rating.' },
      { title: 'Request a booking', body: 'Pick a date and time slot and describe the job. The professional gets your request on their dashboard.' },
      { title: 'Get confirmed', body: 'The professional accepts or declines. Accepted bookings show on your dashboard with the scheduled time.' },
      { title: 'Review', body: 'When the job is marked complete, you can rate it from 1 to 5 stars. Reviews shape each professional\'s rating.' },
    ]}
    cta={{ href: '/workers', label: 'Find a professional' }}
  />;
}

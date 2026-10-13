import InfoPage from '@/components/InfoPage';

export const metadata = { title: 'About | Abanyabiraka' };

export default function Page() {
  return <InfoPage
    eyebrow="About us"
    title="Trusted work, closer to home."
    intro="Abanyabiraka is a web marketplace connecting Rwanda's skilled workers, technicians and artisans with the clients who need them."
    sections={[
      { title: 'Verified profiles', body: 'Workers prove their identity and qualifications before they are listed, so clients can book with confidence.' },
      { title: 'Built for Rwanda', body: 'Search by district across all 30 districts, from Kigali to Musanze and beyond.' },
    ]}
    cta={{ href: '/workers', label: 'Browse professionals' }}
  />;
}

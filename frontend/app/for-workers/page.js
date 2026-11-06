import InfoPage from '@/components/InfoPage';

export const metadata = { title: 'For workers | Abanyabiraka' };

export default function Page() {
  return <InfoPage
    eyebrow="For skilled workers"
    title="Make your work easier to find."
    intro="Create a free profile, get verified, and receive booking requests from clients near you."
    sections={[
      { title: 'Create your account', body: 'Register as a worker with your email or phone number and confirm it with a 6-digit code.' },
      { title: 'Complete your profile', body: 'Add your category, professions, district, experience, an introduction and photos of your work.' },
      { title: 'Get verified', body: 'Upload your ID and certificates. Once an admin approves your profile, you appear in search with a verified badge.' },
      { title: 'Manage bookings', body: 'Accept or decline requests, mark jobs complete, and build your rating from client reviews.' },
    ]}
    cta={{ href: '/register', label: 'Create your profile' }}
  />;
}

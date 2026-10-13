import InfoPage from '@/components/InfoPage';

export const metadata = { title: 'Help centre | Abanyabiraka' };

export default function Page() {
  return <InfoPage
    eyebrow="Help centre"
    title="How can we help?"
    intro="Answers to the most common questions."
    sections={[
      { title: 'I did not receive my verification code', body: 'Codes expire after 10 minutes. Resending a code is not available yet. Contact support and we will verify your account.' },
      { title: 'I forgot my password', body: 'Use "Forgot password?" on the sign-in page. We send a 6-digit reset code to your email or phone.' },
      { title: 'Why can\'t clients find my profile?', body: 'Workers appear in search only after an admin approves the profile. Complete your profile and upload your documents to speed this up.' },
      { title: 'How do I review a professional?', body: 'Open your client dashboard. Completed bookings have a Review button.' },
    ]}
    cta={{ href: '/login', label: 'Sign in' }}
  />;
}

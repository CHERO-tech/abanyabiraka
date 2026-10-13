import InfoPage from '@/components/InfoPage';

export const metadata = { title: 'Terms | Abanyabiraka' };

export default function Page() {
  return <InfoPage
    eyebrow="Terms and privacy"
    title="Terms of service and privacy policy"
    intro="Placeholder: the final terms and privacy policy are still being written by the Abanyabiraka team. This page exists so links work; it is not a legal document."
    sections={[
      { title: 'Terms of service', body: 'To be published.' },
      { title: 'Privacy policy', body: 'To be published.' },
    ]}
  />;
}

export default function MainLayout({ children }) {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {children}
    </main>
  );
}

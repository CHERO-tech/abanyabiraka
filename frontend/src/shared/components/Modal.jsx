export default function Modal({ title, children, isOpen = false }) {
  if (!isOpen) return null;

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', background: '#fff' }}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export default function Badge({ children, color = '#eee' }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.25rem 0.5rem',
        background: color,
        borderRadius: '999px',
      }}
    >
      {children}
    </span>
  );
}

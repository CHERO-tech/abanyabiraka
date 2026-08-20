export default function Input({ label, ...props }) {
  return (
    <label style={{ display: 'block', marginBottom: '1rem' }}>
      {label && <div style={{ marginBottom: '0.5rem' }}>{label}</div>}
      <input {...props} />
    </label>
  );
}

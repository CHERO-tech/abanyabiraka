export default function Modal({ title, children, isOpen = false, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <div className="modal-panel">
        <div className="modal-header"><h3>{title}</h3><button onClick={onClose} aria-label="Close dialog">×</button></div>
      {children}
      </div>
    </div>
  );
}

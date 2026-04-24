export function StatusMessage({ message, tone = 'info' }) {
  if (!message) {
    return null;
  }

  return (
    <p className={`status-message status-${tone}`} role="status" aria-live="polite">
      {message}
    </p>
  );
}

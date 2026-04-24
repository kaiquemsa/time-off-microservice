export function ToastRegion({ notifications }) {
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="false">
      {notifications.map((item) => (
        <div key={item.id} className={`toast toast-${item.type}`} role="status">
          {item.message}
        </div>
      ))}
    </div>
  );
}

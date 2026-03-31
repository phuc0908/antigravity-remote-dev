import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  title: string;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, title, onDismiss, duration = 5000 }: ToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDismiss, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(onDismiss, 300);
  };

  return (
    <div className={`toast${exiting ? ' fade-out' : ''}`} role="alert" aria-live="assertive">
      <div className="toast-header">{title}</div>
      <div className="toast-body">{message}</div>
      <div className="toast-progress" style={{ animationDuration: `${duration}ms` }} />
      <button
        type="button"
        className="toast-dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      />
    </div>
  );
}

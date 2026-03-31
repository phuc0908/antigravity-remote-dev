import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { Toast } from './Toast';

interface ToastItem {
  id: string;
  title: string;
  message: string;
}

const MAX_TOASTS = 3;

export default function ToastContainer() {
  const aiCompleteEvent = useAppStore((s) => s.aiCompleteEvent);
  const clearAiComplete = useAppStore((s) => s.clearAiComplete);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    if (!aiCompleteEvent) return;
    clearAiComplete();
    const newToast: ToastItem = {
      id: `${Date.now()}-${aiCompleteEvent.cascadeId}`,
      title: `⚡ ${aiCompleteEvent.title}`,
      message: '「Neural link complete」— AI transmission received',
    };
    setToasts((prev) => {
      const next = [newToast, ...prev];
      return next.slice(0, MAX_TOASTS);
    });
  }, [aiCompleteEvent, clearAiComplete]);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div id="toastContainer" className="toast-container">
      {toasts.map((t) => (
        <Toast key={t.id} title={t.title} message={t.message} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

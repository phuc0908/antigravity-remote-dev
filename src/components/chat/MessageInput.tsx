import { useRef, useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { sendMessage } from '../../services/api';

export default function MessageInput() {
  const currentCascadeId = useAppStore((s) => s.currentCascadeId);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Listen for IDE input sync events
  useEffect(() => {
    const handler = (e: Event) => {
      const { text: syncText } = (e as CustomEvent<{ text: string }>).detail;
      setText(syncText ?? '');
    };
    document.addEventListener('ide-input-sync', handler);
    return () => document.removeEventListener('ide-input-sync', handler);
  }, []);

  const handleSend = async () => {
    if (!currentCascadeId || !text.trim() || sending) return;
    const msg = text.trim();
    setText('');
    setSending(true);
    try {
      await sendMessage(currentCascadeId, msg);
    } catch (err) {
      console.error('Send failed:', err);
      setText(msg); // restore on failure
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const disabled = !currentCascadeId || sending;

  return (
    <div className="input-area">
      <textarea
        ref={textareaRef}
        className="message-input"
        placeholder={currentCascadeId ? 'Send a message...' : 'No IDE connected'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
      />
      <button
        type="button"
        className="send-btn"
        onClick={() => void handleSend()}
        disabled={disabled || !text.trim()}
        aria-label="Send message"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </button>
    </div>
  );
}

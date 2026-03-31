import { useRef, useEffect } from 'react';

interface PopupItem {
  title: string;
  description: string;
  badges: string[];
  selector: string;
  checked: boolean;
}

interface PopupBubbleProps {
  items: PopupItem[];
  anchorRect: DOMRect;
  onSelect: (item: PopupItem) => void;
  onDismiss: () => void;
}

export default function PopupBubble({ items, anchorRect, onSelect, onDismiss }: PopupBubbleProps) {
  const ref = useRef<HTMLDivElement>(null);

  const top = anchorRect.bottom + 8;
  const left = Math.max(8, anchorRect.left);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onDismiss();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onDismiss]);

  return (
    <div
      ref={ref}
      className="popup-bubble"
      style={{ position: 'fixed', top, left, zIndex: 9999 }}
    >
      {items.map((item) => (
        <div
          key={item.title}
          className={`popup-item${item.checked ? ' checked' : ''}`}
          onClick={() => onSelect(item)}
          role="menuitem"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(item); }}
        >
          <span className="popup-item-title">{item.title}</span>
          {item.description && <span className="popup-item-desc">{item.description}</span>}
          {item.badges.map((b) => (
            <span key={b} className="popup-badge">{b}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

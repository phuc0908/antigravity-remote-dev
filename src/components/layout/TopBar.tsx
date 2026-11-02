import { useAppStore } from '../../store';
import { closeCascade } from '../../services/api';

export default function TopBar() {
  const { cascades, currentCascadeId, setDrawerOpen, setCurrentCascadeId } = useAppStore();
  const currentCascade = cascades.find((c) => c.id === currentCascadeId);

  const handleCloseCascade = async () => {
    if (!currentCascadeId) return;
    const confirmClose = window.confirm('Close this IDE session window?');
    if (!confirmClose) return;
    try {
      await closeCascade(currentCascadeId);
      setCurrentCascadeId(null);
    } catch (err) {
      console.error('Close cascade failed:', err);
    }
  };

  return (
    <header className="topbar">
      <button
        type="button"
        className="topbar-btn topbar-menu"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open navigation menu"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className="topbar-title-wrap">
        <span className="topbar-title">
          {currentCascade ? currentCascade.title : 'Connecting...'}
        </span>
        <span className="topbar-status">
          <span className={`status-dot ${currentCascade ? 'online' : 'offline'}`} />
          {currentCascade ? 'Active' : 'Offline'}
        </span>
      </div>

      {currentCascade ? (
        <button
          type="button"
          className="topbar-btn topbar-close"
          onClick={() => void handleCloseCascade()}
          aria-label="Close cascade session"
          title="Close IDE window"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      ) : (
        <div className="topbar-btn-placeholder" />
      )}
    </header>
  );
}

import { useAppStore } from '../../store';
import { closeCascade } from '../../services/api';

export default function TopBar() {
  const { cascades, currentCascadeId, setDrawerOpen, setCurrentCascadeId } = useAppStore();
  const currentCascade = cascades.find((c) => c.id === currentCascadeId);

  const handleCloseCascade = async () => {
    if (!currentCascadeId) return;
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
        className="topbar-btn hamburger"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open menu"
      >
        <span /><span /><span />
      </button>
      <span className="topbar-title">
        {currentCascade ? currentCascade.title : 'Connecting...'}
      </span>
      {currentCascade && (
        <button
          type="button"
          className="topbar-btn"
          onClick={() => void handleCloseCascade()}
          aria-label="Close cascade"
          title="Close IDE window"
        >
          ✕
        </button>
      )}
    </header>
  );
}

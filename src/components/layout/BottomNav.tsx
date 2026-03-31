import { useAppStore } from '../../store';

export default function BottomNav() {
  const { activeView, setActiveView } = useAppStore();

  return (
    <nav className="bottomnav" aria-label="Main navigation">
      <button
        type="button"
        className={`bottomnav-tab${activeView === 'chat' ? ' active' : ''}`}
        onClick={() => setActiveView('chat')}
        aria-label="Chat view"
      >
        <span className="bottomnav-icon">💬</span>
        <span className="bottomnav-label">Chat</span>
      </button>
      <button
        type="button"
        className={`bottomnav-tab${activeView === 'terminal' ? ' active' : ''}`}
        onClick={() => setActiveView('terminal')}
        aria-label="Terminal"
      >
        <span className="bottomnav-icon">{'⬛'}</span>
        <span className="bottomnav-label">Terminal</span>
      </button>
      <button
        type="button"
        className={`bottomnav-tab${activeView === 'more' ? ' active' : ''}`}
        onClick={() => setActiveView('more')}
        aria-label="Settings"
      >
        <span className="bottomnav-icon">⚙️</span>
        <span className="bottomnav-label">More</span>
      </button>
    </nav>
  );
}

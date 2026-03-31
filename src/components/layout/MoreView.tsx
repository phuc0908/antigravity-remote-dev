import { useAppStore } from '../../store';

const THEME_LABELS: Record<string, string> = {
  follow: '🌓 Follow System',
  light: '☀️ Light Mode',
  dark: '🌙 Dark Mode',
};

export default function MoreView() {
  const { themeMode, setThemeMode, setActiveModal } = useAppStore();

  const cycleTheme = () => {
    const modes = ['follow', 'light', 'dark'] as const;
    const idx = modes.indexOf(themeMode);
    const next = modes[(idx + 1) % modes.length];
    setThemeMode(next);
    document.documentElement.dataset.theme = next === 'follow' ? '' : next;
  };

  return (
    <div id="viewMore" className="view-more">
      <ul className="settings-list">
        <li className="settings-row">
          <button type="button" className="settings-row-btn" onClick={cycleTheme}>
            <span className="settings-label">Theme</span>
            <span className="settings-value">{THEME_LABELS[themeMode]}</span>
          </button>
        </li>
        <li className="settings-row">
          <button type="button" className="settings-row-btn" onClick={() => setActiveModal('accounts')}>
            <span className="settings-label">Account</span>
            <span className="settings-value">Manage ›</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

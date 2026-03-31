import { useAppStore } from './store';
import LoginPage from './components/LoginPage';
import AppShell from './components/layout/AppShell';

export default function App() {
  const isAuthed = useAppStore((s) => s.isAuthed);

  const themeMode = useAppStore((s) => s.themeMode);
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = themeMode === 'follow' ? '' : themeMode;
  }

  return isAuthed ? <AppShell /> : <LoginPage />;
}

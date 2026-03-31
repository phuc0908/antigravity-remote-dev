import type { ReactNode } from 'react';
import { useAppStore } from '../../store';

interface DrawerProps {
  children: ReactNode;
}

export default function Drawer({ children }: DrawerProps) {
  const { drawerOpen, setDrawerOpen } = useAppStore();

  return (
    <>
      <div
        className={`drawer-overlay${drawerOpen ? ' open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <aside className={`drawer${drawerOpen ? ' open' : ''}`} aria-label="Navigation drawer">
        <div className="drawer-header">
          <span className="drawer-title">AG REMOTE</span>
          <button
            type="button"
            className="drawer-close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >✕</button>
        </div>
        {children}
      </aside>
    </>
  );
}

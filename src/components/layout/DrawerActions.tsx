import { useState } from 'react';
import { useAppStore } from '../../store';
import { launchIde, killAll, newConversation } from '../../services/api';

export default function DrawerActions() {
  const { currentCascadeId, setDrawerOpen, setActiveModal } = useAppStore();
  const [launching, setLaunching] = useState(false);
  const [killing, setKilling] = useState(false);

  const handleNewChat = async () => {
    if (!currentCascadeId) return;
    try {
      await newConversation(currentCascadeId);
      setDrawerOpen(false);
    } catch (err) {
      console.error('New conversation failed:', err);
    }
  };

  const handleLaunch = async () => {
    setLaunching(true);
    try {
      await launchIde();
    } catch (err) {
      console.error('Launch failed:', err);
    } finally {
      setLaunching(false);
    }
  };

  const handleKillAll = async () => {
    if (!confirm('Close all IDE windows?')) return;
    setKilling(true);
    try {
      await killAll();
    } catch (err) {
      console.error('Kill all failed:', err);
    } finally {
      setKilling(false);
    }
  };

  return (
    <div className="drawer-actions">
      {currentCascadeId && (
        <button type="button" className="drawer-action" onClick={() => void handleNewChat()}>
          ＋ New Chat
        </button>
      )}
      <button type="button" className="drawer-action" onClick={() => void handleLaunch()} disabled={launching}>
        {launching ? 'Launching...' : '🚀 Launch IDE'}
      </button>
      <button
        type="button"
        className="drawer-action"
        onClick={() => { setActiveModal('project'); setDrawerOpen(false); }}
      >
        📁 Open Project
      </button>
      <button type="button" className="drawer-action danger" onClick={() => void handleKillAll()} disabled={killing}>
        {killing ? 'Closing...' : '⚠ Kill All'}
      </button>
    </div>
  );
}

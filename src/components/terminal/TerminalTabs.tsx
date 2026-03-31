import { useAppStore } from '../../store';
import { createTerminal, closeTerminal } from '../../services/api';

export default function TerminalTabs() {
  const { terminalSessions, activeTerminalId, setActiveTerminalId, addTerminalSession, removeTerminalSession } = useAppStore();

  const handleCreate = async () => {
    try {
      const result = await createTerminal();
      if (result.id) {
        addTerminalSession({ id: result.id, shell: result.shell, cwd: result.cwd });
        setActiveTerminalId(result.id);
      }
    } catch (e) {
      console.error('Failed to create terminal:', e);
    }
  };

  const handleClose = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await closeTerminal(id);
    } catch { /* ignore */ }
    removeTerminalSession(id);
  };

  return (
    <div className="terminal-tabs">
      <div className="terminal-tabs-list">
        {terminalSessions.map((session, idx) => (
          <button
            key={session.id}
            type="button"
            className={`terminal-tab${session.id === activeTerminalId ? ' active' : ''}`}
            onClick={() => setActiveTerminalId(session.id)}
          >
            <span className="terminal-tab-icon">⬛</span>
            <span className="terminal-tab-label">Terminal {idx + 1}</span>
            <span
              className="terminal-tab-close"
              onClick={(e) => handleClose(session.id, e)}
              role="button"
              tabIndex={0}
            >✕</span>
          </button>
        ))}
      </div>
      <button type="button" className="terminal-tab-new" onClick={handleCreate} title="New terminal">
        ＋
      </button>
    </div>
  );
}

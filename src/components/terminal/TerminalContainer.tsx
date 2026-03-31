import { useEffect } from 'react';
import { useAppStore } from '../../store';
import { createTerminal } from '../../services/api';
import TerminalTabs from './TerminalTabs';
import TerminalView from './TerminalView';

export default function TerminalContainer() {
  const { terminalSessions, activeTerminalId, addTerminalSession, setActiveTerminalId } = useAppStore();

  // Auto-create first terminal if none exist when entering terminal view
  useEffect(() => {
    if (terminalSessions.length === 0) {
      createTerminal()
        .then((result) => {
          if (result.id) {
            addTerminalSession({ id: result.id, shell: result.shell, cwd: result.cwd });
            setActiveTerminalId(result.id);
          }
        })
        .catch((e) => console.error('Failed to auto-create terminal:', e));
    }
  }, []); // only on mount

  return (
    <div id="viewTerminal" className="view-terminal">
      <TerminalTabs />
      <div className="terminal-viewport">
        {activeTerminalId ? (
          <TerminalView key={activeTerminalId} sessionId={activeTerminalId} />
        ) : (
          <div className="terminal-empty">
            <div className="terminal-empty-icon">{'>_'}</div>
            <div className="terminal-empty-title">No Terminal</div>
            <div className="terminal-empty-hint">Click + to create a new terminal</div>
          </div>
        )}
      </div>
    </div>
  );
}

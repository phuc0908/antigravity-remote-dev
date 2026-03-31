import { useEffect, useState } from 'react';
import { useAppStore } from '../../store';
import { getManagerAccounts, getManagerCurrent, switchAccount } from '../../services/api';

interface Account {
  id: string;
  label: string;
  email?: string;
}

function normalizeAccounts(data: unknown): Account[] {
  if (!data || typeof data !== 'object') return [];
  const d = data as Record<string, unknown>;
  const arr = Array.isArray(d.accounts) ? d.accounts :
               Array.isArray(d.data) ? d.data :
               Array.isArray(data) ? data as unknown[] : [];
  return arr.map((a: unknown) => {
    const item = a as Record<string, unknown>;
    return {
      id: String(item.id ?? item.accountId ?? item.uid ?? ''),
      label: String(item.label ?? item.name ?? item.email ?? item.id ?? 'Unknown'),
      email: item.email ? String(item.email) : undefined,
    };
  }).filter((a) => a.id);
}

function normalizeCurrentId(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  const id = d.currentId ?? d.id ?? d.accountId ?? d.uid;
  return id ? String(id) : null;
}

export default function AccountModal() {
  const { activeModal, setActiveModal } = useAppStore();
  const isOpen = activeModal === 'accounts';

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError('');
    Promise.all([getManagerAccounts(), getManagerCurrent()])
      .then(([accts, current]) => {
        setAccounts(normalizeAccounts(accts));
        setCurrentId(normalizeCurrentId(current));
      })
      .catch((err: Error) => {
        const msg = err.message ?? 'Failed to load accounts';
        if (msg.includes('501') || msg.toLowerCase().includes('not configured')) {
          setError('Account manager not configured');
        } else {
          setError(msg);
        }
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleSwitch = async (id: string) => {
    if (id === currentId) return;
    setSwitchingId(id);
    try {
      await switchAccount(id);
      setCurrentId(id);
    } catch (err) {
      console.error('Switch failed:', err);
    } finally {
      setSwitchingId(null);
    }
  };

  const handleClose = () => setActiveModal(null);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={handleClose}
      onKeyDown={(e) => { if (e.key === 'Escape') handleClose(); }}
      role="presentation"
    >
      <div
        className="modal-card acct-modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Account Manager"
      >
        <div className="modal-header">
          <span>Account Manager</span>
          <button type="button" className="modal-close" onClick={handleClose}>✕</button>
        </div>
        <div className="modal-body">
          {loading && <div className="acct-loading">Loading accounts...</div>}
          {error && <div className="acct-error">{error}</div>}
          {!loading && !error && accounts.map((acct) => (
            <button
              key={acct.id}
              type="button"
              className={`acct-item${acct.id === currentId ? ' current' : ''}${switchingId === acct.id ? ' switching' : ''}`}
              onClick={() => void handleSwitch(acct.id)}
            >
              <span className="acct-label">{acct.label}</span>
              {acct.email && <span className="acct-email">{acct.email}</span>}
              {acct.id === currentId && <span className="acct-badge">ACTIVE</span>}
              {switchingId === acct.id && <span className="acct-badge">Switching...</span>}
            </button>
          ))}
          {!loading && !error && accounts.length === 0 && (
            <div className="acct-empty">No accounts found</div>
          )}
        </div>
      </div>
    </div>
  );
}

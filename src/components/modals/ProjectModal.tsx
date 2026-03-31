import { useCallback, useEffect, useState } from 'react';
import { useAppStore } from '../../store';
import { browse, getWorkspaceRoot, openProject } from '../../services/api';

interface DirItem {
  name: string;
  path: string;
}

export default function ProjectModal() {
  const { activeModal, setActiveModal } = useAppStore();
  const isOpen = activeModal === 'project';

  const [currentPath, setCurrentPath] = useState('');
  const [parentPath, setParentPath] = useState<string | null>(null);
  const [items, setItems] = useState<DirItem[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState('');

  const navigateTo = async (path?: string) => {
    setLoading(true);
    setError('');
    try {
      const result = await browse(path);
      setCurrentPath(result.currentPath);
      setParentPath(result.parentPath);
      setItems(result.items);
      setSelected(result.currentPath);
    } catch (err) {
      setError((err as Error).message || 'Browse failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setSelected('');
    getWorkspaceRoot()
      .then((r) => navigateTo(r.root))
      .catch(() => navigateTo(undefined));
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpen = async () => {
    if (!selected) return;
    setOpening(true);
    try {
      await openProject(selected);
      setActiveModal(null);
    } catch (err) {
      setError((err as Error).message || 'Open failed');
    } finally {
      setOpening(false);
    }
  };

  if (!isOpen) return null;

  const parts = currentPath.replace(/\\/g, '/').split('/').filter(Boolean);

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div
        className="modal-card project-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Open Project"
      >
        <div className="modal-header">
          <span>Open Project</span>
          <button type="button" className="modal-close" onClick={() => setActiveModal(null)}>✕</button>
        </div>
        <div className="modal-body">
          <div className="dir-breadcrumb">
            {parts.map((part, i) => (
              <span key={`${part}-${i}`}>
                <button
                  type="button"
                  className="dir-crumb"
                  onClick={() => void navigateTo('/' + parts.slice(0, i + 1).join('/'))}
                >
                  {part}
                </button>
                {i < parts.length - 1 && <span className="dir-sep">/</span>}
              </span>
            ))}
          </div>
          {parentPath && (
            <button
              type="button"
              className="dir-item"
              onClick={() => void navigateTo(parentPath)}
            >
              .. (parent)
            </button>
          )}
          {loading && <div className="dir-loading">Loading...</div>}
          {error && <div className="dir-error">{error}</div>}
          {!loading && items.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`dir-item${selected === item.path ? ' selected' : ''}`}
              onClick={() => { setSelected(item.path); void navigateTo(item.path); }}
            >
              📁 {item.name}
            </button>
          ))}
        </div>
        <div className="modal-footer">
          <div className="selected-path">{selected || 'No folder selected'}</div>
          <button
            type="button"
            className="modal-btn primary"
            onClick={() => void handleOpen()}
            disabled={!selected || opening}
          >
            {opening ? 'Opening...' : 'Open Project'}
          </button>
        </div>
      </div>
    </div>
  );
}

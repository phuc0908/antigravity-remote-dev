import { useAppStore } from '../../store';

export default function CascadeList() {
  const { cascades, currentCascadeId, setCurrentCascadeId, setDrawerOpen } = useAppStore();

  if (cascades.length === 0) {
    return (
      <div className="cascade-empty">
        <p>No IDE sessions connected</p>
        <p className="cascade-empty-hint">Launch Antigravity with CDP to connect</p>
      </div>
    );
  }

  return (
    <div id="cascadeList" className="cascade-list">
      {cascades.map((cascade) => (
        <button
          type="button"
          key={cascade.id}
          className={`cascade-item${cascade.id === currentCascadeId ? ' current' : ''}${cascade.active ? ' active' : ''}`}
          onClick={() => {
            setCurrentCascadeId(cascade.id);
            setDrawerOpen(false);
          }}
        >
          <span className="cascade-title">{cascade.title}</span>
          {cascade.active && <span className="cascade-badge">ACTIVE</span>}
        </button>
      ))}
    </div>
  );
}

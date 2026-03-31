import { useAppStore } from '../../store';

function getQuotaColor(pct: number | null): string {
  if (pct === null) return 'var(--text-muted, #666)';
  if (pct > 66) return 'var(--quota-green, #4caf50)';
  if (pct > 33) return 'var(--quota-yellow, #ff9800)';
  return 'var(--quota-red, #f44336)';
}

export default function QuotaOverview() {
  const { currentCascadeId, quotaCache } = useAppStore();
  const quota = currentCascadeId ? quotaCache[currentCascadeId] : null;

  if (!quota) return null;

  return (
    <div id="quotaOverview" className="quota-overview">
      {quota.planName && <div className="quota-plan">{quota.planName}</div>}
      {quota.models.map((model) => (
        <div key={model.label} className="quota-row">
          <span className="quota-label">{model.label}</span>
          <div className="quota-bar-wrap">
            <div
              className="quota-bar"
              style={{
                width: model.percentage != null ? `${model.percentage}%` : '0%',
                background: getQuotaColor(model.percentage),
              }}
            />
          </div>
          {model.resetTime && <span className="quota-reset">{model.resetTime}</span>}
        </div>
      ))}
    </div>
  );
}

// Shows a coloured badge relative to an age group target

export function scoreStatus(score, ageGroup) {
  if (!ageGroup || ageGroup.mode !== 'target' || ageGroup.target == null) return 'dev';
  if (score >= ageGroup.target) return 'met';
  if (score >= ageGroup.target - 1.0) return 'close';
  return 'below';
}

export function StatusBadge({ score, ageGroup, size = 'md' }) {
  const status = scoreStatus(score, ageGroup);
  const labels = { met: '✓ Target', close: '~ Close', below: '✗ Below', dev: 'Dev' };
  return (
    <span className={`badge badge-${status} badge-${size}`}>
      {labels[status]}
    </span>
  );
}

export function ScorePill({ score }) {
  return <span className="score-pill">{score != null ? score.toFixed(1) : '—'}</span>;
}

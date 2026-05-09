// Lightweight SVG line chart — no external dependencies

const PAD = { top: 16, right: 16, bottom: 32, left: 36 };

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function ScoreChart({ scores, target, height = 180 }) {
  if (!scores || scores.length === 0) return null;

  const width = 320; // viewBox width — scales to container via CSS
  const plotW = width - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;

  const values = scores.map(s => s.score);
  const allValues = target != null ? [...values, target] : values;
  const minY = Math.max(0, Math.floor(Math.min(...allValues)) - 1);
  const maxY = Math.ceil(Math.max(...allValues)) + 1;

  const toX = i => PAD.left + (scores.length === 1 ? plotW / 2 : (i / (scores.length - 1)) * plotW);
  const toY = v => PAD.top + plotH - ((v - minY) / (maxY - minY)) * plotH;

  const linePath = scores.map((s, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(s.score).toFixed(1)}`).join(' ');

  // Y axis ticks
  const yTicks = [];
  for (let v = Math.ceil(minY); v <= Math.floor(maxY); v++) {
    yTicks.push(v);
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      aria-label="Score history chart"
    >
      {/* Grid lines */}
      {yTicks.map(v => (
        <line
          key={v}
          x1={PAD.left} y1={toY(v)}
          x2={width - PAD.right} y2={toY(v)}
          stroke="#e5e7eb" strokeWidth="1"
        />
      ))}

      {/* Y axis labels */}
      {yTicks.map(v => (
        <text key={v} x={PAD.left - 6} y={toY(v) + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
          {v}
        </text>
      ))}

      {/* Target line */}
      {target != null && (
        <>
          <line
            x1={PAD.left} y1={toY(target)}
            x2={width - PAD.right} y2={toY(target)}
            stroke="#f0b429" strokeWidth="1.5" strokeDasharray="4 3"
          />
          <text x={width - PAD.right + 2} y={toY(target) + 4} fontSize="9" fill="#f0b429">
            {target}
          </text>
        </>
      )}

      {/* Score line */}
      {scores.length > 1 && (
        <path d={linePath} fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinejoin="round" />
      )}

      {/* Data points */}
      {scores.map((s, i) => (
        <circle key={s.id} cx={toX(i)} cy={toY(s.score)} r="4"
          fill="var(--color-primary)" stroke="#fff" strokeWidth="2" />
      ))}

      {/* X axis labels — show first, last, and up to 3 middle dates */}
      {scores
        .filter((_, i) => {
          if (scores.length <= 5) return true;
          return i === 0 || i === scores.length - 1 || i % Math.ceil((scores.length - 1) / 3) === 0;
        })
        .map((s, _, arr) => {
          const origIndex = scores.indexOf(s);
          return (
            <text key={s.id} x={toX(origIndex)} y={height - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">
              {formatDate(s.date)}
            </text>
          );
        })}
    </svg>
  );
}

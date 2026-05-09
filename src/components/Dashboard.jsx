import { useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { latestScore } from '../utils/storage.js';
import { scoreStatus } from './ScoreIndicator.jsx';
import { TrendingUpIcon } from './Icons.jsx';

export default function Dashboard({ onNavigate }) {
  const { branding, players, scores, ageGroups } = useApp();

  const groupMap = useMemo(
    () => Object.fromEntries(ageGroups.map(g => [g.id, g])),
    [ageGroups]
  );

  const targetGroups = ageGroups.filter(g => g.mode === 'target');

  const stats = useMemo(() => {
    return targetGroups.map(group => {
      const inGroup = players.filter(p => p.ageGroup === group.id);
      const met = inGroup.filter(p => {
        const ls = latestScore(scores, p.id);
        return ls && scoreStatus(ls.score, group) === 'met';
      });
      return { group, total: inGroup.length, met: met.length };
    });
  }, [players, scores, targetGroups]);

  const recentScores = useMemo(() => {
    return [...scores]
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
      .slice(0, 6);
  }, [scores]);

  return (
    <div className="screen">
      <header className="app-header">
        <div>
          <p className="header-sub">YoYoBoss</p>
          <h1 className="header-title">{branding.academyName}</h1>
        </div>
        <div className="cricket-ball">🏏</div>
      </header>

      <div className="content">
        {/* Summary cards */}
        <div className="stat-grid">
          <div className="stat-card stat-card-primary">
            <span className="stat-number">{players.length}</span>
            <span className="stat-label">Players</span>
          </div>
          {stats.map(({ group, total, met }) => (
            <div key={group.id} className="stat-card">
              <span className="stat-number">
                {total > 0 ? `${met}/${total}` : '—'}
              </span>
              <span className="stat-label">{group.label} target</span>
              {total > 0 && (
                <div className="stat-bar">
                  <div
                    className="stat-bar-fill"
                    style={{ width: `${total > 0 ? (met / total) * 100 : 0}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <section>
          <div className="section-header">
            <h2 className="section-title">Recent Scores</h2>
            <button className="link-btn" onClick={() => onNavigate('record')}>+ Record</button>
          </div>

          {recentScores.length === 0 ? (
            <div className="empty-state">
              <TrendingUpIcon size={40} />
              <p>No scores yet.<br />Record your first session.</p>
              <button className="btn btn-primary" onClick={() => onNavigate('record')}>
                Record Scores
              </button>
            </div>
          ) : (
            <div className="card-list">
              {recentScores.map(s => {
                const player = players.find(p => p.id === s.playerId);
                if (!player) return null;
                const group = groupMap[player.ageGroup];
                const status = scoreStatus(s.score, group);
                return (
                  <div
                    key={s.id}
                    className="list-row"
                    onClick={() => onNavigate('player', { playerId: player.id })}
                  >
                    <div className="list-row-main">
                      <span className="list-row-name">{player.name}</span>
                      <span className="list-row-sub">{player.ageGroup} · {s.date}</span>
                    </div>
                    <div className="list-row-aside">
                      <span className={`score-pill score-pill-${status}`}>{s.score.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { playerScores, deletePlayer, deleteScore } from '../utils/storage.js';
import { scoreStatus, StatusBadge } from './ScoreIndicator.jsx';
import ScoreChart from './ScoreChart.jsx';
import { ChevronLeftIcon, EditIcon, TrashIcon } from './Icons.jsx';

export default function PlayerDetail({ playerId, onBack, onNavigate }) {
  const { players, setPlayers, scores, setScores, ageGroups } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const player = players.find(p => p.id === playerId);
  if (!player) { onBack(); return null; }

  const group = ageGroups.find(g => g.id === player.ageGroup);
  const history = useMemo(() => playerScores(scores, playerId), [scores, playerId]);
  const latest = history[history.length - 1];

  function handleDeletePlayer() {
    setPlayers(deletePlayer(players, playerId));
    setScores(scores.filter(s => s.playerId !== playerId));
    onBack();
  }

  function handleDeleteScore(scoreId) {
    setScores(deleteScore(scores, scoreId));
  }

  const trend = history.length >= 2
    ? (history[history.length - 1].score - history[history.length - 2].score).toFixed(1)
    : null;

  return (
    <div className="screen">
      <header className="app-header">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <ChevronLeftIcon size={24} />
        </button>
        <h1 className="header-title" style={{ flex: 1, textAlign: 'center' }}>{player.name}</h1>
        <button className="icon-btn" onClick={() => onNavigate('edit-player', { playerId })} aria-label="Edit">
          <EditIcon size={22} />
        </button>
      </header>

      <div className="content">
        {/* Player summary card */}
        <div className="player-summary-card">
          <div className="player-avatar-lg">{player.name.charAt(0).toUpperCase()}</div>
          <div className="player-summary-info">
            <p className="player-summary-group">{group?.label ?? player.ageGroup}</p>
            {player.dob && <p className="text-muted text-sm">DOB: {player.dob}</p>}
          </div>
          {latest && (
            <div className="player-summary-score">
              <span className={`score-pill score-pill-lg score-pill-${scoreStatus(latest.score, group)}`}>
                {latest.score.toFixed(1)}
              </span>
              {group?.mode === 'target' && (
                <StatusBadge score={latest.score} ageGroup={group} />
              )}
              {trend !== null && (
                <span className={`trend ${parseFloat(trend) >= 0 ? 'trend-up' : 'trend-down'}`}>
                  {parseFloat(trend) >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(trend))}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Chart */}
        {history.length >= 2 && (
          <div className="chart-card">
            <h2 className="section-title">Progress</h2>
            <ScoreChart scores={history} target={group?.target ?? null} />
            {group?.mode === 'target' && (
              <p className="chart-legend">— target: {group.target}</p>
            )}
          </div>
        )}

        {/* Score history */}
        <section>
          <div className="section-header">
            <h2 className="section-title">Score History</h2>
            <button className="link-btn" onClick={() => onNavigate('record')}>+ Add</button>
          </div>

          {history.length === 0 ? (
            <div className="empty-state">
              <p>No scores recorded yet.</p>
              <button className="btn btn-primary" onClick={() => onNavigate('record')}>
                Record Score
              </button>
            </div>
          ) : (
            <div className="card-list">
              {[...history].reverse().map(s => {
                const status = scoreStatus(s.score, group);
                return (
                  <div key={s.id} className="list-row">
                    <div className="list-row-main">
                      <span className="list-row-name">{s.date}</span>
                      {s.notes && <span className="list-row-sub">{s.notes}</span>}
                    </div>
                    <div className="list-row-aside">
                      <span className={`score-pill score-pill-${status}`}>{s.score.toFixed(1)}</span>
                      <button
                        className="icon-btn icon-btn-sm text-danger"
                        onClick={() => handleDeleteScore(s.id)}
                        aria-label="Delete score"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Danger zone */}
        <div className="danger-zone">
          {confirmDelete ? (
            <div className="confirm-delete">
              <p>Delete <strong>{player.name}</strong> and all their scores?</p>
              <div className="confirm-actions">
                <button className="btn btn-danger" onClick={handleDeletePlayer}>Yes, Delete</button>
                <button className="btn btn-outline" onClick={() => setConfirmDelete(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-danger-outline" onClick={() => setConfirmDelete(true)}>
              <TrashIcon size={16} /> Delete Player
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

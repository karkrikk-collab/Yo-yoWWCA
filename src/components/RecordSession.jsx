import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { addScore } from '../utils/storage.js';
import { ChevronLeftIcon, CheckIcon } from './Icons.jsx';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function isValidScore(v) {
  if (!v) return false;
  const n = parseFloat(v);
  if (isNaN(n) || n < 5 || n > 23) return false;
  return true;
}

export default function RecordSession({ onBack, onNavigate }) {
  const { players, scores, setScores, ageGroups } = useApp();
  const [date, setDate] = useState(today);
  const [activeGroup, setActiveGroup] = useState(ageGroups[0]?.id ?? '');
  const [entries, setEntries] = useState({});   // { playerId: { score, notes } }
  const [saved, setSaved] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState({});

  const groupPlayers = useMemo(
    () => players.filter(p => p.ageGroup === activeGroup).sort((a, b) => a.name.localeCompare(b.name)),
    [players, activeGroup]
  );

  const group = ageGroups.find(g => g.id === activeGroup);

  function setEntry(playerId, field, value) {
    setEntries(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], [field]: value },
    }));
  }

  function toggleNotes(playerId) {
    setExpandedNotes(prev => ({ ...prev, [playerId]: !prev[playerId] }));
  }

  function handleSave() {
    let updated = scores;
    let count = 0;
    Object.entries(entries).forEach(([playerId, { score, notes }]) => {
      if (isValidScore(score)) {
        updated = addScore(updated, { playerId, date, score, notes: notes || '' });
        count++;
      }
    });
    if (count === 0) return;
    setScores(updated);
    setSaved(true);
    setTimeout(() => { setSaved(false); setEntries({}); }, 1800);
  }

  const entryCount = Object.values(entries).filter(e => isValidScore(e?.score)).length;

  return (
    <div className="screen">
      <header className="app-header">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <ChevronLeftIcon size={24} />
        </button>
        <h1 className="header-title">Record Session</h1>
        <div style={{ width: 40 }} />
      </header>

      <div className="content">
        {/* Date and group selectors */}
        <div className="session-meta">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Date</label>
            <input
              className="form-input"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Age Group</label>
            <select
              className="form-input"
              value={activeGroup}
              onChange={e => { setActiveGroup(e.target.value); setEntries({}); }}
            >
              {ageGroups.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
          </div>
        </div>

        {group?.mode === 'target' && (
          <div className="target-banner">
            Target: <strong>{group.target}</strong>
          </div>
        )}
        {group?.mode === 'developmental' && (
          <div className="dev-banner">Developmental — recording progress only</div>
        )}

        {groupPlayers.length === 0 ? (
          <div className="empty-state">
            <p>No players in {group?.label}.</p>
            <button className="btn btn-outline" onClick={() => onNavigate('add-player')}>
              Add Player
            </button>
          </div>
        ) : (
          <div className="score-entry-list">
            {groupPlayers.map(p => {
              const entry = entries[p.id] || {};
              const valid = isValidScore(entry.score);
              const showNotes = expandedNotes[p.id];
              return (
                <div key={p.id} className={`score-entry-card ${valid ? 'has-score' : ''}`}>
                  <div className="score-entry-row">
                    <div className="player-avatar">{p.name.charAt(0).toUpperCase()}</div>
                    <span className="score-entry-name">{p.name}</span>
                    <input
                      className={`score-input ${valid ? 'valid' : ''}`}
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g. 14.5"
                      value={entry.score ?? ''}
                      onChange={e => setEntry(p.id, 'score', e.target.value)}
                    />
                    <button
                      className="notes-toggle"
                      onClick={() => toggleNotes(p.id)}
                      aria-label="Add note"
                    >
                      📝
                    </button>
                  </div>
                  {showNotes && (
                    <input
                      className="form-input notes-input"
                      placeholder="Notes (optional)"
                      value={entry.notes ?? ''}
                      onChange={e => setEntry(p.id, 'notes', e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Save bar */}
      {groupPlayers.length > 0 && (
        <div className="save-bar">
          {saved ? (
            <div className="save-success">
              <CheckIcon size={20} /> {entryCount > 0 ? entryCount : 'Scores'} saved!
            </div>
          ) : (
            <button
              className="btn btn-primary btn-full"
              onClick={handleSave}
              disabled={entryCount === 0}
            >
              Save {entryCount > 0 ? `${entryCount} Score${entryCount > 1 ? 's' : ''}` : 'Scores'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

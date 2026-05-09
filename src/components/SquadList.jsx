import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { latestScore } from '../utils/storage.js';
import { scoreStatus, StatusBadge } from './ScoreIndicator.jsx';
import { PlusIcon } from './Icons.jsx';

export default function SquadList({ onNavigate }) {
  const { players, scores, ageGroups } = useApp();
  const [activeGroup, setActiveGroup] = useState('ALL');
  const [search, setSearch] = useState('');

  const groupMap = useMemo(
    () => Object.fromEntries(ageGroups.map(g => [g.id, g])),
    [ageGroups]
  );

  const filtered = useMemo(() => {
    return players
      .filter(p => activeGroup === 'ALL' || p.ageGroup === activeGroup)
      .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const gi = id => ageGroups.findIndex(g => g.id === id);
        if (gi(a.ageGroup) !== gi(b.ageGroup)) return gi(a.ageGroup) - gi(b.ageGroup);
        return a.name.localeCompare(b.name);
      });
  }, [players, scores, activeGroup, search, ageGroups]);

  return (
    <div className="screen">
      <header className="app-header">
        <h1 className="header-title">Squad</h1>
        <button className="icon-btn" onClick={() => onNavigate('add-player')} aria-label="Add player">
          <PlusIcon size={24} />
        </button>
      </header>

      <div className="content">
        {/* Search */}
        <input
          className="search-input"
          placeholder="Search players…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Group filter tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeGroup === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveGroup('ALL')}
          >
            All ({players.length})
          </button>
          {ageGroups.map(g => {
            const count = players.filter(p => p.ageGroup === g.id).length;
            return (
              <button
                key={g.id}
                className={`filter-tab ${activeGroup === g.id ? 'active' : ''}`}
                onClick={() => setActiveGroup(g.id)}
              >
                {g.label} ({count})
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>{search ? 'No players match your search.' : 'No players in this group yet.'}</p>
            <button className="btn btn-primary" onClick={() => onNavigate('add-player')}>
              Add Player
            </button>
          </div>
        ) : (
          <div className="card-list">
            {filtered.map(p => {
              const ls = latestScore(scores, p.id);
              const group = groupMap[p.ageGroup];
              const status = ls ? scoreStatus(ls.score, group) : 'none';
              return (
                <div key={p.id} className="list-row" onClick={() => onNavigate('player', { playerId: p.id })}>
                  <div className="player-avatar" data-status={status}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="list-row-main">
                    <span className="list-row-name">{p.name}</span>
                    <span className="list-row-sub">{group?.label ?? p.ageGroup}</span>
                  </div>
                  <div className="list-row-aside">
                    {ls ? (
                      <>
                        <span className={`score-pill score-pill-${status}`}>{ls.score.toFixed(1)}</span>
                        {group?.mode === 'target' && <StatusBadge score={ls.score} ageGroup={group} size="sm" />}
                      </>
                    ) : (
                      <span className="text-muted text-sm">No score</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button className="fab" onClick={() => onNavigate('add-player')} aria-label="Add player">
        <PlusIcon size={28} />
      </button>
    </div>
  );
}

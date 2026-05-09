import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { addPlayer, updatePlayer } from '../utils/storage.js';
import { ChevronLeftIcon } from './Icons.jsx';

export default function AddEditPlayer({ playerId, onBack }) {
  const { players, setPlayers, ageGroups } = useApp();

  const existing = playerId ? players.find(p => p.id === playerId) : null;

  const [name, setName] = useState(existing?.name ?? '');
  const [ageGroup, setAgeGroup] = useState(existing?.ageGroup ?? ageGroups[0]?.id ?? '');
  const [dob, setDob] = useState(existing?.dob ?? '');
  const [error, setError] = useState('');

  function handleSave() {
    if (!name.trim()) { setError('Name is required.'); return; }
    if (!ageGroup) { setError('Please select an age group.'); return; }
    setError('');

    if (existing) {
      setPlayers(updatePlayer(players, existing.id, { name: name.trim(), ageGroup, dob }));
    } else {
      setPlayers(addPlayer(players, { name, ageGroup, dob }));
    }
    onBack();
  }

  return (
    <div className="screen">
      <header className="app-header">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <ChevronLeftIcon size={24} />
        </button>
        <h1 className="header-title">{existing ? 'Edit Player' : 'Add Player'}</h1>
        <div style={{ width: 40 }} />
      </header>

      <div className="content">
        <div className="form-card">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              className="form-input"
              placeholder="e.g. James Smith"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Age Group *</label>
            <select
              className="form-input"
              value={ageGroup}
              onChange={e => setAgeGroup(e.target.value)}
            >
              {ageGroups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.label}{g.mode === 'target' ? ` — target ${g.target}` : ' — developmental'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth <span className="text-muted">(optional)</span></label>
            <input
              className="form-input"
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button className="btn btn-primary btn-full" onClick={handleSave}>
            {existing ? 'Save Changes' : 'Add Player'}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { DEFAULT_AGE_GROUPS } from '../config/ageGroups.js';
import { exportCsv } from '../utils/storage.js';
import { CheckIcon, DownloadIcon, TrashIcon } from './Icons.jsx';

export default function Settings() {
  const { branding, setBranding, ageGroups, setAgeGroups, players, setPlayers, scores, setScores } = useApp();

  const [brandingForm, setBrandingForm] = useState(branding);
  const [brandingSaved, setBrandingSaved] = useState(false);
  const [editingGroups, setEditingGroups] = useState(false);
  const [groupsForm, setGroupsForm] = useState(ageGroups);
  const [confirmClear, setConfirmClear] = useState(false);

  function saveBrandingForm() {
    setBranding(brandingForm);
    setBrandingSaved(true);
    setTimeout(() => setBrandingSaved(false), 2000);
  }

  function updateGroup(idx, field, value) {
    setGroupsForm(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: field === 'target' ? (value === '' ? null : parseFloat(value)) : value };
      if (field === 'mode' && value === 'developmental') next[idx].target = null;
      return next;
    });
  }

  function saveGroups() {
    setAgeGroups(groupsForm);
    setEditingGroups(false);
  }

  function handleExport() {
    const csv = exportCsv(players, scores, ageGroups);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yoyo-scores-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleClearAll() {
    setPlayers([]);
    setScores([]);
    setConfirmClear(false);
  }

  return (
    <div className="screen">
      <header className="app-header">
        <h1 className="header-title">Settings</h1>
      </header>

      <div className="content">
        {/* Branding */}
        <section className="settings-section">
          <h2 className="settings-section-title">Academy Branding</h2>
          <div className="form-card">
            <div className="form-group">
              <label className="form-label">Academy Name</label>
              <input
                className="form-input"
                value={brandingForm.academyName}
                onChange={e => setBrandingForm(f => ({ ...f, academyName: e.target.value }))}
                placeholder="e.g. Springfield Cricket Academy"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Primary Colour</label>
              <div className="color-row">
                <input
                  type="color"
                  className="color-swatch"
                  value={brandingForm.primaryColor}
                  onChange={e => setBrandingForm(f => ({ ...f, primaryColor: e.target.value }))}
                />
                <input
                  className="form-input"
                  value={brandingForm.primaryColor}
                  onChange={e => setBrandingForm(f => ({ ...f, primaryColor: e.target.value }))}
                  placeholder="#0f4c2a"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Accent Colour</label>
              <div className="color-row">
                <input
                  type="color"
                  className="color-swatch"
                  value={brandingForm.accentColor}
                  onChange={e => setBrandingForm(f => ({ ...f, accentColor: e.target.value }))}
                />
                <input
                  className="form-input"
                  value={brandingForm.accentColor}
                  onChange={e => setBrandingForm(f => ({ ...f, accentColor: e.target.value }))}
                  placeholder="#f0b429"
                />
              </div>
            </div>
            <button className="btn btn-primary" onClick={saveBrandingForm}>
              {brandingSaved ? <><CheckIcon size={16} /> Saved</> : 'Save Branding'}
            </button>
          </div>
        </section>

        {/* Age Groups */}
        <section className="settings-section">
          <div className="section-header">
            <h2 className="settings-section-title">Age Groups</h2>
            <button className="link-btn" onClick={() => { setGroupsForm(ageGroups); setEditingGroups(!editingGroups); }}>
              {editingGroups ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editingGroups ? (
            <div className="form-card">
              {groupsForm.map((g, idx) => (
                <div key={g.id} className="group-edit-row">
                  <span className="group-edit-label">{g.label}</span>
                  <select
                    className="form-input form-input-sm"
                    value={g.mode}
                    onChange={e => updateGroup(idx, 'mode', e.target.value)}
                  >
                    <option value="developmental">Developmental</option>
                    <option value="target">Target</option>
                  </select>
                  {g.mode === 'target' && (
                    <input
                      className="form-input form-input-sm"
                      type="number"
                      step="0.1"
                      min="5"
                      max="23"
                      value={g.target ?? ''}
                      onChange={e => updateGroup(idx, 'target', e.target.value)}
                      placeholder="Target"
                    />
                  )}
                </div>
              ))}
              <div className="btn-row">
                <button className="btn btn-primary" onClick={saveGroups}>Save Groups</button>
                <button
                  className="btn btn-outline"
                  onClick={() => { setGroupsForm(DEFAULT_AGE_GROUPS); }}
                >
                  Reset Defaults
                </button>
              </div>
            </div>
          ) : (
            <div className="card-list">
              {ageGroups.map(g => (
                <div key={g.id} className="list-row">
                  <span className="list-row-name">{g.label}</span>
                  <span className="list-row-aside">
                    {g.mode === 'target'
                      ? <span className="badge badge-met">Target {g.target}</span>
                      : <span className="badge badge-dev">Developmental</span>
                    }
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Data */}
        <section className="settings-section">
          <h2 className="settings-section-title">Data</h2>
          <div className="form-card">
            <p className="text-muted text-sm" style={{ marginBottom: 12 }}>
              {players.length} players · {scores.length} scores stored on this device
            </p>
            <button className="btn btn-outline btn-full" onClick={handleExport}>
              <DownloadIcon size={16} /> Export as CSV
            </button>
            {confirmClear ? (
              <div className="confirm-delete" style={{ marginTop: 12 }}>
                <p>This will delete all players and scores permanently.</p>
                <div className="confirm-actions">
                  <button className="btn btn-danger" onClick={handleClearAll}>Delete Everything</button>
                  <button className="btn btn-outline" onClick={() => setConfirmClear(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <button className="btn btn-danger-outline btn-full" style={{ marginTop: 8 }} onClick={() => setConfirmClear(true)}>
                <TrashIcon size={16} /> Clear All Data
              </button>
            )}
          </div>
        </section>

        <p className="app-version">YoYoBoss v1.0</p>
      </div>
    </div>
  );
}

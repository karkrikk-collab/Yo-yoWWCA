import { v4 as uuid } from './uuid.js';

const KEYS = {
  branding: 'yoyo_branding',
  players: 'yoyo_players',
  scores: 'yoyo_scores',
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Branding
export const DEFAULT_BRANDING = {
  academyName: 'Cricket Academy',
  primaryColor: '#0f4c2a',
  accentColor: '#f0b429',
};

export function loadBranding() { return load(KEYS.branding, DEFAULT_BRANDING); }
export function saveBranding(b) { save(KEYS.branding, b); }

// Players
export function loadPlayers() { return load(KEYS.players, []); }
export function savePlayers(players) { save(KEYS.players, players); }

export function addPlayer(players, { name, ageGroup, dob }) {
  const player = { id: uuid(), name: name.trim(), ageGroup, dob: dob || '', createdAt: new Date().toISOString() };
  return [...players, player];
}

export function updatePlayer(players, id, patch) {
  return players.map(p => p.id === id ? { ...p, ...patch } : p);
}

export function deletePlayer(players, id) {
  return players.filter(p => p.id !== id);
}

// Scores
export function loadScores() { return load(KEYS.scores, []); }
export function saveScores(scores) { save(KEYS.scores, scores); }

export function addScore(scores, { playerId, date, score, notes }) {
  return [...scores, { id: uuid(), playerId, date, score: parseFloat(score), notes: notes || '' }];
}

export function deleteScore(scores, id) {
  return scores.filter(s => s.id !== id);
}

export function latestScore(scores, playerId) {
  const ps = scores.filter(s => s.playerId === playerId).sort((a, b) => b.date.localeCompare(a.date));
  return ps[0] || null;
}

export function playerScores(scores, playerId) {
  return scores.filter(s => s.playerId === playerId).sort((a, b) => a.date.localeCompare(b.date));
}

// CSV export
export function exportCsv(players, scores, ageGroups) {
  const groupMap = Object.fromEntries(ageGroups.map(g => [g.id, g]));
  const rows = [['Name', 'Age Group', 'Date', 'Score', 'Target', 'Notes']];
  scores
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach(s => {
      const p = players.find(pl => pl.id === s.playerId);
      if (!p) return;
      const g = groupMap[p.ageGroup];
      rows.push([p.name, p.ageGroup, s.date, s.score, g?.target ?? 'Dev', s.notes]);
    });
  return rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
}

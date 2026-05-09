import { createContext, useContext, useEffect, useState } from 'react';
import { loadAgeGroups, saveAgeGroups } from '../config/ageGroups.js';
import {
  loadBranding, saveBranding,
  loadPlayers, savePlayers,
  loadScores, saveScores,
} from '../utils/storage.js';

const Ctx = createContext(null);

export function AppProvider({ children }) {
  const [branding, setBrandingState] = useState(loadBranding);
  const [ageGroups, setAgeGroupsState] = useState(loadAgeGroups);
  const [players, setPlayersState] = useState(loadPlayers);
  const [scores, setScoresState] = useState(loadScores);

  function setBranding(b) { setBrandingState(b); saveBranding(b); }
  function setAgeGroups(g) { setAgeGroupsState(g); saveAgeGroups(g); }
  function setPlayers(p) { setPlayersState(p); savePlayers(p); }
  function setScores(s) { setScoresState(s); saveScores(s); }

  // Apply primary colour as CSS custom property so the whole UI reacts
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', branding.primaryColor);
    document.documentElement.style.setProperty('--color-accent', branding.accentColor);
  }, [branding.primaryColor, branding.accentColor]);

  return (
    <Ctx.Provider value={{ branding, setBranding, ageGroups, setAgeGroups, players, setPlayers, scores, setScores }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  return useContext(Ctx);
}

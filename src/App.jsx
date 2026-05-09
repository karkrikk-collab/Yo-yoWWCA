import { useState } from 'react';
import { AppProvider } from './context/AppContext.jsx';
import BottomNav from './components/BottomNav.jsx';
import Dashboard from './components/Dashboard.jsx';
import SquadList from './components/SquadList.jsx';
import AddEditPlayer from './components/AddEditPlayer.jsx';
import RecordSession from './components/RecordSession.jsx';
import PlayerDetail from './components/PlayerDetail.jsx';
import Settings from './components/Settings.jsx';

// Simple push-pop nav stack. Each entry: { screen, ...params }
function useNav(initial = 'dashboard') {
  const [stack, setStack] = useState([{ screen: initial }]);
  const current = stack[stack.length - 1];

  function navigate(screen, params = {}) {
    setStack(prev => [...prev, { screen, ...params }]);
  }

  function goBack() {
    setStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }

  function switchTab(screen) {
    setStack([{ screen }]);
  }

  return { current, navigate, goBack, switchTab };
}

// Map screen names to bottom-nav tab ids
function activeTab(screen) {
  if (['dashboard'].includes(screen)) return 'dashboard';
  if (['squad', 'add-player', 'edit-player', 'player'].includes(screen)) return 'squad';
  if (['record'].includes(screen)) return 'record';
  if (['settings'].includes(screen)) return 'settings';
  return 'dashboard';
}

export default function App() {
  const { current, navigate, goBack, switchTab } = useNav();

  function renderScreen() {
    const { screen, playerId } = current;
    switch (screen) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} />;
      case 'squad':
        return <SquadList onNavigate={navigate} />;
      case 'add-player':
        return <AddEditPlayer onBack={goBack} />;
      case 'edit-player':
        return <AddEditPlayer playerId={playerId} onBack={goBack} />;
      case 'player':
        return <PlayerDetail playerId={playerId} onBack={goBack} onNavigate={navigate} />;
      case 'record':
        return <RecordSession onBack={goBack} onNavigate={navigate} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  }

  return (
    <AppProvider>
      <div className="app-shell">
        <div className="screen-area">
          {renderScreen()}
        </div>
        <BottomNav active={activeTab(current.screen)} onNavigate={switchTab} />
      </div>
    </AppProvider>
  );
}

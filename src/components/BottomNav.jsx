import { HomeIcon, UsersIcon, PlusIcon, SettingsIcon } from './Icons.jsx';

const tabs = [
  { id: 'dashboard', label: 'Home',    Icon: HomeIcon },
  { id: 'squad',     label: 'Squad',   Icon: UsersIcon },
  { id: 'record',    label: 'Record',  Icon: PlusIcon, accent: true },
  { id: 'settings',  label: 'Settings',Icon: SettingsIcon },
];

export default function BottomNav({ active, onNavigate }) {
  return (
    <nav className="bottom-nav">
      {tabs.map(({ id, label, Icon, accent }) => (
        <button
          key={id}
          className={`nav-tab ${active === id ? 'active' : ''} ${accent ? 'accent' : ''}`}
          onClick={() => onNavigate(id)}
          aria-label={label}
        >
          <Icon size={22} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

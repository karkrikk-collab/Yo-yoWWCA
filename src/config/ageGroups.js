// Age group definitions are data-driven so they can be edited via Settings
// without touching component code. Each entry drives score indicators,
// target lines on charts, and squad filtering.
export const DEFAULT_AGE_GROUPS = [
  { id: 'U10', label: 'U10 & Below', mode: 'developmental', target: null },
  { id: 'U11', label: 'U11',         mode: 'developmental', target: null },
  { id: 'U12', label: 'U12',         mode: 'developmental', target: null },
  { id: 'U13', label: 'U13',         mode: 'target',        target: 14.5 },
  { id: 'U14', label: 'U14',         mode: 'target',        target: 15.0 },
  { id: 'U15', label: 'U15',         mode: 'target',        target: 15.5 },
];

export const STORAGE_KEY = 'yoyo_age_groups';

export function loadAgeGroups() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_AGE_GROUPS;
  } catch {
    return DEFAULT_AGE_GROUPS;
  }
}

export function saveAgeGroups(groups) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}

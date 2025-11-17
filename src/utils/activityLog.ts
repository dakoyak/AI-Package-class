const STORAGE_KEY = 'activityLogEntries';
const MAX_ENTRIES = 80;

export type ActivityEntry = {
  id: string;
  category: string;
  label: string;
  detail: string;
  timestamp: string;
};

const safeParse = <T,>(text: string | null, fallback: T): T => {
  if (!text) return fallback;
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
};

export const getActivityLog = (): ActivityEntry[] => {
  return safeParse<ActivityEntry[]>(localStorage.getItem(STORAGE_KEY), []);
};

export const logActivity = (entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => {
  const nextEntry: ActivityEntry = {
    ...entry,
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    timestamp: new Date().toISOString(),
  };
  const existing = getActivityLog();
  const updated = [nextEntry, ...existing].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const clearActivityLog = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const STORAGE_KEY = 'activityLogEntries';
const MAX_ENTRIES = 80;

// Safe localStorage access wrapper
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage access denied:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('localStorage write denied:', error);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage remove denied:', error);
    }
  }
};

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
  return safeParse<ActivityEntry[]>(safeLocalStorage.getItem(STORAGE_KEY), []);
};

export const logActivity = (entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => {
  const nextEntry: ActivityEntry = {
    ...entry,
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    timestamp: new Date().toISOString(),
  };
  const existing = getActivityLog();
  const updated = [nextEntry, ...existing].slice(0, MAX_ENTRIES);
  safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const clearActivityLog = () => {
  safeLocalStorage.removeItem(STORAGE_KEY);
};

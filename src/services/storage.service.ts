/**
 * Local Storage Service for persisting app data
 */

const STORAGE_KEYS = {
  TAGS: "tagary:tags",
  CATEGORIES: "tagary:categories",
  LOGS: "tagary:logs",
  SETTINGS: "tagary:settings",
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const storageService = {
  get<T>(key: StorageKey): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return null;
    }
  },

  set<T>(key: StorageKey, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },

  remove(key: StorageKey): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  clear(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },

  // Convenience methods for specific data types
  getTags: () => storageService.get<import("@/types").Tag[]>(STORAGE_KEYS.TAGS),
  setTags: (tags: import("@/types").Tag[]) => storageService.set(STORAGE_KEYS.TAGS, tags),

  getCategories: () => storageService.get<import("@/types").TagCategory[]>(STORAGE_KEYS.CATEGORIES),
  setCategories: (categories: import("@/types").TagCategory[]) => storageService.set(STORAGE_KEYS.CATEGORIES, categories),

  getLogs: () => storageService.get<import("@/types").LogEntry[]>(STORAGE_KEYS.LOGS),
  setLogs: (logs: import("@/types").LogEntry[]) => storageService.set(STORAGE_KEYS.LOGS, logs),
};

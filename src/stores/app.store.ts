/**
 * App Store - Global app settings and UI state
 */

import dayjs from "dayjs";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  // Theme
  theme: "light" | "dark" | "system";

  // Current view state
  selectedDate: string; // YYYY-MM-DD
  currentView:
    | "day"
    | "calendar"
    | "insights"
    | "settings"
    | "characters"
    | "story"
    | "heatmap"
    | "recap";

  // UI state
  isSidebarOpen: boolean;
}

interface AppActions {
  setTheme: (theme: AppState["theme"]) => void;
  setSelectedDate: (date: string) => void;
  setCurrentView: (view: AppState["currentView"]) => void;
  toggleSidebar: () => void;
  goToToday: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
}

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      theme: "system",
      selectedDate: dayjs().format("YYYY-MM-DD"),
      currentView: "day",
      isSidebarOpen: true,

      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        if (theme === "system") {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "dark"
            : "light";
          root.classList.add(systemTheme);
        } else {
          root.classList.add(theme);
        }
      },

      setSelectedDate: (date) => {
        set({ selectedDate: dayjs(date).format("YYYY-MM-DD") });
      },

      setCurrentView: (view) => {
        set({ currentView: view });
      },

      toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
      },

      goToToday: () => {
        set({ selectedDate: dayjs().format("YYYY-MM-DD") });
      },

      goToPreviousDay: () => {
        const current = dayjs(get().selectedDate);
        set({ selectedDate: current.subtract(1, "day").format("YYYY-MM-DD") });
      },

      goToNextDay: () => {
        const current = dayjs(get().selectedDate);
        set({ selectedDate: current.add(1, "day").format("YYYY-MM-DD") });
      },
    }),
    {
      name: "tagary:app-store",
      partialize: (state) => ({
        theme: state.theme,
        isSidebarOpen: state.isSidebarOpen,
      }),
    },
  ),
);

// Initialize theme on app load
export function initializeTheme() {
  const theme = useAppStore.getState().theme;
  useAppStore.getState().setTheme(theme);

  // Listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (useAppStore.getState().theme === "system") {
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(e.matches ? "dark" : "light");
      }
    });
}

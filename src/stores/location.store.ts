import type { Location } from "@/types";
import { DEFAULT_LOCATIONS } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LocationState {
  locations: Location[];
  initialized: boolean;
}

interface LocationActions {
  initialize: () => void;
  addLocation: (data: Omit<Location, "id" | "createdAt">) => Location;
  updateLocation: (
    id: string,
    updates: Partial<Omit<Location, "id" | "createdAt">>,
  ) => void;
  deleteLocation: (id: string) => void;
  getById: (id: string) => Location | undefined;
  searchByName: (query: string) => Location[];
}

const generateId = () => crypto.randomUUID();

export const useLocationStore = create<LocationState & LocationActions>()(
  persist(
    (set, get) => ({
      locations: [],
      initialized: false,

      initialize: () => {
        const { initialized, locations } = get();
        if (initialized) return;

        if (locations.length === 0) {
          const newLocations: Location[] = DEFAULT_LOCATIONS.map((loc) => ({
            ...loc,
            id: generateId(),
            createdAt: new Date().toISOString(),
          }));
          set({ locations: newLocations, initialized: true });
        } else {
          set({ initialized: true });
        }
      },

      addLocation: (data) => {
        const newLocation: Location = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ locations: [...state.locations, newLocation] }));
        return newLocation;
      },

      updateLocation: (id, updates) => {
        set((state) => ({
          locations: state.locations.map((loc) =>
            loc.id === id ? { ...loc, ...updates } : loc,
          ),
        }));
      },

      deleteLocation: (id) => {
        set((state) => ({
          locations: state.locations.filter((loc) => loc.id !== id),
        }));
      },

      getById: (id) => {
        return get().locations.find((loc) => loc.id === id);
      },

      searchByName: (query) => {
        const q = query.toLowerCase().trim();
        if (!q) return get().locations;
        return get().locations.filter((loc) =>
          loc.name.toLowerCase().includes(q),
        );
      },
    }),
    {
      name: "tagary:location-store",
    },
  ),
);

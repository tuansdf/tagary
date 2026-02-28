import type { SyncData } from "@/services/dropbox.service";
import { dropboxService } from "@/services/dropbox.service";
import { useCharacterStore } from "./character.store";
import { useLocationStore } from "./location.store";
import { useLogStore } from "./log.store";
import { useTagStore } from "./tag.store";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SyncConflict {
  local: SyncData;
  remote: SyncData;
}

interface SyncState {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  syncConflict: SyncConflict | null;
  error: string | null;
}

interface SyncActions {
  checkConnection: () => void;
  connect: () => Promise<void>;
  handleCallback: (code: string) => Promise<boolean>;
  disconnect: () => void;
  sync: () => Promise<void>;
  resolveConflict: (choice: "local" | "remote") => Promise<void>;
  clearError: () => void;
}

function gatherLocalData(): SyncData {
  const logState = useLogStore.getState();
  const tagState = useTagStore.getState();
  const characterState = useCharacterStore.getState();
  const locationState = useLocationStore.getState();

  return {
    version: 1,
    syncedAt: new Date().toISOString(),
    logs: logState.logs,
    tags: tagState.tags,
    categories: tagState.categories,
    characters: characterState.characters,
    locations: locationState.locations,
  };
}

function hydrateStores(data: SyncData) {
  useLogStore.setState({ logs: data.logs });
  useTagStore.setState({
    tags: data.tags,
    categories: data.categories,
    initialized: true,
  });
  useCharacterStore.setState({ characters: data.characters });
  useLocationStore.setState({
    locations: data.locations,
    initialized: true,
  });
}

export const useSyncStore = create<SyncState & SyncActions>()(
  persist(
    (set, get) => ({
      isConnected: dropboxService.isConnected(),
      isSyncing: false,
      lastSyncedAt: null,
      syncConflict: null,
      error: null,

      checkConnection: () => {
        set({ isConnected: dropboxService.isConnected() });
      },

      connect: async () => {
        try {
          const authUrl = await dropboxService.getAuthUrl();
          window.location.href = authUrl;
        } catch (error) {
          console.error("Failed to start Dropbox auth:", error);
          set({ error: "Failed to connect to Dropbox" });
        }
      },

      handleCallback: async (code: string) => {
        const success = await dropboxService.handleAuthCallback(code);
        set({ isConnected: success });
        if (!success) {
          set({ error: "Failed to authenticate with Dropbox" });
        }
        return success;
      },

      disconnect: () => {
        dropboxService.disconnect();
        set({
          isConnected: false,
          lastSyncedAt: null,
          syncConflict: null,
          error: null,
        });
      },

      sync: async () => {
        const { isConnected, isSyncing } = get();
        if (!isConnected || isSyncing) return;

        set({ isSyncing: true, error: null });

        try {
          const localData = gatherLocalData();
          const remoteData = await dropboxService.downloadSyncFile();

          if (!remoteData) {
            // No remote file — first sync, push local
            await dropboxService.uploadSyncFile(localData);
            set({ lastSyncedAt: localData.syncedAt, isSyncing: false });
            return;
          }

          // Remote exists — check if there's a newer version
          const { lastSyncedAt } = get();
          if (lastSyncedAt && remoteData.syncedAt !== lastSyncedAt) {
            // Remote has changed since last sync — conflict
            set({
              syncConflict: { local: localData, remote: remoteData },
              isSyncing: false,
            });
            return;
          }

          // No conflict — push local to remote
          await dropboxService.uploadSyncFile(localData);
          set({ lastSyncedAt: localData.syncedAt, isSyncing: false });
        } catch (error) {
          console.error("Sync failed:", error);
          set({
            error: error instanceof Error ? error.message : "Sync failed",
            isSyncing: false,
          });
        }
      },

      resolveConflict: async (choice) => {
        const { syncConflict } = get();
        if (!syncConflict) return;

        set({ isSyncing: true, error: null });

        try {
          if (choice === "local") {
            // Push local data to remote
            const localData = {
              ...syncConflict.local,
              syncedAt: new Date().toISOString(),
            };
            await dropboxService.uploadSyncFile(localData);
            set({
              lastSyncedAt: localData.syncedAt,
              syncConflict: null,
              isSyncing: false,
            });
          } else {
            // Use remote data — hydrate all stores
            hydrateStores(syncConflict.remote);
            // Then push the remote data back with a new timestamp so both are in sync
            const updatedData = {
              ...syncConflict.remote,
              syncedAt: new Date().toISOString(),
            };
            await dropboxService.uploadSyncFile(updatedData);
            set({
              lastSyncedAt: updatedData.syncedAt,
              syncConflict: null,
              isSyncing: false,
            });
          }
        } catch (error) {
          console.error("Conflict resolution failed:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to resolve conflict",
            isSyncing: false,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "tagary:sync-store",
      partialize: (state) => ({
        lastSyncedAt: state.lastSyncedAt,
      }),
    },
  ),
);

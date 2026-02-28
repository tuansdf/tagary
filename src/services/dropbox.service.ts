import type { Character } from "@/types/character.types";
import type { Location } from "@/types/location.types";
import type { LogEntry } from "@/types/log.types";
import type { Tag, TagCategory } from "@/types/tag.types";
import { Dropbox, DropboxAuth } from "dropbox";

const APP_KEY = import.meta.env.VITE_DROPBOX_APP_KEY;
const REDIRECT_URI = import.meta.env.VITE_DROPBOX_REDIRECT_URI;
const SYNC_FILE_PATH = "/tagary-sync.json";
const TOKEN_KEY = "tagary:dropbox-token";
const REFRESH_TOKEN_KEY = "tagary:dropbox-refresh-token";
const VERIFIER_KEY = "tagary:dropbox-pkce-verifier";

export interface SyncData {
  version: number;
  syncedAt: string;
  logs: LogEntry[];
  tags: Tag[];
  categories: TagCategory[];
  characters: Character[];
  locations: Location[];
}

function getStoredTokens() {
  const accessToken = localStorage.getItem(TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  return { accessToken, refreshToken };
}

function storeTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(VERIFIER_KEY);
}

function createAuth(): DropboxAuth {
  return new DropboxAuth({ clientId: APP_KEY });
}

function createClient(accessToken: string): Dropbox {
  return new Dropbox({ accessToken });
}

export const dropboxService = {
  isConnected(): boolean {
    const { accessToken } = getStoredTokens();
    return !!accessToken;
  },

  async getAuthUrl(): Promise<string> {
    const auth = createAuth();
    const authUrl = await auth.getAuthenticationUrl(
      REDIRECT_URI,
      undefined,
      "code",
      "offline",
      undefined,
      undefined,
      true, // usePKCE
    );
    // Store the PKCE code verifier for the callback
    const codeVerifier = auth.getCodeVerifier();
    localStorage.setItem(VERIFIER_KEY, codeVerifier);
    return authUrl as string;
  },

  async handleAuthCallback(code: string): Promise<boolean> {
    try {
      const auth = createAuth();
      const codeVerifier = localStorage.getItem(VERIFIER_KEY);
      if (!codeVerifier) {
        throw new Error("No PKCE code verifier found");
      }
      auth.setCodeVerifier(codeVerifier);

      const response = await auth.getAccessTokenFromCode(REDIRECT_URI, code);
      const result = response.result as {
        access_token: string;
        refresh_token?: string;
      };

      storeTokens(result.access_token, result.refresh_token);
      localStorage.removeItem(VERIFIER_KEY);
      return true;
    } catch (error) {
      console.error("Dropbox auth callback failed:", error);
      clearTokens();
      return false;
    }
  },

  disconnect() {
    clearTokens();
  },

  async uploadSyncFile(data: SyncData): Promise<boolean> {
    try {
      const { accessToken } = getStoredTokens();
      if (!accessToken) throw new Error("Not connected to Dropbox");

      const dbx = createClient(accessToken);
      const contents = JSON.stringify(data, null, 2);

      await dbx.filesUpload({
        path: SYNC_FILE_PATH,
        contents,
        mode: { ".tag": "overwrite" },
        mute: true,
      });
      return true;
    } catch (error) {
      console.error("Failed to upload sync file:", error);
      throw error;
    }
  },

  async downloadSyncFile(): Promise<SyncData | null> {
    try {
      const { accessToken } = getStoredTokens();
      if (!accessToken) throw new Error("Not connected to Dropbox");

      const dbx = createClient(accessToken);
      const response = await dbx.filesDownload({ path: SYNC_FILE_PATH });

      // The SDK adds fileBlob to the response in browser environments
      const fileBlob = (response.result as { fileBlob?: Blob }).fileBlob;
      if (!fileBlob) throw new Error("No file blob in response");

      const text = await fileBlob.text();
      return JSON.parse(text) as SyncData;
    } catch (error: unknown) {
      // File not found - return null (first sync)
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        (error as { status: number }).status === 409
      ) {
        return null;
      }
      console.error("Failed to download sync file:", error);
      throw error;
    }
  },
};

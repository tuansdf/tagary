import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSyncStore } from "@/stores";
import { CloudOff, Cloud, Loader2, RefreshCw, Unplug } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function DropboxSync() {
  const {
    isConnected,
    isSyncing,
    lastSyncedAt,
    error,
    connect,
    disconnect,
    sync,
    clearError,
  } = useSyncStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isConnected ? (
            <Cloud className="h-5 w-5 text-blue-500" />
          ) : (
            <CloudOff className="h-5 w-5 text-muted-foreground" />
          )}
          Dropbox Sync
        </CardTitle>
        <CardDescription>
          {isConnected
            ? "Your data is connected to Dropbox"
            : "Connect to Dropbox to sync your data across devices"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="flex items-center justify-between rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-destructive hover:text-destructive"
              onClick={clearError}
            >
              ✕
            </Button>
          </div>
        )}

        {isConnected ? (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="flex items-center gap-1.5 font-medium text-green-600 dark:text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Connected
              </span>
            </div>

            {lastSyncedAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last synced</span>
                <span className="font-medium">
                  {dayjs(lastSyncedAt).fromNow()}
                </span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button className="flex-1" onClick={sync} disabled={isSyncing}>
                {isSyncing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {isSyncing ? "Syncing..." : "Sync Now"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={disconnect}
                disabled={isSyncing}
                title="Disconnect"
              >
                <Unplug className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <Button className="w-full" onClick={connect}>
            <Cloud className="mr-2 h-4 w-4" />
            Connect to Dropbox
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

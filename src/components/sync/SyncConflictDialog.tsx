import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useSyncStore } from "@/stores";
import { ArrowDownToLine, ArrowUpFromLine, Loader2 } from "lucide-react";
import dayjs from "dayjs";

export function SyncConflictDialog() {
  const { syncConflict, resolveConflict, isSyncing } = useSyncStore();

  if (!syncConflict) return null;

  const { local, remote } = syncConflict;

  return (
    <Dialog
      open={!!syncConflict}
      onOpenChange={() => {
        if (!isSyncing) {
          useSyncStore.setState({ syncConflict: null });
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Sync Conflict</DialogTitle>
          <DialogDescription>
            A different version was found on Dropbox. Choose which version to
            keep.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Local version */}
          <div className="space-y-2 rounded-lg border p-3">
            <h4 className="text-sm font-semibold text-primary">
              📱 Local (This Device)
            </h4>
            <Separator />
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Logs</span>
                <span className="font-medium text-foreground">
                  {local.logs.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tags</span>
                <span className="font-medium text-foreground">
                  {local.tags.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Characters</span>
                <span className="font-medium text-foreground">
                  {local.characters.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Locations</span>
                <span className="font-medium text-foreground">
                  {local.locations.length}
                </span>
              </div>
              <Separator />
              <div className="text-[10px]">
                {dayjs(local.syncedAt).format("MMM D, YYYY HH:mm:ss")}
              </div>
            </div>
          </div>

          {/* Remote version */}
          <div className="space-y-2 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
            <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              ☁️ Remote (Dropbox)
            </h4>
            <Separator />
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Logs</span>
                <span className="font-medium text-foreground">
                  {remote.logs.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tags</span>
                <span className="font-medium text-foreground">
                  {remote.tags.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Characters</span>
                <span className="font-medium text-foreground">
                  {remote.characters.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Locations</span>
                <span className="font-medium text-foreground">
                  {remote.locations.length}
                </span>
              </div>
              <Separator />
              <div className="text-[10px]">
                {dayjs(remote.syncedAt).format("MMM D, YYYY HH:mm:ss")}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => resolveConflict("local")}
            disabled={isSyncing}
            className="flex-1"
          >
            {isSyncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowUpFromLine className="mr-2 h-4 w-4" />
            )}
            Use Local
          </Button>
          <Button
            onClick={() => resolveConflict("remote")}
            disabled={isSyncing}
            className="flex-1"
          >
            {isSyncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowDownToLine className="mr-2 h-4 w-4" />
            )}
            Use Remote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * LogEntryModal - Modal for creating/editing log entries
 */

import { TagChip, TagPicker } from "@/components/tags";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useLogEntryModal } from "@/hooks";
import type { LogEntry, TimeRange } from "@/types";
import { Trash2 } from "lucide-react";

interface LogEntryModalProps {
  open: boolean;
  onClose: () => void;
  timeRange: TimeRange | null;
  existingLog?: LogEntry;
}

export function LogEntryModal({
  open,
  onClose,
  timeRange,
  existingLog,
}: LogEntryModalProps) {
  const {
    note,
    setNote,
    selectedTags,
    handleToggleTag,
    handleRemoveTag,
    handleSave,
    handleDelete,
    canSave,
    isEditing,
    range,
    timeRangeText,
  } = useLogEntryModal({ existingLog, timeRange, open, onClose });

  if (!range) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Log Entry" : "New Log Entry"}
          </DialogTitle>
          <DialogDescription>{timeRangeText}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Selected Tags</label>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <TagChip
                    key={tag.id}
                    tag={tag}
                    selected
                    removable
                    onRemove={() => handleRemoveTag(tag.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tag Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <TagPicker
              selectedTagIds={selectedTags.map((t) => t.id)}
              onToggleTag={handleToggleTag}
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Note (optional)</label>
            <Textarea
              placeholder="Add a note about this time..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          {isEditing && (
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!canSave}>
              {isEditing ? "Save Changes" : "Add Log"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

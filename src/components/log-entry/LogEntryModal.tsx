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
import { useAppStore, useLogStore, useTagStore } from "@/stores";
import type { LogEntry, TimeRange } from "@/types";
import { formatHour } from "@/types";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

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
  const { selectedDate } = useAppStore();
  const { addLog, updateLog, deleteLog } = useLogStore();
  const { getTagById, incrementTagUsage } = useTagStore();

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const isEditing = !!existingLog;
  const range = existingLog?.timeRange || timeRange;

  // Initialize form when modal opens
  useEffect(() => {
    if (open) {
      if (existingLog) {
        setSelectedTagIds(existingLog.tagIds);
        setNote(existingLog.note || "");
      } else {
        setSelectedTagIds([]);
        setNote("");
      }
    }
  }, [open, existingLog]);

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
  };

  const handleSave = () => {
    if (!range || selectedTagIds.length === 0) return;

    if (isEditing && existingLog) {
      updateLog(existingLog.id, {
        timeRange: range,
        tagIds: selectedTagIds,
        note: note.trim() || undefined,
      });
    } else {
      // Add new log
      addLog({
        date: selectedDate,
        timeRange: range,
        tagIds: selectedTagIds,
        note: note.trim() || undefined,
      });

      // Increment usage count for selected tags
      selectedTagIds.forEach((tagId) => incrementTagUsage(tagId));
    }

    onClose();
  };

  const handleDelete = () => {
    if (existingLog) {
      deleteLog(existingLog.id);
      onClose();
    }
  };

  const selectedTags = selectedTagIds
    .map((id) => getTagById(id))
    .filter(Boolean);

  if (!range) return null;

  const timeRangeText =
    range.startHour === range.endHour
      ? formatHour(range.startHour)
      : `${formatHour(range.startHour)} - ${formatHour(range.endHour)}`;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Log Entry" : "New Log Entry"}
          </DialogTitle>
          <DialogDescription>
            {timeRangeText}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Selected Tags</label>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <TagChip
                    key={tag?.id}
                    tag={tag!}
                    selected
                    removable
                    onRemove={() => handleRemoveTag(tag!.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tag Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <TagPicker
              selectedTagIds={selectedTagIds}
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
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={selectedTagIds.length === 0}
            >
              {isEditing ? "Save Changes" : "Add Log"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

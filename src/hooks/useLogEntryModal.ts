/**
 * useLogEntryModal - Custom hook for log entry modal logic
 */

import { useAppStore, useLogStore, useTagStore } from "@/stores";
import type { LogEntry, TimeRange } from "@/types";
import { useCallback, useEffect, useState } from "react";

interface UseLogEntryModalProps {
  existingLog?: LogEntry;
  timeRange: TimeRange | null;
  open: boolean;
  onClose: () => void;
}

interface UseLogEntryModalReturn {
  // Form state
  selectedTagIds: string[];
  note: string;
  setNote: (note: string) => void;

  // Tag helpers
  selectedTags: ReturnType<typeof useTagStore.getState>["tags"];
  handleToggleTag: (tagId: string) => void;
  handleRemoveTag: (tagId: string) => void;

  // Actions
  handleSave: () => void;
  handleDelete: () => void;
  canSave: boolean;

  // Computed
  isEditing: boolean;
  range: TimeRange | null;
  timeRangeText: string;
}

export function useLogEntryModal({
  existingLog,
  timeRange,
  open,
  onClose,
}: UseLogEntryModalProps): UseLogEntryModalReturn {
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

  const handleToggleTag = useCallback((tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }, []);

  const handleRemoveTag = useCallback((tagId: string) => {
    setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
  }, []);

  const handleSave = useCallback(() => {
    if (!range || selectedTagIds.length === 0) return;

    if (isEditing && existingLog) {
      updateLog(existingLog.id, {
        timeRange: range,
        tagIds: selectedTagIds,
        note: note.trim() || undefined,
      });
    } else {
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
  }, [
    range,
    selectedTagIds,
    isEditing,
    existingLog,
    updateLog,
    addLog,
    selectedDate,
    note,
    incrementTagUsage,
    onClose,
  ]);

  const handleDelete = useCallback(() => {
    if (existingLog) {
      deleteLog(existingLog.id);
      onClose();
    }
  }, [existingLog, deleteLog, onClose]);

  const selectedTags = selectedTagIds
    .map((id) => getTagById(id))
    .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag));

  const canSave = selectedTagIds.length > 0;

  // Format time range text
  const formatHour = (hour: number) =>
    `${String(hour).padStart(2, "0")}:00`;

  const timeRangeText = range
    ? range.startHour === range.endHour
      ? formatHour(range.startHour)
      : `${formatHour(range.startHour)} - ${formatHour(range.endHour)}`
    : "";

  return {
    selectedTagIds,
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
  };
}

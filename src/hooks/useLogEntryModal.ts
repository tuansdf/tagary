import { useAppStore, useLogStore, useTagStore } from "@/stores";
import type { LogEntry, TimeRange } from "@/types";
import { EMOTION_OPTIONS } from "@/types";
import { useCallback, useEffect, useState } from "react";

interface UseLogEntryModalProps {
  existingLog?: LogEntry;
  timeRange: TimeRange | null;
  open: boolean;
  onClose: () => void;
}

interface FormState {
  tagIds: string[];
  note: string;
  description: string;
  characterIds: string[];
  locationId: string | undefined;
  emotionScore: number | undefined;
}

const EMPTY_FORM: FormState = {
  tagIds: [],
  note: "",
  description: "",
  characterIds: [],
  locationId: undefined,
  emotionScore: undefined,
};

function getFormFromLog(log: LogEntry): FormState {
  return {
    tagIds: log.tagIds,
    note: log.note || "",
    description: log.description || "",
    characterIds: log.characterIds || [],
    locationId: log.locationId,
    emotionScore: log.emotionScore,
  };
}

export function useLogEntryModal({
  existingLog,
  timeRange,
  open,
  onClose,
}: UseLogEntryModalProps) {
  const { selectedDate } = useAppStore();
  const { addLog, updateLog, deleteLog } = useLogStore();
  const { getTagById, incrementTagUsage } = useTagStore();

  const isEditing = !!existingLog;
  const range = existingLog?.timeRange || timeRange;

  const [formState, setFormState] = useState<FormState>(EMPTY_FORM);

  // Destructure for convenience
  const {
    tagIds: selectedTagIds,
    note,
    description,
    characterIds,
    locationId,
    emotionScore,
  } = formState;

  // Reset form when modal opens/closes or existingLog changes

  useEffect(() => {
    if (open) {
      setFormState(existingLog ? getFormFromLog(existingLog) : EMPTY_FORM);
    }
  }, [open, existingLog]);

  const setNote = (v: string) => setFormState((s) => ({ ...s, note: v }));
  const setDescription = (v: string) =>
    setFormState((s) => ({ ...s, description: v }));
  const setLocationId = (v: string | undefined) =>
    setFormState((s) => ({ ...s, locationId: v }));
  const setEmotionScore = (v: number | undefined) =>
    setFormState((s) => ({ ...s, emotionScore: v }));

  const handleToggleTag = useCallback((tagId: string) => {
    setFormState((s) => ({
      ...s,
      tagIds: s.tagIds.includes(tagId)
        ? s.tagIds.filter((id) => id !== tagId)
        : [...s.tagIds, tagId],
    }));
  }, []);

  const handleRemoveTag = useCallback((tagId: string) => {
    setFormState((s) => ({
      ...s,
      tagIds: s.tagIds.filter((id) => id !== tagId),
    }));
  }, []);

  const handleAddCharacter = useCallback((charId: string) => {
    setFormState((s) => ({
      ...s,
      characterIds: s.characterIds.includes(charId)
        ? s.characterIds
        : [...s.characterIds, charId],
    }));
  }, []);

  const handleRemoveCharacter = useCallback((charId: string) => {
    setFormState((s) => ({
      ...s,
      characterIds: s.characterIds.filter((id) => id !== charId),
    }));
  }, []);

  const emotionLabel = emotionScore
    ? EMOTION_OPTIONS.find((o) => o.score === emotionScore)?.label
    : undefined;

  const handleSave = useCallback(() => {
    if (selectedTagIds.length === 0 && !description.trim()) return;

    const logData = {
      date: selectedDate,
      timeRange: range || undefined,
      tagIds: selectedTagIds,
      note: note.trim() || undefined,
      description: description.trim() || undefined,
      characterIds: characterIds.length > 0 ? characterIds : undefined,
      locationId,
      emotionScore,
      emotionLabel,
    };

    if (isEditing && existingLog) {
      updateLog(existingLog.id, logData);
    } else {
      addLog(logData);
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
    description,
    characterIds,
    locationId,
    emotionScore,
    emotionLabel,
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

  const canSave = selectedTagIds.length > 0 || !!description.trim();

  const formatHour = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

  const timeRangeText = range
    ? range.startHour === range.endHour
      ? formatHour(range.startHour)
      : `${formatHour(range.startHour)} - ${formatHour(range.endHour)}`
    : "Cả ngày";

  return {
    selectedTagIds,
    note,
    setNote,
    description,
    setDescription,
    characterIds,
    handleAddCharacter,
    handleRemoveCharacter,
    locationId,
    setLocationId,
    emotionScore,
    setEmotionScore,
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

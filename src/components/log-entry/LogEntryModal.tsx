import { CharacterChip, CharacterMention } from "@/components/characters";
import { EmotionPicker } from "@/components/emotion/EmotionPicker";
import { LocationPicker } from "@/components/location/LocationPicker";
import { TagChip, TagPicker } from "@/components/tags";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile, useLogEntryModal } from "@/hooks";
import { useCharacterStore } from "@/stores";
import type { LogEntry, Tag, TimeRange } from "@/types";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface LogEntryModalProps {
  open: boolean;
  onClose: () => void;
  timeRange: TimeRange | null;
  existingLog?: LogEntry;
}

function LogEntryForm({
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
}: {
  note: string;
  setNote: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  characterIds: string[];
  handleAddCharacter: (id: string) => void;
  handleRemoveCharacter: (id: string) => void;
  locationId: string | undefined;
  setLocationId: (id: string | undefined) => void;
  emotionScore: number | undefined;
  setEmotionScore: (v: number | undefined) => void;
  selectedTags: Tag[];
  handleToggleTag: (id: string) => void;
  handleRemoveTag: (id: string) => void;
}) {
  const { getById } = useCharacterStore();
  const resolvedCharacters = characterIds
    .map((id) => getById(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof getById>>[];

  return (
    <div className="space-y-4 py-4">
      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          placeholder="What happened..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="resize-none"
          rows={3}
        />
      </div>

      {/* Characters (@mention) */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Characters</label>
        {resolvedCharacters.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {resolvedCharacters.map((char) => (
              <CharacterChip
                key={char.id}
                character={char}
                removable
                onRemove={() => handleRemoveCharacter(char.id)}
              />
            ))}
          </div>
        )}
        <CharacterMention
          onSelect={handleAddCharacter}
          selectedIds={characterIds}
        />
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Location</label>
        <LocationPicker selectedId={locationId} onSelect={setLocationId} />
      </div>

      {/* Emotion */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Mood</label>
        <EmotionPicker value={emotionScore} onChange={setEmotionScore} />
      </div>

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
        <label className="text-sm font-medium">Note</label>
        <Textarea
          placeholder="Additional notes (optional)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="resize-none"
          rows={2}
        />
      </div>
    </div>
  );
}

export function LogEntryModal({
  open,
  onClose,
  timeRange,
  existingLog,
}: LogEntryModalProps) {
  const isMobile = useIsMobile();
  const {
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
  } = useLogEntryModal({ existingLog, timeRange, open, onClose });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!range && !open) return null;

  const formProps = {
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
  };

  const footerContent = (
    <>
      {isEditing && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      )}
      <div className="flex gap-2 ml-auto">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!canSave}>
          {isEditing ? "Save" : "Create"}
        </Button>
      </div>
    </>
  );

  // Mobile: Drawer from bottom
  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
          <DrawerContent className="max-h-[92vh]">
            <DrawerHeader>
              <DrawerTitle>
                {isEditing ? "Edit Entry" : "New Entry"}
              </DrawerTitle>
              <DrawerDescription>{timeRangeText}</DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 flex-1">
              <LogEntryForm {...formProps} />
            </div>
            <DrawerFooter className="flex-row justify-between">
              {footerContent}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <ConfirmDialog
          open={showDeleteConfirm}
          onConfirm={() => {
            setShowDeleteConfirm(false);
            handleDelete();
          }}
          onCancel={() => setShowDeleteConfirm(false)}
          title="Delete Entry"
          description="Are you sure you want to delete this log entry? This action cannot be undone."
        />
      </>
    );
  }

  // Desktop: Dialog
  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Entry" : "New Entry"}</DialogTitle>
            <DialogDescription>{timeRangeText}</DialogDescription>
          </DialogHeader>
          <LogEntryForm {...formProps} />
          <DialogFooter className="flex-row justify-between sm:justify-between">
            {footerContent}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteConfirm}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          handleDelete();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Delete Entry"
        description="Are you sure you want to delete this log entry? This action cannot be undone."
      />
    </>
  );
}

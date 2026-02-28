import { CharacterChip, CharacterMention } from "@/components/characters";
import { EmotionPicker } from "@/components/emotion/EmotionPicker";
import { LocationPicker } from "@/components/location/LocationPicker";
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
import { useCharacterStore } from "@/stores";
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

  const { getById } = useCharacterStore();

  const resolvedCharacters = characterIds
    .map((id) => getById(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof getById>>[];

  if (!range && !open) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Sửa sự kiện" : "Thêm sự kiện"}
          </DialogTitle>
          <DialogDescription>{timeRangeText}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả sự kiện</label>
            <Textarea
              placeholder="Hôm nay đã làm gì..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Characters (@mention) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nhân vật</label>
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
            <label className="text-sm font-medium">Địa điểm</label>
            <LocationPicker selectedId={locationId} onSelect={setLocationId} />
          </div>

          {/* Emotion */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cảm xúc</label>
            <EmotionPicker value={emotionScore} onChange={setEmotionScore} />
          </div>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags đã chọn</label>
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
            <label className="text-sm font-medium">Ghi chú</label>
            <Textarea
              placeholder="Ghi chú thêm (tùy chọn)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          {isEditing && (
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={!canSave}>
              {isEditing ? "Lưu" : "Thêm"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

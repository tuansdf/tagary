import { ConfirmDialog } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCharacterStore } from "@/stores";
import type { Character, Gender, Relationship } from "@/types";
import { GENDER_LABELS, RELATIONSHIP_LABELS } from "@/types";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
];

const RELATIONSHIPS: Relationship[] = [
  "friend",
  "colleague",
  "sibling",
  "parent",
  "child",
  "partner",
  "classmate",
  "other",
];

const GENDERS: Gender[] = ["male", "female", "other"];

interface CharacterFormState {
  name: string;
  nickname: string;
  relationship: Relationship;
  gender: Gender;
  color: string;
  avatar: string | undefined;
}

const EMPTY_FORM: CharacterFormState = {
  name: "",
  nickname: "",
  relationship: "friend",
  gender: "other",
  color: COLORS[0],
  avatar: undefined,
};

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

interface CharacterModalProps {
  open: boolean;
  onClose: () => void;
  existingCharacter?: Character;
}

export function CharacterModal({
  open,
  onClose,
  existingCharacter,
}: CharacterModalProps) {
  const { addCharacter, updateCharacter, deleteCharacter } =
    useCharacterStore();

  const [form, setForm] = useState<CharacterFormState>(EMPTY_FORM);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { name, nickname, relationship, gender, color, avatar } = form;

  const isEditing = !!existingCharacter;

  useEffect(() => {
    if (open && existingCharacter) {
      setForm({
        name: existingCharacter.name,
        nickname: existingCharacter.nickname || "",
        relationship: existingCharacter.relationship,
        gender: existingCharacter.gender,
        color: existingCharacter.color,
        avatar: existingCharacter.avatar,
      });
    } else if (open) {
      setForm({ ...EMPTY_FORM, color: randomColor() });
    }
  }, [open, existingCharacter]);

  const setName = (v: string) => setForm((s) => ({ ...s, name: v }));
  const setNickname = (v: string) => setForm((s) => ({ ...s, nickname: v }));
  const setRelationship = (v: Relationship) =>
    setForm((s) => ({ ...s, relationship: v }));
  const setGender = (v: Gender) => setForm((s) => ({ ...s, gender: v }));
  const setColor = (v: string) => setForm((s) => ({ ...s, color: v }));
  const setAvatar = (v: string | undefined) =>
    setForm((s) => ({ ...s, avatar: v }));

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const data = {
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      relationship,
      gender,
      color,
      avatar,
    };

    if (isEditing) {
      updateCharacter(existingCharacter.id, data);
    } else {
      addCharacter(data);
    }
    onClose();
  };

  const handleDelete = () => {
    if (existingCharacter) {
      deleteCharacter(existingCharacter.id);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Character" : "Add New Character"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update character information"
                : "Add a new person to your diary"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed text-2xl"
                style={{ borderColor: color }}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span style={{ color }}>
                    {name ? name[0].toUpperCase() : "?"}
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="avatar-upload"
                  className="text-sm cursor-pointer text-primary hover:underline"
                >
                  Upload photo
                </Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                {avatar && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => setAvatar(undefined)}
                  >
                    Remove photo
                  </Button>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="char-name">Name *</Label>
              <Input
                id="char-name"
                placeholder="Enter character name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Nickname */}
            <div className="space-y-2">
              <Label htmlFor="char-nickname">Nickname</Label>
              <Input
                id="char-nickname"
                placeholder="Nickname (optional)"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>

            {/* Relationship */}
            <div className="space-y-2">
              <Label>Relationship</Label>
              <div className="flex flex-wrap gap-2">
                {RELATIONSHIPS.map((rel) => (
                  <Button
                    key={rel}
                    type="button"
                    variant={relationship === rel ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setRelationship(rel)}
                  >
                    {RELATIONSHIP_LABELS[rel]}
                  </Button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label>Gender</Label>
              <div className="flex gap-2">
                {GENDERS.map((g) => (
                  <Button
                    key={g}
                    type="button"
                    variant={gender === g ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGender(g)}
                  >
                    {GENDER_LABELS[g]}
                  </Button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                      color === c
                        ? "border-foreground scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-between">
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
              <Button onClick={handleSave} disabled={!name.trim()}>
                {isEditing ? "Save" : "Create"}
              </Button>
            </div>
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
        title="Delete Character"
        description="Are you sure you want to delete this character? They will be removed from all log entries."
      />
    </>
  );
}

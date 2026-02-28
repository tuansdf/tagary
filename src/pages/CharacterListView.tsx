import { CharacterChip, CharacterModal } from "@/components/characters";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCharacterStore } from "@/stores";
import type { Character } from "@/types";
import { RELATIONSHIP_LABELS } from "@/types";
import { Plus, User } from "lucide-react";
import { useState } from "react";

export function CharacterListView() {
  const { characters } = useCharacterStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<
    Character | undefined
  >();

  const handleAdd = () => {
    setEditingCharacter(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingCharacter(undefined);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Nhân vật"
          description="Quản lý các nhân vật trong nhật ký"
        />
        <Button onClick={handleAdd} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Thêm mới
        </Button>
      </div>

      {characters.length === 0 ? (
        <Card className="flex-1">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Chưa có nhân vật nào.
              <br />
              Thêm nhân vật để bắt đầu ghi nhật ký!
            </p>
            <Button onClick={handleAdd} className="mt-4 gap-1.5">
              <Plus className="h-4 w-4" />
              Thêm nhân vật đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => (
            <Card
              key={character.id}
              className="cursor-pointer transition-colors hover:bg-accent/50"
              onClick={() => handleEdit(character)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                {/* Avatar */}
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
                  style={{ backgroundColor: character.color }}
                >
                  {character.avatar ? (
                    <img
                      src={character.avatar}
                      alt={character.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    character.name[0].toUpperCase()
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{character.name}</p>
                  {character.nickname && (
                    <p className="text-xs text-muted-foreground truncate">
                      aka {character.nickname}
                    </p>
                  )}
                  <div className="mt-1">
                    <CharacterChip character={character} size="sm" />
                  </div>
                </div>

                {/* Relationship badge */}
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {RELATIONSHIP_LABELS[character.relationship]}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CharacterModal
        open={isModalOpen}
        onClose={handleClose}
        existingCharacter={editingCharacter}
      />
    </div>
  );
}

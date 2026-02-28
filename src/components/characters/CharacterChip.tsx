import { Badge } from "@/components/ui/badge";
import type { Character } from "@/types";
import { User, X } from "lucide-react";

interface CharacterChipProps {
  character: Character;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  size?: "sm" | "md";
}

export function CharacterChip({
  character,
  removable,
  onRemove,
  onClick,
  size = "sm",
}: CharacterChipProps) {
  return (
    <Badge
      variant="secondary"
      className={`inline-flex items-center gap-1.5 cursor-default ${
        onClick ? "cursor-pointer hover:opacity-80" : ""
      } ${size === "md" ? "text-sm px-3 py-1" : "text-xs px-2 py-0.5"}`}
      style={{
        backgroundColor: character.color + "20",
        color: character.color,
        borderColor: character.color + "40",
      }}
      onClick={onClick}
    >
      {character.avatar ? (
        <img
          src={character.avatar}
          alt={character.name}
          className={`rounded-full object-cover ${
            size === "md" ? "h-5 w-5" : "h-4 w-4"
          }`}
        />
      ) : (
        <User className={size === "md" ? "h-3.5 w-3.5" : "h-3 w-3"} />
      )}
      <span>{character.nickname || character.name}</span>
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full hover:bg-black/10 p-0.5"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
}

import { CharacterChip } from "@/components/characters/CharacterChip";
import { useCharacterStore } from "@/stores";
import { useEffect, useRef, useState } from "react";

interface CharacterMentionProps {
  onSelect: (characterId: string) => void;
  selectedIds: string[];
}

export function CharacterMention({
  onSelect,
  selectedIds,
}: CharacterMentionProps) {
  const { characters, searchByName } = useCharacterStore();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const results = query
    ? searchByName(query).filter((c) => !selectedIds.includes(c.id))
    : characters.filter((c) => !selectedIds.includes(c.id));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">@</span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search characters..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 top-full z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md"
        >
          {results.map((character) => (
            <button
              key={character.id}
              type="button"
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                onSelect(character.id);
                setQuery("");
                setIsOpen(false);
              }}
            >
              <CharacterChip character={character} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

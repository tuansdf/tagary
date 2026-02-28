import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocationStore } from "@/stores";
import type { Location } from "@/types";
import { MapPin, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface LocationPickerProps {
  selectedId?: string;
  onSelect: (locationId: string | undefined) => void;
}

export function LocationPicker({ selectedId, onSelect }: LocationPickerProps) {
  const { locations, searchByName, addLocation, initialize, initialized } =
    useLocationStore();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initialized) initialize();
  }, [initialize, initialized]);

  const selected = selectedId
    ? locations.find((l) => l.id === selectedId)
    : undefined;

  const results = query ? searchByName(query) : locations;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setIsCreating(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateLocation = () => {
    if (!newName.trim()) return;
    const loc = addLocation({
      name: newName.trim(),
      color: "#6366f1",
    });
    onSelect(loc.id);
    setNewName("");
    setIsCreating(false);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Selected display or search input */}
      {selected && !isOpen ? (
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"
          onClick={() => setIsOpen(true)}
        >
          <MapPin className="h-4 w-4" style={{ color: selected.color }} />
          <span>{selected.name}</span>
          <button
            type="button"
            className="ml-auto text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(undefined);
            }}
          >
            ✕
          </button>
        </button>
      ) : (
        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Chọn địa điểm..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 top-full z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md"
        >
          {results.map((loc: Location) => (
            <button
              key={loc.id}
              type="button"
              className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent ${
                selectedId === loc.id ? "bg-accent" : ""
              }`}
              onClick={() => {
                onSelect(loc.id);
                setQuery("");
                setIsOpen(false);
              }}
            >
              <MapPin className="h-3.5 w-3.5" style={{ color: loc.color }} />
              {loc.name}
            </button>
          ))}

          {/* Create new */}
          {isCreating ? (
            <div className="flex items-center gap-2 p-2 border-t mt-1">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Tên địa điểm mới..."
                className="h-7 text-xs"
                onKeyDown={(e) => e.key === "Enter" && handleCreateLocation()}
              />
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={handleCreateLocation}
              >
                OK
              </Button>
            </div>
          ) : (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground border-t mt-1 pt-2"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm địa điểm mới
            </button>
          )}
        </div>
      )}
    </div>
  );
}

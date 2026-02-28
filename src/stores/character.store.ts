import type { Character, Gender, Relationship } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CharacterState {
  characters: Character[];
}

interface CharacterActions {
  addCharacter: (
    data: Omit<Character, "id" | "createdAt" | "updatedAt">,
  ) => Character;
  updateCharacter: (
    id: string,
    updates: Partial<Omit<Character, "id" | "createdAt">>,
  ) => void;
  deleteCharacter: (id: string) => void;
  getById: (id: string) => Character | undefined;
  searchByName: (query: string) => Character[];
  getByRelationship: (relationship: Relationship) => Character[];
  getByGender: (gender: Gender) => Character[];
}

const generateId = () => crypto.randomUUID();

export const useCharacterStore = create<CharacterState & CharacterActions>()(
  persist(
    (set, get) => ({
      characters: [],

      addCharacter: (data) => {
        const now = new Date().toISOString();
        const newCharacter: Character = {
          ...data,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ characters: [...state.characters, newCharacter] }));
        return newCharacter;
      },

      updateCharacter: (id, updates) => {
        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === id
              ? { ...c, ...updates, updatedAt: new Date().toISOString() }
              : c,
          ),
        }));
      },

      deleteCharacter: (id) => {
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id),
        }));
      },

      getById: (id) => {
        return get().characters.find((c) => c.id === id);
      },

      searchByName: (query) => {
        const q = query.toLowerCase().trim();
        if (!q) return get().characters;
        return get().characters.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            (c.nickname && c.nickname.toLowerCase().includes(q)),
        );
      },

      getByRelationship: (relationship) => {
        return get().characters.filter((c) => c.relationship === relationship);
      },

      getByGender: (gender) => {
        return get().characters.filter((c) => c.gender === gender);
      },
    }),
    {
      name: "tagary:character-store",
    },
  ),
);

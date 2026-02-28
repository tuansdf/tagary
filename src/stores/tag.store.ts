/**
 * Tag Store - Zustand store for tag and category management
 */

import type { Tag, TagCategory } from "@/types";
import { DEFAULT_CATEGORIES, DEFAULT_TAGS } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TagState {
  tags: Tag[];
  categories: TagCategory[];
  initialized: boolean;
}

interface TagActions {
  // Initialization
  initialize: () => void;

  // Tag CRUD
  addTag: (tag: Omit<Tag, "id" | "createdAt" | "usageCount">) => Tag;
  updateTag: (id: string, updates: Partial<Omit<Tag, "id">>) => void;
  deleteTag: (id: string) => void;
  incrementTagUsage: (tagId: string) => void;

  // Category CRUD
  addCategory: (category: Omit<TagCategory, "id">) => TagCategory;
  updateCategory: (
    id: string,
    updates: Partial<Omit<TagCategory, "id">>,
  ) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (categoryIds: string[]) => void;

  // Helpers
  getTagsByCategory: (categoryId: string) => Tag[];
  getTagById: (id: string) => Tag | undefined;
  getCategoryById: (id: string) => TagCategory | undefined;
}

const generateId = () => crypto.randomUUID();

export const useTagStore = create<TagState & TagActions>()(
  persist(
    (set, get) => ({
      tags: [],
      categories: [],
      initialized: false,

      initialize: () => {
        const { initialized, categories, tags } = get();
        if (initialized) return;

        // Only initialize with defaults if no data exists
        if (categories.length === 0 && tags.length === 0) {
          const newCategories: TagCategory[] = DEFAULT_CATEGORIES.map(
            (cat, index) => ({
              ...cat,
              id: generateId(),
              order: index,
            }),
          );

          const newTags: Tag[] = [];
          newCategories.forEach((category) => {
            const defaultTagsForCategory = DEFAULT_TAGS[category.name] || [];
            defaultTagsForCategory.forEach((tag) => {
              newTags.push({
                ...tag,
                id: generateId(),
                categoryId: category.id,
                createdAt: new Date().toISOString(),
                usageCount: 0,
              });
            });
          });

          set({ categories: newCategories, tags: newTags, initialized: true });
        } else {
          set({ initialized: true });
        }
      },

      addTag: (tagData) => {
        const newTag: Tag = {
          ...tagData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          usageCount: 0,
        };
        set((state) => ({ tags: [...state.tags, newTag] }));
        return newTag;
      },

      updateTag: (id, updates) => {
        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.id === id ? { ...tag, ...updates } : tag,
          ),
        }));
      },

      deleteTag: (id) => {
        set((state) => ({ tags: state.tags.filter((tag) => tag.id !== id) }));
      },

      incrementTagUsage: (tagId) => {
        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.id === tagId ? { ...tag, usageCount: tag.usageCount + 1 } : tag,
          ),
        }));
      },

      addCategory: (categoryData) => {
        const newCategory: TagCategory = {
          ...categoryData,
          id: generateId(),
        };
        set((state) => ({ categories: [...state.categories, newCategory] }));
        return newCategory;
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, ...updates } : cat,
          ),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
          // Also delete all tags in this category
          tags: state.tags.filter((tag) => tag.categoryId !== id),
        }));
      },

      reorderCategories: (categoryIds) => {
        set((state) => ({
          categories: categoryIds
            .map((id, index) => {
              const category = state.categories.find((c) => c.id === id);
              return category ? { ...category, order: index } : null;
            })
            .filter(Boolean) as TagCategory[],
        }));
      },

      getTagsByCategory: (categoryId) => {
        return get().tags.filter((tag) => tag.categoryId === categoryId);
      },

      getTagById: (id) => {
        return get().tags.find((tag) => tag.id === id);
      },

      getCategoryById: (id) => {
        return get().categories.find((cat) => cat.id === id);
      },
    }),
    {
      name: "tagary:tag-store",
    },
  ),
);

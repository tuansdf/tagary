/**
 * useTagManagement - Custom hook for tag and category CRUD operations
 */

import { useTagStore } from "@/stores";
import type { Tag, TagCategory } from "@/types";
import { useCallback, useState } from "react";

interface UseTagManagementReturn {
  // Tag dialog state
  isTagDialogOpen: boolean;
  editingTag: Tag | null;
  tagName: string;
  tagColor: string;
  tagCategoryId: string;
  setTagName: (name: string) => void;
  setTagColor: (color: string) => void;
  setTagCategoryId: (id: string) => void;
  openTagDialog: (tag?: Tag) => void;
  closeTagDialog: () => void;
  handleSaveTag: () => void;
  canSaveTag: boolean;

  // Category dialog state
  isCategoryDialogOpen: boolean;
  editingCategory: TagCategory | null;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  setCategoryName: (name: string) => void;
  setCategoryColor: (color: string) => void;
  setCategoryIcon: (icon: string) => void;
  openCategoryDialog: (category?: TagCategory) => void;
  closeCategoryDialog: () => void;
  handleSaveCategory: () => void;
  canSaveCategory: boolean;

  // Data
  sortedCategories: TagCategory[];
}

const DEFAULT_COLOR = "#3b82f6";

export function useTagManagement(): UseTagManagementReturn {
  const {
    categories,
    addTag,
    updateTag,
    addCategory,
    updateCategory,
  } = useTagStore();

  // Tag dialog state
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState(DEFAULT_COLOR);
  const [tagCategoryId, setTagCategoryId] = useState("");

  // Category dialog state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TagCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState(DEFAULT_COLOR);
  const [categoryIcon, setCategoryIcon] = useState("tag");

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  // Tag dialog handlers
  const openTagDialog = useCallback(
    (tag?: Tag) => {
      if (tag) {
        setEditingTag(tag);
        setTagName(tag.name);
        setTagColor(tag.color);
        setTagCategoryId(tag.categoryId);
      } else {
        setEditingTag(null);
        setTagName("");
        setTagColor(DEFAULT_COLOR);
        setTagCategoryId(categories[0]?.id || "");
      }
      setIsTagDialogOpen(true);
    },
    [categories]
  );

  const closeTagDialog = useCallback(() => {
    setIsTagDialogOpen(false);
  }, []);

  const handleSaveTag = useCallback(() => {
    if (!tagName.trim() || !tagCategoryId) return;

    if (editingTag) {
      updateTag(editingTag.id, {
        name: tagName.trim(),
        color: tagColor,
        categoryId: tagCategoryId,
      });
    } else {
      addTag({
        name: tagName.trim(),
        color: tagColor,
        categoryId: tagCategoryId,
      });
    }
    setIsTagDialogOpen(false);
  }, [tagName, tagCategoryId, editingTag, updateTag, addTag, tagColor]);

  // Category dialog handlers
  const openCategoryDialog = useCallback((category?: TagCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
      setCategoryColor(category.color);
      setCategoryIcon(category.icon);
    } else {
      setEditingCategory(null);
      setCategoryName("");
      setCategoryColor(DEFAULT_COLOR);
      setCategoryIcon("tag");
    }
    setIsCategoryDialogOpen(true);
  }, []);

  const closeCategoryDialog = useCallback(() => {
    setIsCategoryDialogOpen(false);
  }, []);

  const handleSaveCategory = useCallback(() => {
    if (!categoryName.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: categoryName.trim(),
        color: categoryColor,
        icon: categoryIcon,
      });
    } else {
      addCategory({
        name: categoryName.trim(),
        color: categoryColor,
        icon: categoryIcon,
        order: categories.length,
      });
    }
    setIsCategoryDialogOpen(false);
  }, [
    categoryName,
    editingCategory,
    updateCategory,
    addCategory,
    categoryColor,
    categoryIcon,
    categories.length,
  ]);

  return {
    // Tag dialog
    isTagDialogOpen,
    editingTag,
    tagName,
    tagColor,
    tagCategoryId,
    setTagName,
    setTagColor,
    setTagCategoryId,
    openTagDialog,
    closeTagDialog,
    handleSaveTag,
    canSaveTag: !!tagName.trim(),

    // Category dialog
    isCategoryDialogOpen,
    editingCategory,
    categoryName,
    categoryColor,
    categoryIcon,
    setCategoryName,
    setCategoryColor,
    setCategoryIcon,
    openCategoryDialog,
    closeCategoryDialog,
    handleSaveCategory,
    canSaveCategory: !!categoryName.trim(),

    // Data
    sortedCategories,
  };
}

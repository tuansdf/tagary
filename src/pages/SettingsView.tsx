/**
 * SettingsView - Tag management and app settings
 */

import { TagChip } from "@/components/tags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAppStore, useTagStore } from "@/stores";
import type { Tag, TagCategory } from "@/types";
import { Monitor, Moon, Pencil, Plus, Sun, Trash2 } from "lucide-react";
import { useState } from "react";

export function SettingsView() {
  const { tags, categories, addTag, updateTag, deleteTag, addCategory, updateCategory, deleteCategory } = useTagStore();
  const { theme, setTheme } = useAppStore();

  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editingCategory, setEditingCategory] = useState<TagCategory | null>(null);

  // Tag form state
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#3b82f6");
  const [tagCategoryId, setTagCategoryId] = useState("");

  // Category form state
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#3b82f6");
  const [categoryIcon, setCategoryIcon] = useState("tag");

  const openTagDialog = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setTagName(tag.name);
      setTagColor(tag.color);
      setTagCategoryId(tag.categoryId);
    } else {
      setEditingTag(null);
      setTagName("");
      setTagColor("#3b82f6");
      setTagCategoryId(categories[0]?.id || "");
    }
    setIsTagDialogOpen(true);
  };

  const openCategoryDialog = (category?: TagCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
      setCategoryColor(category.color);
      setCategoryIcon(category.icon);
    } else {
      setEditingCategory(null);
      setCategoryName("");
      setCategoryColor("#3b82f6");
      setCategoryIcon("tag");
    }
    setIsCategoryDialogOpen(true);
  };

  const handleSaveTag = () => {
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
  };

  const handleSaveCategory = () => {
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
  };

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your tags and preferences
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how Tagary looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
                className="flex-1"
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
                className="flex-1"
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                onClick={() => setTheme("system")}
                className="flex-1"
              >
                <Monitor className="mr-2 h-4 w-4" />
                System
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Organize your tags into groups</CardDescription>
            </div>
            <Button size="sm" onClick={() => openCategoryDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sortedCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {tags.filter((t) => t.categoryId === category.id).length} tags
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openCategoryDialog(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tags by Category */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tags</CardTitle>
            <CardDescription>Manage your tags for logging</CardDescription>
          </div>
          <Button size="sm" onClick={() => openTagDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Tag
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sortedCategories.map((category, index) => {
              const categoryTags = tags.filter((t) => t.categoryId === category.id);
              return (
                <div key={category.id}>
                  {index > 0 && <Separator className="mb-6" />}
                  <h4
                    className="mb-3 text-sm font-semibold"
                    style={{ color: category.color }}
                  >
                    {category.name}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {categoryTags.map((tag) => (
                      <div key={tag.id} className="group relative">
                        <TagChip tag={tag} size="lg" />
                        <div className="absolute -right-1 -top-1 hidden gap-0.5 group-hover:flex">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => openTagDialog(tag)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => deleteTag(tag.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {categoryTags.length === 0 && (
                      <p className="text-sm text-muted-foreground">No tags in this category</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tag Dialog */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTag ? "Edit Tag" : "New Tag"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="Tag name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={tagColor}
                  onChange={(e) => setTagColor(e.target.value)}
                  className="h-10 w-16 cursor-pointer p-1"
                />
                <Input
                  value={tagColor}
                  onChange={(e) => setTagColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={tagCategoryId}
                onChange={(e) => setTagCategoryId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {sortedCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTag} disabled={!tagName.trim()}>
              {editingTag ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={categoryColor}
                  onChange={(e) => setCategoryColor(e.target.value)}
                  className="h-10 w-16 cursor-pointer p-1"
                />
                <Input
                  value={categoryColor}
                  onChange={(e) => setCategoryColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory} disabled={!categoryName.trim()}>
              {editingCategory ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * SettingsView - Tag management and app settings
 */

import { PageHeader } from "@/components/shared";
import { ConfirmDialog } from "@/components/shared";
import { DropboxSync, SyncConflictDialog } from "@/components/sync";
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
import { useTagManagement } from "@/hooks";
import { useAppStore, useTagStore } from "@/stores";
import { Monitor, Moon, Pencil, Plus, Sun, Trash2 } from "lucide-react";
import { useState } from "react";

export function SettingsView() {
  const { tags, deleteTag, deleteCategory } = useTagStore();
  const { theme, setTheme } = useAppStore();
  const [pendingDeleteTag, setPendingDeleteTag] = useState<string | null>(null);
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<
    string | null
  >(null);

  const {
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
    canSaveTag,
    // Category dialog
    isCategoryDialogOpen,
    editingCategory,
    categoryName,
    categoryColor,
    setCategoryName,
    setCategoryColor,
    openCategoryDialog,
    closeCategoryDialog,
    handleSaveCategory,
    canSaveCategory,
    // Data
    sortedCategories,
  } = useTagManagement();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <PageHeader
        title="Settings"
        description="Manage your tags and preferences"
      />

      <SyncConflictDialog />

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

        {/* Dropbox Sync */}
        <DropboxSync />

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
                      {tags.filter((t) => t.categoryId === category.id).length}{" "}
                      tags
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
                      onClick={() => setPendingDeleteCategory(category.id)}
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
              const categoryTags = tags.filter(
                (t) => t.categoryId === category.id,
              );
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
                            onClick={() => setPendingDeleteTag(tag.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {categoryTags.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No tags in this category
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tag Dialog */}
      <Dialog open={isTagDialogOpen} onOpenChange={closeTagDialog}>
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
            <Button variant="outline" onClick={closeTagDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveTag} disabled={!canSaveTag}>
              {editingTag ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={closeCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "New Category"}
            </DialogTitle>
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
            <Button variant="outline" onClick={closeCategoryDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory} disabled={!canSaveCategory}>
              {editingCategory ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmations */}
      <ConfirmDialog
        open={!!pendingDeleteTag}
        onConfirm={() => {
          if (pendingDeleteTag) deleteTag(pendingDeleteTag);
          setPendingDeleteTag(null);
        }}
        onCancel={() => setPendingDeleteTag(null)}
        title="Delete Tag"
        description="Are you sure you want to delete this tag? This action cannot be undone."
      />
      <ConfirmDialog
        open={!!pendingDeleteCategory}
        onConfirm={() => {
          if (pendingDeleteCategory) deleteCategory(pendingDeleteCategory);
          setPendingDeleteCategory(null);
        }}
        onCancel={() => setPendingDeleteCategory(null)}
        title="Delete Category"
        description="Are you sure you want to delete this category and all its tags? This action cannot be undone."
      />
    </div>
  );
}

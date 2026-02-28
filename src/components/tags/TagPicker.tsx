/**
 * TagPicker - Multi-select tag picker organized by category
 */

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useTagStore } from "@/stores";
import { useMemo } from "react";
import { TagChip } from "./TagChip";

interface TagPickerProps {
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
  className?: string;
}

export function TagPicker({
  selectedTagIds,
  onToggleTag,
  className,
}: TagPickerProps) {
  const { tags, categories } = useTagStore();

  // Group tags by category
  const tagsByCategory = useMemo(() => {
    const grouped = new Map<string, typeof tags>();

    // Sort categories by order
    const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

    sortedCategories.forEach((category) => {
      const categoryTags = tags.filter((tag) => tag.categoryId === category.id);
      if (categoryTags.length > 0) {
        grouped.set(category.id, categoryTags);
      }
    });

    return grouped;
  }, [tags, categories]);

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  return (
    <ScrollArea className={cn("h-64 rounded-lg border p-3", className)}>
      <div className="space-y-4">
        {Array.from(tagsByCategory.entries()).map(
          ([categoryId, categoryTags], index) => {
            const category = getCategoryById(categoryId);
            if (!category) return null;

            return (
              <div key={categoryId}>
                {index > 0 && <Separator className="mb-4" />}
                <div className="mb-2">
                  <h4
                    className="text-sm font-medium"
                    style={{ color: category.color }}
                  >
                    {category.name}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categoryTags.map((tag) => (
                    <TagChip
                      key={tag.id}
                      tag={tag}
                      selected={selectedTagIds.includes(tag.id)}
                      onClick={() => onToggleTag(tag.id)}
                    />
                  ))}
                </div>
              </div>
            );
          },
        )}

        {tagsByCategory.size === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No tags available. Create some in Settings.
          </p>
        )}
      </div>
    </ScrollArea>
  );
}

/**
 * TagChip - Visual representation of a tag
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Tag } from "@/types";
import { X } from "lucide-react";

interface TagChipProps {
  tag: Tag;
  selected?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export function TagChip({
  tag,
  selected = false,
  removable = false,
  onRemove,
  onClick,
  size = "md",
}: TagChipProps) {
  const sizeClasses = {
    sm: "h-5 px-1.5 text-[10px]",
    md: "h-6 px-2 text-xs",
    lg: "h-7 px-3 text-sm",
  };

  return (
    <Badge
      variant={selected ? "default" : "secondary"}
      className={cn(
        "cursor-pointer transition-all gap-1",
        sizeClasses[size],
        selected && "ring-2 ring-offset-1 ring-primary"
      )}
      style={{
        backgroundColor: selected ? tag.color : tag.color + "20",
        color: selected ? "#fff" : tag.color,
        borderColor: tag.color + "50",
      }}
      onClick={onClick}
    >
      {tag.name}
      {removable && onRemove && (
        <X
          className="h-3 w-3 cursor-pointer hover:opacity-70"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        />
      )}
    </Badge>
  );
}

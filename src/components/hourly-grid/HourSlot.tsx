/**
 * HourSlot - Individual hour slot in the grid
 */

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTagStore } from "@/stores";
import type { Hour, LogEntry } from "@/types";
import { formatHour } from "@/types";

interface HourSlotProps {
  hour: Hour;
  isSelected: boolean;
  isInRange: boolean;
  log?: LogEntry;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  onClick: () => void;
}

export function HourSlot({
  hour,
  isSelected,
  isInRange,
  log,
  onMouseDown,
  onMouseEnter,
  onClick,
}: HourSlotProps) {
  const { getTagById } = useTagStore();
  const hasLog = !!log;
  const tags = log?.tagIds.map((id) => getTagById(id)).filter(Boolean) || [];

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "relative flex h-16 cursor-pointer select-none flex-col justify-between rounded-lg border p-2 transition-all",
              "hover:border-primary/50 hover:bg-accent/50",
              isSelected && "ring-2 ring-primary ring-offset-2",
              isInRange && !isSelected && "bg-primary/10 border-primary/30",
              hasLog && "bg-accent border-accent-foreground/20",
              !hasLog && "border-border bg-card",
            )}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            onClick={onClick}
          >
            <span className="text-xs font-medium text-muted-foreground">
              {formatHour(hour)}
            </span>

            {hasLog && tags.length > 0 && (
              <div className="flex flex-wrap gap-1 overflow-hidden">
                {tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag?.id}
                    variant="secondary"
                    className="h-5 px-1.5 text-[10px]"
                    style={{
                      backgroundColor: tag?.color + "30",
                      color: tag?.color,
                    }}
                  >
                    {tag?.name}
                  </Badge>
                ))}
                {tags.length > 2 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    +{tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </TooltipTrigger>

        {hasLog && (
          <TooltipContent side="right" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">{formatHour(hour)}</p>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge
                    key={tag?.id}
                    variant="secondary"
                    style={{
                      backgroundColor: tag?.color + "30",
                      color: tag?.color,
                    }}
                  >
                    {tag?.name}
                  </Badge>
                ))}
              </div>
              {log?.note && (
                <p className="text-sm text-muted-foreground">{log.note}</p>
              )}
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

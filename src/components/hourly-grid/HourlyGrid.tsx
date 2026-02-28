/**
 * HourlyGrid - 24-hour grid for logging entries
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore, useLogStore } from "@/stores";
import type { Hour, LogEntry, TimeRange } from "@/types";
import dayjs from "dayjs";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useState } from "react";
import { HourSlot } from "./HourSlot";

interface HourlyGridProps {
  onSelectRange: (range: TimeRange) => void;
  onEditLog: (log: LogEntry) => void;
}

const HOURS: Hour[] = Array.from({ length: 24 }, (_, i) => i as Hour);

export function HourlyGrid({ onSelectRange, onEditLog }: HourlyGridProps) {
  const { selectedDate, goToPreviousDay, goToNextDay, goToToday } =
    useAppStore();
  const { getLogsForDate } = useLogStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Hour | null>(null);
  const [dragEnd, setDragEnd] = useState<Hour | null>(null);

  const logs = getLogsForDate(selectedDate);
  const formattedDate = dayjs(selectedDate).format("dddd, MMMM D, YYYY");
  const isToday = dayjs(selectedDate).isSame(dayjs(), "day");

  // Find log for a specific hour
  const getLogForHour = useCallback(
    (hour: Hour): LogEntry | undefined => {
      return logs.find(
        (log) =>
          log.timeRange != null &&
          hour >= log.timeRange.startHour &&
          hour <= log.timeRange.endHour,
      );
    },
    [logs],
  );

  // Calculate selected range
  const getSelectedRange = useCallback((): TimeRange | null => {
    if (dragStart === null) return null;
    const end = dragEnd ?? dragStart;
    return {
      startHour: Math.min(dragStart, end) as Hour,
      endHour: Math.max(dragStart, end) as Hour,
    };
  }, [dragStart, dragEnd]);

  const selectedRange = getSelectedRange();

  const handleMouseDown = (hour: Hour) => {
    const existingLog = getLogForHour(hour);
    if (existingLog) {
      onEditLog(existingLog);
      return;
    }
    setIsDragging(true);
    setDragStart(hour);
    setDragEnd(hour);
  };

  const handleMouseEnter = (hour: Hour) => {
    if (isDragging) {
      setDragEnd(hour);
    }
  };

  const handleMouseUp = () => {
    if (isDragging && selectedRange) {
      onSelectRange(selectedRange);
    }
    setIsDragging(false);
  };

  const handleClick = (hour: Hour) => {
    const existingLog = getLogForHour(hour);
    if (existingLog) {
      onEditLog(existingLog);
    }
  };

  const isHourSelected = (hour: Hour): boolean => {
    return selectedRange !== null && hour === dragStart;
  };

  const isHourInRange = (hour: Hour): boolean => {
    if (!selectedRange) return false;
    return hour >= selectedRange.startHour && hour <= selectedRange.endHour;
  };

  return (
    <Card className="flex-1">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-lg font-semibold">
            {formattedDate}
          </CardTitle>
          <Button variant="outline" size="icon" onClick={goToNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {!isToday && (
          <Button variant="ghost" size="sm" onClick={goToToday}>
            <CalendarDays className="mr-2 h-4 w-4" />
            Today
          </Button>
        )}
      </CardHeader>

      <CardContent
        className="pb-6"
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (isDragging) {
            handleMouseUp();
          }
        }}
      >
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12">
          {HOURS.map((hour) => (
            <HourSlot
              key={hour}
              hour={hour}
              isSelected={isHourSelected(hour)}
              isInRange={isHourInRange(hour)}
              log={getLogForHour(hour)}
              onMouseDown={() => handleMouseDown(hour)}
              onMouseEnter={() => handleMouseEnter(hour)}
              onClick={() => handleClick(hour)}
            />
          ))}
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Click and drag to select a time range, or click a logged hour to edit
        </p>
      </CardContent>
    </Card>
  );
}

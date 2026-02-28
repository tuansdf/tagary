/**
 * useDayViewCalendar - Custom hook for DayView calendar logic
 */

import { useAppStore, useLogStore, useTagStore } from "@/stores";
import type { Hour, LogEntry, TimeRange } from "@/types";
import type {
  DateSelectArg,
  EventClickArg,
  EventInput,
} from "@fullcalendar/core";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";

interface UseDayViewCalendarReturn {
  // Modal state
  isModalOpen: boolean;
  selectedRange: TimeRange | null;
  editingLog: LogEntry | undefined;
  handleCloseModal: () => void;

  // Calendar handlers
  handleSelect: (selectInfo: DateSelectArg) => void;
  handleEventClick: (clickInfo: EventClickArg) => void;
  handleDatesSet: (arg: { start: Date; end: Date }) => void;

  // Calendar data
  events: EventInput[];
  selectedDate: string;
}

export function useDayViewCalendar(): UseDayViewCalendarReturn {
  const { selectedDate, setSelectedDate } = useAppStore();
  const logs = useLogStore((state) => state.logs);
  const { getTagById } = useTagStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<TimeRange | null>(null);
  const [editingLog, setEditingLog] = useState<LogEntry | undefined>();
  const [visibleRange, setVisibleRange] = useState<{
    start: string;
    end: string;
  }>({
    start: selectedDate,
    end: selectedDate,
  });

  // Filter logs for the visible date range
  const visibleLogs = useMemo(() => {
    return logs.filter(
      (log) => log.date >= visibleRange.start && log.date <= visibleRange.end,
    );
  }, [logs, visibleRange]);

  // Convert logs to FullCalendar events
  const events: EventInput[] = useMemo(() => {
    return visibleLogs
      .filter((log) => log.timeRange != null)
      .map((log) => {
        const tags = log.tagIds.map((id) => getTagById(id)).filter(Boolean);
        const primaryTag = tags[0];
        const tagNames = tags.map((t) => t?.name).join(", ");

        return {
          id: log.id,
          title: tagNames || "Logged",
          start: `${log.date}T${String(log.timeRange!.startHour).padStart(2, "0")}:00:00`,
          end: `${log.date}T${String(log.timeRange!.endHour + 1).padStart(2, "0")}:00:00`,
          backgroundColor: primaryTag?.color || "#3b82f6",
          borderColor: primaryTag?.color || "#3b82f6",
          extendedProps: { log },
        };
      });
  }, [visibleLogs, getTagById]);

  // Handle time slot selection (drag to create)
  const handleSelect = useCallback(
    (selectInfo: DateSelectArg) => {
      const startHour = dayjs(selectInfo.start).hour() as Hour;
      const endHour = (dayjs(selectInfo.end).hour() - 1) as Hour;

      // Update selected date if different
      const clickedDate = dayjs(selectInfo.start).format("YYYY-MM-DD");
      if (clickedDate !== selectedDate) {
        setSelectedDate(clickedDate);
      }

      setSelectedRange({
        startHour: Math.max(0, startHour) as Hour,
        endHour: Math.max(startHour, endHour) as Hour,
      });
      setEditingLog(undefined);
      setIsModalOpen(true);

      // Clear selection
      selectInfo.view.calendar.unselect();
    },
    [selectedDate, setSelectedDate],
  );

  // Handle clicking on an existing event
  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const log = clickInfo.event.extendedProps.log as LogEntry;
    setSelectedRange(null);
    setEditingLog(log);
    setIsModalOpen(true);
  }, []);

  // Handle date/view navigation
  const handleDatesSet = useCallback(
    (arg: { start: Date; end: Date }) => {
      const newStartDate = dayjs(arg.start).format("YYYY-MM-DD");
      const newEndDate = dayjs(arg.end).subtract(1, "day").format("YYYY-MM-DD");
      setVisibleRange({ start: newStartDate, end: newEndDate });

      if (newStartDate !== selectedDate) {
        setSelectedDate(newStartDate);
      }
    },
    [selectedDate, setSelectedDate],
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedRange(null);
    setEditingLog(undefined);
  }, []);

  return {
    isModalOpen,
    selectedRange,
    editingLog,
    handleCloseModal,
    handleSelect,
    handleEventClick,
    handleDatesSet,
    events,
    selectedDate,
  };
}

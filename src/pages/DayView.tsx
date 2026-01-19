/**
 * DayView - Daily logging page using FullCalendar timeGrid
 */

import { LogEntryModal } from "@/components/log-entry";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore, useLogStore, useTagStore } from "@/stores";
import type { Hour, LogEntry, TimeRange } from "@/types";
import type {
  DateSelectArg,
  EventClickArg,
  EventInput,
} from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayjs from "dayjs";
import { useMemo, useRef, useState } from "react";

export function DayView() {
  const calendarRef = useRef<FullCalendar>(null);
  const { selectedDate, setSelectedDate } = useAppStore();
  // Subscribe to logs array directly to trigger re-render on hydration
  const logs = useLogStore((state) => state.logs);
  const { getTagById } = useTagStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<TimeRange | null>(null);
  const [editingLog, setEditingLog] = useState<LogEntry | undefined>();
  // Track visible date range for week view
  const [visibleRange, setVisibleRange] = useState<{
    start: string;
    end: string;
  }>({
    start: selectedDate,
    end: selectedDate,
  });

  // Filter logs for the visible date range (works for both day and week views)
  const visibleLogs = useMemo(() => {
    return logs.filter(
      (log) => log.date >= visibleRange.start && log.date <= visibleRange.end,
    );
  }, [logs, visibleRange]);

  // Convert logs to FullCalendar events
  const events: EventInput[] = useMemo(() => {
    return visibleLogs.map((log) => {
      const tags = log.tagIds.map((id) => getTagById(id)).filter(Boolean);
      const primaryTag = tags[0];
      const tagNames = tags.map((t) => t?.name).join(", ");

      return {
        id: log.id,
        title: tagNames || "Logged",
        start: `${log.date}T${String(log.timeRange.startHour).padStart(2, "0")}:00:00`,
        end: `${log.date}T${String(log.timeRange.endHour + 1).padStart(2, "0")}:00:00`,
        backgroundColor: primaryTag?.color || "#3b82f6",
        borderColor: primaryTag?.color || "#3b82f6",
        extendedProps: { log },
      };
    });
  }, [visibleLogs, getTagById]);

  // Handle time slot selection (drag to create)
  const handleSelect = (selectInfo: DateSelectArg) => {
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
  };

  // Handle clicking on an existing event
  const handleEventClick = (clickInfo: EventClickArg) => {
    const log = clickInfo.event.extendedProps.log as LogEntry;
    setSelectedRange(null);
    setEditingLog(log);
    setIsModalOpen(true);
  };

  // Handle date/view navigation - track visible range for proper filtering
  const handleDatesSet = (arg: { start: Date; end: Date }) => {
    const newStartDate = dayjs(arg.start).format("YYYY-MM-DD");
    // end is exclusive in FullCalendar, so subtract 1 day
    const newEndDate = dayjs(arg.end).subtract(1, "day").format("YYYY-MM-DD");
    setVisibleRange({ start: newStartDate, end: newEndDate });

    // Update selected date to the start of the visible range
    if (newStartDate !== selectedDate) {
      setSelectedDate(newStartDate);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRange(null);
    setEditingLog(undefined);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Log</h1>
          <p className="text-muted-foreground">
            Track your day hour by hour with tags
          </p>
        </div>
      </div>

      <Card className="flex-1 py-4 md:py-6">
        <CardContent className="px-4 md:px-6">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridDay"
            initialDate={selectedDate}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "timeGridDay,timeGridWeek",
            }}
            titleFormat={{ day: "2-digit", month: "2-digit", year: "numeric" }}
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            slotDuration="01:00:00"
            slotLabelInterval="01:00:00"
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
            allDaySlot={false}
            selectable={true}
            selectMirror={true}
            select={handleSelect}
            events={events}
            eventClick={handleEventClick}
            datesSet={handleDatesSet}
            height="auto"
            expandRows={true}
            nowIndicator={true}
            dayHeaderFormat={{
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
            }}
            eventDisplay="block"
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
          />
        </CardContent>
      </Card>

      <LogEntryModal
        open={isModalOpen}
        onClose={handleCloseModal}
        timeRange={selectedRange}
        existingLog={editingLog}
      />
    </div>
  );
}

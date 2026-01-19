/**
 * CalendarView - Monthly calendar overview with FullCalendar
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore, useLogStore } from "@/stores";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import dayjs from "dayjs";
import { useMemo } from "react";

export function CalendarView() {
  const { logs } = useLogStore();
  const { setSelectedDate, setCurrentView } = useAppStore();

  // Convert logs to calendar events
  const events = useMemo(() => {
    // Group logs by date
    const logsByDate = new Map<string, number>();
    logs.forEach((log) => {
      const count = logsByDate.get(log.date) || 0;
      const hours = log.timeRange.endHour - log.timeRange.startHour + 1;
      logsByDate.set(log.date, count + hours);
    });

    return Array.from(logsByDate.entries()).map(([date, hours]) => ({
      title: `${hours}h logged`,
      date,
      backgroundColor: hours >= 8 ? "#22c55e" : hours >= 4 ? "#eab308" : "#94a3b8",
      borderColor: "transparent",
    }));
  }, [logs]);

  const handleDateClick = (info: { dateStr: string }) => {
    setSelectedDate(info.dateStr);
    setCurrentView("day");
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            View your logged days at a glance
          </p>
        </div>
      </div>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            dateClick={handleDateClick}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "",
            }}
            height="auto"
            dayMaxEvents={2}
            eventDisplay="block"
            initialDate={dayjs().format("YYYY-MM-DD")}
          />
        </CardContent>
      </Card>
    </div>
  );
}

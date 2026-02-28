/**
 * CalendarView - Monthly calendar overview with FullCalendar
 */

import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore, useLogStore } from "@/stores";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import dayjs from "dayjs";
import { useMemo } from "react";
import { useNavigate } from "react-router";

export function CalendarView() {
  const { logs } = useLogStore();
  const { setSelectedDate } = useAppStore();
  const navigate = useNavigate();

  // Convert logs to calendar events
  const events = useMemo(() => {
    const logsByDate = new Map<string, number>();
    logs.forEach((log) => {
      const count = logsByDate.get(log.date) || 0;
      const hours = log.timeRange
        ? log.timeRange.endHour - log.timeRange.startHour + 1
        : 1;
      logsByDate.set(log.date, count + hours);
    });

    return Array.from(logsByDate.entries()).map(([date, hours]) => ({
      title: `${hours}h logged`,
      date,
      backgroundColor:
        hours >= 8 ? "#22c55e" : hours >= 4 ? "#eab308" : "#94a3b8",
      borderColor: "transparent",
    }));
  }, [logs]);

  const handleDateClick = (info: { dateStr: string }) => {
    setSelectedDate(info.dateStr);
    navigate("/");
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <PageHeader
        title="Calendar"
        description="View your logged days at a glance"
      />

      <Card className="flex-1 py-4 md:py-6 gap-3 md:gap-6">
        <CardHeader className="px-3 md:px-6">
          <CardTitle>Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent className="px-2 md:px-6 md:py-0">
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

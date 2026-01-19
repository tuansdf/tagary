/**
 * DayView - Daily logging page using FullCalendar timeGrid
 */

import { LogEntryModal } from "@/components/log-entry";
import { PageHeader } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { useDayViewCalendar } from "@/hooks";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useRef } from "react";

export function DayView() {
  const calendarRef = useRef<FullCalendar>(null);
  const {
    isModalOpen,
    selectedRange,
    editingLog,
    handleCloseModal,
    handleSelect,
    handleEventClick,
    handleDatesSet,
    events,
    selectedDate,
  } = useDayViewCalendar();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <PageHeader
        title="Daily Log"
        description="Track your day hour by hour with tags"
      />

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

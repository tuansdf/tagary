/**
 * DayView - Main daily logging page
 */

import { HourlyGrid } from "@/components/hourly-grid";
import { LogEntryModal } from "@/components/log-entry";
import type { LogEntry, TimeRange } from "@/types";
import { useState } from "react";

export function DayView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<TimeRange | null>(null);
  const [editingLog, setEditingLog] = useState<LogEntry | undefined>();

  const handleSelectRange = (range: TimeRange) => {
    setSelectedRange(range);
    setEditingLog(undefined);
    setIsModalOpen(true);
  };

  const handleEditLog = (log: LogEntry) => {
    setSelectedRange(null);
    setEditingLog(log);
    setIsModalOpen(true);
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

      <HourlyGrid
        onSelectRange={handleSelectRange}
        onEditLog={handleEditLog}
      />

      <LogEntryModal
        open={isModalOpen}
        onClose={handleCloseModal}
        timeRange={selectedRange}
        existingLog={editingLog}
      />
    </div>
  );
}

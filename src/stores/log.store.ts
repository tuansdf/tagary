/**
 * Log Store - Zustand store for log entry management
 */

import type { DaySummary, Hour, LogEntry, TimeRange } from "@/types";
import { rangesOverlap } from "@/types";
import dayjs from "dayjs";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LogState {
  logs: LogEntry[];
}

interface LogActions {
  // Log CRUD
  addLog: (log: Omit<LogEntry, "id" | "createdAt" | "updatedAt">) => LogEntry;
  updateLog: (
    id: string,
    updates: Partial<Omit<LogEntry, "id" | "createdAt">>,
  ) => void;
  deleteLog: (id: string) => void;

  // Queries
  getLogsForDate: (date: string) => LogEntry[];
  getLogsForDateRange: (startDate: string, endDate: string) => LogEntry[];
  getLoggedHoursForDate: (date: string) => Hour[];
  getDaySummary: (date: string) => DaySummary;
  getLogsByCharacter: (characterId: string) => LogEntry[];
  getLogsByLocation: (locationId: string) => LogEntry[];
  getLogsForMonth: (year: number, month: number) => LogEntry[];

  // Conflict handling
  getConflictingLogs: (
    date: string,
    timeRange: TimeRange,
    excludeId?: string,
  ) => LogEntry[];
  removeConflictingLogs: (
    date: string,
    timeRange: TimeRange,
    excludeId?: string,
  ) => void;
}

const generateId = () => crypto.randomUUID();

export const useLogStore = create<LogState & LogActions>()(
  persist(
    (set, get) => ({
      logs: [],

      addLog: (logData) => {
        const now = new Date().toISOString();
        const newLog: LogEntry = {
          ...logData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ logs: [...state.logs, newLog] }));
        return newLog;
      },

      updateLog: (id, updates) => {
        set((state) => ({
          logs: state.logs.map((log) =>
            log.id === id
              ? { ...log, ...updates, updatedAt: new Date().toISOString() }
              : log,
          ),
        }));
      },

      deleteLog: (id) => {
        set((state) => ({ logs: state.logs.filter((log) => log.id !== id) }));
      },

      getLogsForDate: (date) => {
        const targetDate = dayjs(date).format("YYYY-MM-DD");
        return get().logs.filter((log) => log.date === targetDate);
      },

      getLogsForDateRange: (startDate, endDate) => {
        const start = dayjs(startDate);
        const end = dayjs(endDate);
        return get().logs.filter((log) => {
          const logDate = dayjs(log.date);
          return (
            logDate.isAfter(start.subtract(1, "day")) &&
            logDate.isBefore(end.add(1, "day"))
          );
        });
      },

      getLoggedHoursForDate: (date) => {
        const logs = get().getLogsForDate(date);
        const hours = new Set<Hour>();
        logs.forEach((log) => {
          if (log.timeRange) {
            for (
              let h = log.timeRange.startHour;
              h <= log.timeRange.endHour;
              h++
            ) {
              hours.add(h as Hour);
            }
          }
        });
        return Array.from(hours).sort((a, b) => a - b);
      },

      getDaySummary: (date) => {
        const entries = get().getLogsForDate(date);
        const loggedHours = get().getLoggedHoursForDate(date);

        // Count tag occurrences
        const tagCounts: Record<string, number> = {};
        entries.forEach((entry) => {
          entry.tagIds.forEach((tagId) => {
            tagCounts[tagId] = (tagCounts[tagId] || 0) + 1;
          });
        });

        const topTags = Object.entries(tagCounts)
          .map(([tagId, count]) => ({ tagId, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        return {
          date,
          totalLoggedHours: loggedHours.length,
          entries,
          topTags,
        };
      },

      getLogsByCharacter: (characterId) => {
        return get().logs.filter(
          (log) => log.characterIds && log.characterIds.includes(characterId),
        );
      },

      getLogsByLocation: (locationId) => {
        return get().logs.filter((log) => log.locationId === locationId);
      },

      getLogsForMonth: (year, month) => {
        return get().logs.filter((log) => {
          const d = dayjs(log.date);
          return d.year() === year && d.month() === month;
        });
      },

      getConflictingLogs: (date, timeRange, excludeId) => {
        return get()
          .getLogsForDate(date)
          .filter(
            (log) =>
              log.id !== excludeId &&
              log.timeRange != null &&
              rangesOverlap(log.timeRange, timeRange),
          );
      },

      removeConflictingLogs: (date, timeRange, excludeId) => {
        const conflicting = get().getConflictingLogs(
          date,
          timeRange,
          excludeId,
        );
        conflicting.forEach((log) => get().deleteLog(log.id));
      },
    }),
    {
      name: "tagary:log-store",
    },
  ),
);

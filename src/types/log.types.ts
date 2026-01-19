/**
 * Log Entry Types for Tagary
 */

import type { Tag } from "./tag.types";

/** Represents a single hour in the day (0-23) */
export type Hour = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23;

/** A time range covering one or more hours */
export interface TimeRange {
  startHour: Hour;
  endHour: Hour;
}

/** A log entry for a specific time range on a specific day */
export interface LogEntry {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  timeRange: TimeRange;
  tagIds: string[];
  note?: string;
  createdAt: string;
  updatedAt: string;
}

/** Log entry with resolved tag data for display */
export interface LogEntryWithTags extends Omit<LogEntry, "tagIds"> {
  tags: Tag[];
}

/** Summary of a single day's logs */
export interface DaySummary {
  date: string;
  totalLoggedHours: number;
  entries: LogEntry[];
  topTags: { tagId: string; count: number }[];
}

/** Helper to format hour for display */
export function formatHour(hour: Hour): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

/** Helper to get hours array from time range */
export function getHoursFromRange(range: TimeRange): Hour[] {
  const hours: Hour[] = [];
  for (let h = range.startHour; h <= range.endHour; h++) {
    hours.push(h as Hour);
  }
  return hours;
}

/** Check if two time ranges overlap */
export function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  return a.startHour <= b.endHour && b.startHour <= a.endHour;
}

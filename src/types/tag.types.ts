/**
 * Tag System Types for Tagary
 */

/** A single tag that can be applied to log entries */
export interface Tag {
  id: string;
  name: string;
  categoryId: string;
  color: string;
  icon?: string;
  createdAt: string;
  usageCount: number;
}

/** A category that groups related tags */
export interface TagCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
}

/** Default tag categories for new users */
export const DEFAULT_CATEGORIES: Omit<TagCategory, "id">[] = [
  { name: "Mood", icon: "smile", color: "#f59e0b", order: 0 },
  { name: "Activity", icon: "activity", color: "#3b82f6", order: 1 },
  { name: "People", icon: "users", color: "#8b5cf6", order: 2 },
  { name: "Location", icon: "map-pin", color: "#10b981", order: 3 },
  { name: "Health", icon: "heart", color: "#ef4444", order: 4 },
];

/** Default tags for each category */
export const DEFAULT_TAGS: Record<string, Omit<Tag, "id" | "categoryId" | "createdAt" | "usageCount">[]> = {
  Mood: [
    { name: "Happy", color: "#fcd34d", icon: "smile" },
    { name: "Anxious", color: "#fbbf24", icon: "frown" },
    { name: "Relaxed", color: "#a3e635", icon: "coffee" },
    { name: "Motivated", color: "#4ade80", icon: "zap" },
    { name: "Tired", color: "#94a3b8", icon: "moon" },
  ],
  Activity: [
    { name: "Work", color: "#60a5fa", icon: "briefcase" },
    { name: "Exercise", color: "#34d399", icon: "dumbbell" },
    { name: "Reading", color: "#a78bfa", icon: "book-open" },
    { name: "Socializing", color: "#f472b6", icon: "message-circle" },
    { name: "Gaming", color: "#fb923c", icon: "gamepad-2" },
  ],
  People: [
    { name: "Family", color: "#c084fc", icon: "home" },
    { name: "Friends", color: "#818cf8", icon: "users" },
    { name: "Colleagues", color: "#22d3ee", icon: "building" },
    { name: "Alone", color: "#cbd5e1", icon: "user" },
  ],
  Location: [
    { name: "Home", color: "#4ade80", icon: "home" },
    { name: "Office", color: "#60a5fa", icon: "building-2" },
    { name: "Gym", color: "#f472b6", icon: "dumbbell" },
    { name: "Outdoors", color: "#34d399", icon: "sun" },
    { name: "Commute", color: "#fbbf24", icon: "car" },
  ],
  Health: [
    { name: "Energized", color: "#4ade80", icon: "battery-full" },
    { name: "Hydrated", color: "#38bdf8", icon: "droplet" },
    { name: "Well-rested", color: "#a78bfa", icon: "bed" },
    { name: "Stressed", color: "#f87171", icon: "alert-triangle" },
  ],
};

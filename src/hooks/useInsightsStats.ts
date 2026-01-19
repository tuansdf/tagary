/**
 * useInsightsStats - Custom hook for insights analytics calculations
 */

import { useLogStore, useTagStore } from "@/stores";
import type { Tag, TagCategory } from "@/types";
import dayjs from "dayjs";
import { useMemo } from "react";

interface TagStat {
  tag: Tag;
  count: number;
}

interface CategoryStat {
  category: TagCategory;
  count: number;
}

interface InsightsStats {
  totalHoursLast7Days: number;
  totalHoursLast30Days: number;
  uniqueDaysLast7: number;
  uniqueDaysLast30: number;
  topTags: TagStat[];
  categoryStats: CategoryStat[];
  avgHoursPerDay: string;
  uniqueTagsUsed: number;
  totalTagsAvailable: number;
}

export function useInsightsStats(): InsightsStats {
  const { logs } = useLogStore();
  const { tags, getTagById, getCategoryById } = useTagStore();

  return useMemo(() => {
    const today = dayjs();
    const last7Days = logs.filter((log) =>
      dayjs(log.date).isAfter(today.subtract(7, "day"))
    );
    const last30Days = logs.filter((log) =>
      dayjs(log.date).isAfter(today.subtract(30, "day"))
    );

    // Total hours logged
    const totalHoursLast7Days = last7Days.reduce(
      (acc, log) => acc + (log.timeRange.endHour - log.timeRange.startHour + 1),
      0
    );
    const totalHoursLast30Days = last30Days.reduce(
      (acc, log) => acc + (log.timeRange.endHour - log.timeRange.startHour + 1),
      0
    );

    // Days logged
    const uniqueDaysLast7 = new Set(last7Days.map((l) => l.date)).size;
    const uniqueDaysLast30 = new Set(last30Days.map((l) => l.date)).size;

    // Most used tags
    const tagCounts: Record<string, number> = {};
    last30Days.forEach((log) => {
      log.tagIds.forEach((tagId) => {
        tagCounts[tagId] = (tagCounts[tagId] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tagId, count]) => {
        const tag = getTagById(tagId);
        return tag ? { tag, count } : null;
      })
      .filter((t): t is TagStat => t !== null);

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    topTags.forEach(({ tag, count }) => {
      const categoryId = tag.categoryId;
      categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + count;
    });

    const categoryStats = Object.entries(categoryCounts)
      .map(([categoryId, count]) => {
        const category = getCategoryById(categoryId);
        return category ? { category, count } : null;
      })
      .filter((c): c is CategoryStat => c !== null)
      .sort((a, b) => b.count - a.count);

    const uniqueTagsUsed = new Set(logs.flatMap((l) => l.tagIds)).size;

    return {
      totalHoursLast7Days,
      totalHoursLast30Days,
      uniqueDaysLast7,
      uniqueDaysLast30,
      topTags,
      categoryStats,
      avgHoursPerDay:
        uniqueDaysLast30 > 0
          ? (totalHoursLast30Days / uniqueDaysLast30).toFixed(1)
          : "0",
      uniqueTagsUsed,
      totalTagsAvailable: tags.length,
    };
  }, [logs, tags, getTagById, getCategoryById]);
}

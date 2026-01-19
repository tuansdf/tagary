/**
 * InsightsView - Analytics and trends page
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLogStore, useTagStore } from "@/stores";
import dayjs from "dayjs";
import { Calendar, Clock, Tags, TrendingUp } from "lucide-react";
import { useMemo } from "react";

export function InsightsView() {
  const { logs } = useLogStore();
  const { tags, getTagById, getCategoryById } = useTagStore();

  // Calculate stats
  const stats = useMemo(() => {
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
      .map(([tagId, count]) => ({ tag: getTagById(tagId), count }))
      .filter((t) => t.tag);

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    topTags.forEach(({ tag, count }) => {
      if (tag) {
        const categoryId = tag.categoryId;
        categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + count;
      }
    });
    const categoryStats = Object.entries(categoryCounts)
      .map(([categoryId, count]) => ({
        category: getCategoryById(categoryId),
        count,
      }))
      .filter((c) => c.category)
      .sort((a, b) => b.count - a.count);

    return {
      totalHoursLast7Days,
      totalHoursLast30Days,
      uniqueDaysLast7,
      uniqueDaysLast30,
      topTags,
      categoryStats,
      avgHoursPerDay: uniqueDaysLast30 > 0 ? (totalHoursLast30Days / uniqueDaysLast30).toFixed(1) : 0,
    };
  }, [logs, getTagById, getCategoryById]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
          <p className="text-muted-foreground">
            Understand your patterns and habits
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours (7 days)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHoursLast7Days}h</div>
            <p className="text-xs text-muted-foreground">
              {stats.uniqueDaysLast7} days logged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours (30 days)</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHoursLast30Days}h</div>
            <p className="text-xs text-muted-foreground">
              {stats.uniqueDaysLast30} days logged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Day</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgHoursPerDay}h</div>
            <p className="text-xs text-muted-foreground">last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags Used</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(logs.flatMap((l) => l.tagIds)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              of {tags.length} available
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Top Tags (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topTags.length > 0 ? (
              <div className="space-y-3">
                {stats.topTags.map(({ tag, count }) => (
                  <div key={tag?.id} className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: tag?.color + "20",
                        color: tag?.color,
                      }}
                    >
                      {tag?.name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {count} times
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No data yet. Start logging to see insights!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.categoryStats.length > 0 ? (
              <div className="space-y-3">
                {stats.categoryStats.map(({ category, count }) => (
                  <div key={category?.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm font-medium"
                        style={{ color: category?.color }}
                      >
                        {category?.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {count} uses
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(count / stats.categoryStats[0].count) * 100}%`,
                          backgroundColor: category?.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No data yet. Start logging to see category breakdown!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

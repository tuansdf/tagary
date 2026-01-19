/**
 * InsightsView - Analytics and trends page
 */

import { PageHeader, StatCard } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInsightsStats } from "@/hooks";
import { Calendar, Clock, Tags, TrendingUp } from "lucide-react";

export function InsightsView() {
  const stats = useInsightsStats();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <PageHeader
        title="Insights"
        description="Understand your patterns and habits"
      />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Hours (7 days)"
          value={`${stats.totalHoursLast7Days}h`}
          subtitle={`${stats.uniqueDaysLast7} days logged`}
          icon={Clock}
        />
        <StatCard
          title="Hours (30 days)"
          value={`${stats.totalHoursLast30Days}h`}
          subtitle={`${stats.uniqueDaysLast30} days logged`}
          icon={Calendar}
        />
        <StatCard
          title="Avg per Day"
          value={`${stats.avgHoursPerDay}h`}
          subtitle="last 30 days"
          icon={TrendingUp}
        />
        <StatCard
          title="Tags Used"
          value={stats.uniqueTagsUsed}
          subtitle={`of ${stats.totalTagsAvailable} available`}
          icon={Tags}
        />
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
                  <div key={tag.id} className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: tag.color + "20",
                        color: tag.color,
                      }}
                    >
                      {tag.name}
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
                  <div key={category.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm font-medium"
                        style={{ color: category.color }}
                      >
                        {category.name}
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
                          backgroundColor: category.color,
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

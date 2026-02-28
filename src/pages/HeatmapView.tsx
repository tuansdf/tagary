import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore, useLocationStore, useLogStore } from "@/stores";
import dayjs from "dayjs";
import { MapPin } from "lucide-react";
import { useMemo, useState } from "react";

const MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

export function HeatmapView() {
  const { logs } = useLogStore();
  const { locations } = useLocationStore();
  const { setSelectedDate, setCurrentView } = useAppStore();
  const [activeTab, setActiveTab] = useState<"calendar" | "location">(
    "calendar",
  );

  const now = dayjs();
  const [viewYear, setViewYear] = useState(now.year());

  // Calendar heatmap data
  const calendarData = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach((log) => {
      counts[log.date] = (counts[log.date] || 0) + 1;
    });
    return counts;
  }, [logs]);

  // Location frequency data
  const locationData = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach((log) => {
      if (log.locationId) {
        counts[log.locationId] = (counts[log.locationId] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([id, count]) => {
        const loc = locations.find((l) => l.id === id);
        return {
          id,
          name: loc?.name || "Unknown",
          color: loc?.color || "#888",
          count,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [logs, locations]);

  const maxLocationCount = locationData.length > 0 ? locationData[0].count : 1;

  // Generate calendar grid for a month
  const renderMonth = (month: number) => {
    const firstDay = dayjs(
      `${viewYear}-${String(month + 1).padStart(2, "0")}-01`,
    );
    const daysInMonth = firstDay.daysInMonth();
    const startDayOfWeek = firstDay.day(); // 0=Sun

    const cells = [];
    // Empty cells before first day
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push(<div key={`empty-${i}`} className="h-4 w-4" />);
    }
    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = firstDay.date(d).format("YYYY-MM-DD");
      const count = calendarData[dateStr] || 0;
      const intensity =
        count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4;

      cells.push(
        <button
          key={d}
          type="button"
          title={`${dateStr}: ${count} sự kiện`}
          className="h-4 w-4 rounded-sm transition-colors hover:ring-1 hover:ring-primary"
          style={{
            backgroundColor:
              intensity === 0
                ? "var(--secondary)"
                : intensity === 1
                  ? "oklch(0.7 0.12 145)"
                  : intensity === 2
                    ? "oklch(0.6 0.16 145)"
                    : intensity === 3
                      ? "oklch(0.5 0.2 145)"
                      : "oklch(0.4 0.22 145)",
          }}
          onClick={() => {
            setSelectedDate(dateStr);
            setCurrentView("day");
          }}
        />,
      );
    }

    return (
      <div key={month}>
        <p className="text-xs text-muted-foreground mb-1">{MONTHS[month]}</p>
        <div className="grid grid-cols-7 gap-0.75">{cells}</div>
      </div>
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <PageHeader
        title="Heatmap"
        description="Trực quan hóa hoạt động theo thời gian & địa điểm"
      />

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg bg-secondary p-1 w-fit">
        <button
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === "calendar"
              ? "bg-background shadow-sm"
              : "hover:bg-background/50"
          }`}
          onClick={() => setActiveTab("calendar")}
        >
          📅 Theo thời gian
        </button>
        <button
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === "location"
              ? "bg-background shadow-sm"
              : "hover:bg-background/50"
          }`}
          onClick={() => setActiveTab("location")}
        >
          📍 Theo địa điểm
        </button>
      </div>

      {activeTab === "calendar" ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Năm {viewYear}</CardTitle>
            <div className="flex gap-1">
              <button
                className="px-2 py-1 text-xs rounded hover:bg-accent"
                onClick={() => setViewYear((y) => y - 1)}
              >
                ← {viewYear - 1}
              </button>
              <button
                className="px-2 py-1 text-xs rounded hover:bg-accent"
                onClick={() => setViewYear((y) => y + 1)}
              >
                {viewYear + 1} →
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 12 }, (_, i) => renderMonth(i))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <span>Ít</span>
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-3 w-3 rounded-sm"
                  style={{
                    backgroundColor:
                      i === 0
                        ? "var(--secondary)"
                        : i === 1
                          ? "oklch(0.7 0.12 145)"
                          : i === 2
                            ? "oklch(0.6 0.16 145)"
                            : i === 3
                              ? "oklch(0.5 0.2 145)"
                              : "oklch(0.4 0.22 145)",
                  }}
                />
              ))}
              <span>Nhiều</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tần suất theo địa điểm</CardTitle>
          </CardHeader>
          <CardContent>
            {locationData.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <MapPin className="mx-auto mb-2 h-8 w-8" />
                <p>Chưa có dữ liệu địa điểm.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {locationData.map(({ id, name, color, count }) => (
                  <div key={id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <MapPin className="h-3.5 w-3.5" style={{ color }} />
                        {name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {count} lần
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(count / maxLocationCount) * 100}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

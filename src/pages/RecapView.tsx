import { CharacterChip } from "@/components/characters";
import { PageHeader, StatCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCharacterStore, useLocationStore, useLogStore } from "@/stores";
import { EMOTION_OPTIONS } from "@/types";
import dayjs from "dayjs";
import { Calendar, MapPin, Smile, Users } from "lucide-react";
import { useMemo, useState } from "react";

type RecapRange = "7d" | "30d" | "all";

export function RecapView() {
  const { logs } = useLogStore();
  const { characters } = useCharacterStore();
  const { locations } = useLocationStore();
  const [range, setRange] = useState<RecapRange>("30d");

  const filteredLogs = useMemo(() => {
    if (range === "all") return logs;
    const days = range === "7d" ? 7 : 30;
    const cutoff = dayjs().subtract(days, "day").format("YYYY-MM-DD");
    return logs.filter((log) => log.date >= cutoff);
  }, [logs, range]);

  // Stats by character
  const characterStats = useMemo(() => {
    return characters
      .map((char) => {
        const charLogs = filteredLogs.filter((log) =>
          log.characterIds?.includes(char.id),
        );
        const avgEmotion =
          charLogs.filter((l) => l.emotionScore).length > 0
            ? charLogs
                .filter((l) => l.emotionScore)
                .reduce((acc, l) => acc + (l.emotionScore || 0), 0) /
              charLogs.filter((l) => l.emotionScore).length
            : undefined;

        return {
          character: char,
          totalLogs: charLogs.length,
          avgEmotion,
          recentDate:
            charLogs.length > 0
              ? charLogs.sort((a, b) => dayjs(b.date).diff(dayjs(a.date)))[0]
                  .date
              : undefined,
        };
      })
      .filter((s) => s.totalLogs > 0)
      .sort((a, b) => b.totalLogs - a.totalLogs);
  }, [characters, filteredLogs]);

  // Stats by location
  const locationStats = useMemo(() => {
    const counts: Record<string, { count: number; emotions: number[] }> = {};
    filteredLogs.forEach((log) => {
      if (log.locationId) {
        if (!counts[log.locationId]) {
          counts[log.locationId] = { count: 0, emotions: [] };
        }
        counts[log.locationId].count++;
        if (log.emotionScore) {
          counts[log.locationId].emotions.push(log.emotionScore);
        }
      }
    });

    return Object.entries(counts)
      .map(([id, data]) => {
        const loc = locations.find((l) => l.id === id);
        const avgEmotion =
          data.emotions.length > 0
            ? data.emotions.reduce((a, b) => a + b, 0) / data.emotions.length
            : undefined;
        return {
          id,
          name: loc?.name || "Unknown",
          color: loc?.color || "#888",
          count: data.count,
          avgEmotion,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [filteredLogs, locations]);

  // Overall stats
  const overallStats = useMemo(() => {
    const uniqueDays = new Set(filteredLogs.map((l) => l.date)).size;
    const avgEmotion =
      filteredLogs.filter((l) => l.emotionScore).length > 0
        ? filteredLogs
            .filter((l) => l.emotionScore)
            .reduce((acc, l) => acc + (l.emotionScore || 0), 0) /
          filteredLogs.filter((l) => l.emotionScore).length
        : undefined;

    return {
      totalLogs: filteredLogs.length,
      uniqueDays,
      uniqueCharacters: characterStats.length,
      uniqueLocations: locationStats.length,
      avgEmotion,
    };
  }, [filteredLogs, characterStats, locationStats]);

  const getEmotionDisplay = (score?: number) => {
    if (!score) return "—";
    const option = EMOTION_OPTIONS.find((o) => o.score === Math.round(score));
    return option ? `${option.emoji} ${score.toFixed(1)}` : score.toFixed(1);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Recap" description="Tổng hợp nhật ký của bạn" />
        <div className="flex gap-1 rounded-lg bg-secondary p-1">
          {(["7d", "30d", "all"] as RecapRange[]).map((r) => (
            <Button
              key={r}
              variant="ghost"
              size="sm"
              className={`text-xs ${range === r ? "bg-background shadow-sm" : ""}`}
              onClick={() => setRange(r)}
            >
              {r === "7d" ? "7 ngày" : r === "30d" ? "30 ngày" : "Tất cả"}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng sự kiện"
          value={overallStats.totalLogs}
          subtitle={`${overallStats.uniqueDays} ngày`}
          icon={Calendar}
        />
        <StatCard
          title="Nhân vật"
          value={overallStats.uniqueCharacters}
          subtitle="xuất hiện"
          icon={Users}
        />
        <StatCard
          title="Địa điểm"
          value={overallStats.uniqueLocations}
          subtitle="đã đến"
          icon={MapPin}
        />
        <StatCard
          title="Cảm xúc TB"
          value={getEmotionDisplay(overallStats.avgEmotion)}
          subtitle="trung bình"
          icon={Smile}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* By Character */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Theo nhân vật</CardTitle>
          </CardHeader>
          <CardContent>
            {characterStats.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">
                Chưa có dữ liệu nhân vật
              </p>
            ) : (
              <div className="space-y-3">
                {characterStats
                  .slice(0, 8)
                  .map(({ character, totalLogs, avgEmotion, recentDate }) => (
                    <div
                      key={character.id}
                      className="flex items-center gap-3 rounded-md p-2 hover:bg-accent/50"
                    >
                      <CharacterChip character={character} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {totalLogs} lần
                          </span>
                          {avgEmotion && (
                            <span className="text-xs">
                              {getEmotionDisplay(avgEmotion)}
                            </span>
                          )}
                        </div>
                        {recentDate && (
                          <p className="text-[10px] text-muted-foreground">
                            Gần nhất: {dayjs(recentDate).format("DD/MM")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* By Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Theo địa điểm</CardTitle>
          </CardHeader>
          <CardContent>
            {locationStats.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">
                Chưa có dữ liệu địa điểm
              </p>
            ) : (
              <div className="space-y-3">
                {locationStats
                  .slice(0, 8)
                  .map(({ id, name, color, count, avgEmotion }) => (
                    <div key={id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3.5 w-3.5" style={{ color }} />
                          {name}
                        </span>
                        <div className="flex items-center gap-2">
                          {avgEmotion && (
                            <span className="text-xs">
                              {getEmotionDisplay(avgEmotion)}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {count} lần
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${
                              (count / (locationStats[0]?.count || 1)) * 100
                            }%`,
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
      </div>
    </div>
  );
}

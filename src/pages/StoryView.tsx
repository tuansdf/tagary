import { CharacterChip } from "@/components/characters";
import { PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCharacterStore, useLocationStore, useLogStore } from "@/stores";
import type { LogEntry } from "@/types";
import { EMOTION_OPTIONS } from "@/types";
import dayjs from "dayjs";
import { Calendar, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";

export function StoryView() {
  const { logs } = useLogStore();
  const { getById: getCharacter } = useCharacterStore();
  const { getById: getLocation } = useLocationStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCharacterId, setFilterCharacterId] = useState<
    string | undefined
  >();

  const sortedLogs = useMemo(() => {
    let filtered = [...logs].sort((a, b) => {
      const dateDiff = dayjs(b.date).diff(dayjs(a.date));
      if (dateDiff !== 0) return dateDiff;
      const aStart = a.timeRange?.startHour ?? 0;
      const bStart = b.timeRange?.startHour ?? 0;
      return aStart - bStart;
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.description?.toLowerCase().includes(q) ||
          log.note?.toLowerCase().includes(q),
      );
    }

    if (filterCharacterId) {
      filtered = filtered.filter((log) =>
        log.characterIds?.includes(filterCharacterId),
      );
    }

    return filtered;
  }, [logs, searchQuery, filterCharacterId]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, LogEntry[]> = {};
    sortedLogs.forEach((log) => {
      if (!groups[log.date]) groups[log.date] = [];
      groups[log.date].push(log);
    });
    return Object.entries(groups).sort(([a], [b]) => dayjs(b).diff(dayjs(a)));
  }, [sortedLogs]);

  const formatHour = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

  const getEmotionEmoji = (score?: number) =>
    score ? EMOTION_OPTIONS.find((o) => o.score === score)?.emoji : undefined;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <PageHeader title="Story" description="Your diary timeline" />

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {filterCharacterId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterCharacterId(undefined)}
          >
            Clear filter
          </Button>
        )}
      </div>

      {/* Timeline */}
      {groupedByDate.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Calendar className="mx-auto mb-3 h-10 w-10" />
            <p>No entries yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedByDate.map(([date, entries]) => (
            <div key={date}>
              {/* Date header */}
              <div className="sticky top-0 z-10 mb-3 flex items-center gap-2 bg-background/95 py-2 backdrop-blur">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {dayjs(date).format("dddd, DD/MM/YYYY")}
                </span>
                <Badge variant="outline" className="text-xs">
                  {entries.length} entries
                </Badge>
              </div>

              {/* Timeline entries */}
              <div className="space-y-2 border-l-2 border-primary/20 pl-4 ml-2">
                {entries.map((log) => {
                  const location = log.locationId
                    ? getLocation(log.locationId)
                    : undefined;
                  const emoji = getEmotionEmoji(log.emotionScore);

                  return (
                    <Card
                      key={log.id}
                      className="transition-colors hover:bg-accent/30"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          {/* Time */}
                          <div className="shrink-0 text-xs font-mono text-muted-foreground min-w-[50px]">
                            {log.timeRange
                              ? formatHour(log.timeRange.startHour)
                              : "—"}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            {/* Emotion + Location row */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {emoji && (
                                <span
                                  className="text-lg"
                                  title={`Mood: ${log.emotionScore}/5`}
                                >
                                  {emoji}
                                </span>
                              )}
                              {location && (
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin
                                    className="h-3 w-3"
                                    style={{ color: location.color }}
                                  />
                                  {location.name}
                                </span>
                              )}
                            </div>

                            {/* Description */}
                            {log.description && (
                              <p className="text-sm leading-relaxed">
                                {log.description}
                              </p>
                            )}

                            {/* Characters */}
                            {log.characterIds &&
                              log.characterIds.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {log.characterIds.map((charId) => {
                                    const char = getCharacter(charId);
                                    return char ? (
                                      <CharacterChip
                                        key={charId}
                                        character={char}
                                        onClick={() =>
                                          setFilterCharacterId(charId)
                                        }
                                      />
                                    ) : null;
                                  })}
                                </div>
                              )}

                            {/* Note */}
                            {log.note && (
                              <p className="text-xs text-muted-foreground italic">
                                {log.note}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

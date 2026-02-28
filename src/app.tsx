import { AppLayout } from "@/components/layout";
import {
  CalendarView,
  CharacterListView,
  DayView,
  HeatmapView,
  InsightsView,
  RecapView,
  SettingsView,
  StoryView,
} from "@/pages";
import { useAppStore } from "@/stores";

export default function App() {
  const { currentView } = useAppStore();

  const renderView = () => {
    switch (currentView) {
      case "day":
        return <DayView />;
      case "calendar":
        return <CalendarView />;
      case "characters":
        return <CharacterListView />;
      case "story":
        return <StoryView />;
      case "heatmap":
        return <HeatmapView />;
      case "insights":
        return <InsightsView />;
      case "recap":
        return <RecapView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DayView />;
    }
  };

  return <AppLayout>{renderView()}</AppLayout>;
}

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
import { useAppStore, useSyncStore } from "@/stores";
import { useEffect } from "react";

export default function App() {
  const { currentView, setCurrentView } = useAppStore();
  const { handleCallback, checkConnection } = useSyncStore();

  // Handle Dropbox OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      handleCallback(code).then(() => {
        // Clean URL and navigate to settings
        window.history.replaceState({}, "", window.location.pathname);
        setCurrentView("settings");
        checkConnection();
      });
    }
  }, [handleCallback, setCurrentView, checkConnection]);

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

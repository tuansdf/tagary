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
import { useSyncStore } from "@/stores";
import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router";

export default function App() {
  const navigate = useNavigate();
  const { handleCallback, checkConnection } = useSyncStore();

  // Handle Dropbox OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      handleCallback(code).then(() => {
        window.history.replaceState({}, "", window.location.pathname);
        navigate("/settings");
        checkConnection();
      });
    }
  }, [handleCallback, navigate, checkConnection]);

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DayView />} />
        <Route path="calendar" element={<CalendarView />} />
        <Route path="characters" element={<CharacterListView />} />
        <Route path="story" element={<StoryView />} />
        <Route path="heatmap" element={<HeatmapView />} />
        <Route path="insights" element={<InsightsView />} />
        <Route path="recap" element={<RecapView />} />
        <Route path="settings" element={<SettingsView />} />
      </Route>
    </Routes>
  );
}

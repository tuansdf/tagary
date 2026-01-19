/**
 * Tagary - Digital Diary Application
 * Main App Component
 */

import { AppLayout } from "@/components/layout";
import { CalendarView, DayView, InsightsView, SettingsView } from "@/pages";
import { useAppStore } from "@/stores";

export default function App() {
  const { currentView } = useAppStore();

  const renderView = () => {
    switch (currentView) {
      case "day":
        return <DayView />;
      case "calendar":
        return <CalendarView />;
      case "insights":
        return <InsightsView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DayView />;
    }
  };

  return <AppLayout>{renderView()}</AppLayout>;
}

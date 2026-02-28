/**
 * AppLayout - Main layout with sidebar navigation
 */

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  initializeTheme,
  useAppStore,
  useLocationStore,
  useTagStore,
} from "@/stores";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Flame,
  History,
  LayoutGrid,
  Menu,
  Settings,
  Users,
} from "lucide-react";
import { useEffect } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { id: "day" as const, label: "Daily Log", icon: LayoutGrid },
  { id: "calendar" as const, label: "Calendar", icon: CalendarDays },
  { id: "characters" as const, label: "Nhân vật", icon: Users },
  { id: "story" as const, label: "Story", icon: History },
  { id: "heatmap" as const, label: "Heatmap", icon: Flame },
  { id: "insights" as const, label: "Insights", icon: BarChart3 },
  { id: "settings" as const, label: "Settings", icon: Settings },
];

function NavContent({
  currentView,
  setCurrentView,
}: {
  currentView: string;
  setCurrentView: (view: (typeof NAV_ITEMS)[number]["id"]) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-6">
        <BookOpen className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold tracking-tight">Tagary</span>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {NAV_ITEMS.map((item) => (
          <Button
            key={item.id}
            variant={currentView === item.id ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-3",
              currentView === item.id && "bg-secondary font-medium",
            )}
            onClick={() => setCurrentView(item.id)}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Button>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground text-center">
          Tagary v2.0.0
        </p>
      </div>
    </div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  const { currentView, setCurrentView, isSidebarOpen, toggleSidebar } =
    useAppStore();
  const { initialize, initialized } = useTagStore();
  const { initialize: initLocations, initialized: locInitialized } =
    useLocationStore();

  // Initialize app on mount
  useEffect(() => {
    initializeTheme();
    if (!initialized) initialize();
    if (!locInitialized) initLocations();
  }, [initialize, initialized, initLocations, locInitialized]);

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden border-r bg-card transition-all duration-300 md:block",
          isSidebarOpen ? "w-64" : "w-0 overflow-hidden",
        )}
      >
        <NavContent currentView={currentView} setCurrentView={setCurrentView} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4 z-50 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <NavContent
            currentView={currentView}
            setCurrentView={setCurrentView}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-auto">
        {/* Desktop Header with sidebar toggle */}
        <header className="sticky top-0 z-40 hidden border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 md:block">
          <div className="flex h-14 items-center px-4">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 pt-14 md:pt-0">{children}</div>
      </main>
    </div>
  );
}

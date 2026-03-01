/**
 * BottomNav - Mobile bottom tab bar navigation
 */

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Flame,
  History,
  LayoutGrid,
  Menu,
  Repeat,
  Settings,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PRIMARY_TABS: NavItem[] = [
  { path: "/", label: "Today", icon: LayoutGrid },
  { path: "/calendar", label: "Calendar", icon: CalendarDays },
  { path: "/story", label: "Story", icon: History },
  { path: "/insights", label: "Insights", icon: BarChart3 },
];

const MORE_ITEMS: NavItem[] = [
  { path: "/characters", label: "Characters", icon: Users },
  { path: "/heatmap", label: "Heatmap", icon: Flame },
  { path: "/recap", label: "Recap", icon: Repeat },
  { path: "/settings", label: "Settings", icon: Settings },
];

const ALL_MORE_PATHS = MORE_ITEMS.map((i) => i.path);

export function BottomNav() {
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = ALL_MORE_PATHS.includes(pathname);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden">
        <div
          className="grid grid-cols-5"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {PRIMARY_TABS.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground",
                )}
              >
                <tab.icon
                  className={cn("h-5 w-5", isActive && "text-primary")}
                />
                {tab.label}
              </Link>
            );
          })}

          {/* More tab */}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
              isMoreActive
                ? "text-primary"
                : "text-muted-foreground active:text-foreground",
            )}
          >
            <Menu className={cn("h-5 w-5", isMoreActive && "text-primary")} />
            More
          </button>
        </div>
      </nav>

      {/* More sheet */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-2 pb-8">
          <SheetTitle className="px-4 py-3 text-base">More</SheetTitle>
          <div className="grid grid-cols-2 gap-2">
            {MORE_ITEMS.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  className="h-auto flex-col gap-2 py-4"
                  asChild
                  onClick={() => setMoreOpen(false)}
                >
                  <Link to={item.path}>
                    <item.icon className="h-6 w-6" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>

          {/* App branding */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            Tagary v2.0.0
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

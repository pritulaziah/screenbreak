import {
  AppWindow,
  Info,
  Palette,
  Timer,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SettingsTab =
  | "schedule"
  | "card"
  | "themes"
  | "sound"
  | "about";

export const SETTINGS_TABS: {
  id: SettingsTab;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "schedule", label: "Schedule", icon: Timer },
  { id: "card", label: "Break card", icon: AppWindow },
  { id: "themes", label: "Appearance", icon: Palette },
  { id: "sound", label: "Sound", icon: Volume2 },
  { id: "about", label: "About", icon: Info },
];

interface SettingsSidebarProps {
  tab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export function SettingsSidebar({
  tab,
  onTabChange,
}: SettingsSidebarProps) {
  return (
    <aside className="flex w-[200px] shrink-0 flex-col border-r border-sidebar-border/70 bg-sidebar/45 backdrop-blur-xl">
      <div className="px-4 pb-2 pt-5">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
          Settings
        </p>
      </div>

      <nav
        aria-label="Settings sections"
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 pb-3"
      >
        {SETTINGS_TABS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex w-full shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                item.id === "about" && "mt-auto",
                active
                  ? "bg-primary/12 text-sidebar-accent-foreground shadow-sm ring-1 ring-primary/20"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  active ? "text-primary" : "text-muted-foreground/70",
                )}
              />
              <span className="flex-1">{item.label}</span>
              {active ? (
                <span className="size-1.5 rounded-full bg-primary" />
              ) : null}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

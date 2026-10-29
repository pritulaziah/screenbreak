import {
  Bell,
  Eye,
  Monitor,
  Palette,
  Settings2,
  Timer,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SettingsTab =
  | "preview"
  | "break"
  | "themes"
  | "notifications"
  | "appearance"
  | "sounds"
  | "advanced";

export const SETTINGS_TABS: {
  id: SettingsTab;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "preview", label: "Preview", icon: Eye },
  { id: "break", label: "Break", icon: Timer },
  { id: "themes", label: "Themes", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Monitor },
  { id: "sounds", label: "Sounds", icon: Volume2 },
  { id: "advanced", label: "Advanced", icon: Settings2 },
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
    <aside className="flex w-[228px] shrink-0 flex-col border-r border-sidebar-border/70 bg-sidebar/45 backdrop-blur-xl">
      <div className="px-4 pb-2 pt-5">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
          Settings
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
        {SETTINGS_TABS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm ring-1 ring-foreground/5"
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

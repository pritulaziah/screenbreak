import { Check } from "lucide-react";
import { ReminderCardView } from "@/components/reminder/ReminderCardView";
import { ThemePreview } from "@/components/settings/ThemePreview";
import { formatTimer } from "@/lib/format";
import { THEMES, type ThemeMeta } from "@/lib/themes";
import type { Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ThemeSettingsProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}

function ThemeCard({
  theme,
  active,
  onSelect,
}: {
  theme: ThemeMeta;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = theme.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "group relative overflow-hidden rounded-[20px] border bg-card/40 text-left shadow-sm transition-all",
        active
          ? "border-primary/70 ring-2 ring-primary/25"
          : "border-border/70 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md",
      )}
    >
      <ThemePreview theme={theme} className="h-[118px] w-full" />

      <div className="p-3">
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <Icon className="size-3.5 text-primary" />
          {theme.name}
        </div>
        <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
          {theme.description}
        </p>
      </div>

      {active ? (
        <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full border border-white/30 bg-white/90 text-black shadow-sm">
          <Check className="size-3.5" />
        </span>
      ) : null}
    </button>
  );
}

export function ThemeSettings({ settings, onChange }: ThemeSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Every scene comes with light and dark app colors.
        </p>
        <span className="text-[11px] text-muted-foreground/70">
          {THEMES.length} scenes
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {THEMES.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            active={settings.theme === theme.id}
            onSelect={() => onChange({ theme: theme.id })}
          />
        ))}
      </div>

      <div className="glass-panel rounded-[22px] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold">Preview</h2>
            <p className="text-xs text-muted-foreground">
              This is how your break card will look.
            </p>
          </div>
          <span className="rounded-full border border-border/70 bg-background/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {settings.theme}
          </span>
        </div>

        <div className="mt-4 flex justify-center rounded-[18px] border border-border/60 bg-black/10 p-5">
          <div className="h-[200px] w-full max-w-[390px]">
            <ReminderCardView
              label="Micro break"
              title="Time for a break"
              time={formatTimer(settings.microbreak_duration_sec)}
              progress={1}
              theme={settings.theme}
              showCountdown={settings.show_countdown}
              allowSnooze={settings.allow_snooze}
              showStop={settings.show_stop}
              onSnooze={() => {}}
              onPause={() => {}}
              onStop={() => {}}
              onClose={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

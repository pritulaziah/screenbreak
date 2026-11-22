import { Check, Moon, Sun } from "lucide-react";
import { BackgroundSettings } from "@/components/settings/BackgroundSettings";
import { ThemePreview } from "@/components/settings/ThemePreview";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import { useSettings } from "@/lib/appState";
import { THEMES, type ThemeMeta } from "@/lib/themes";
import { cn } from "@/lib/utils";

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

export function ThemeSettings() {
  const { settings, update } = useSettings();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Color mode</CardTitle>
          <CardDescription>Light or dark app colors.</CardDescription>
        </CardHeader>
        <CardContent>
          <Segmented
            value={settings.appearance}
            onChange={(appearance) => update({ appearance })}
            options={[
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
            ]}
            className="w-full"
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Choose a scene for your breaks.
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
            onSelect={() => update({ theme: theme.id })}
          />
        ))}
      </div>

      <BackgroundSettings />
    </div>
  );
}

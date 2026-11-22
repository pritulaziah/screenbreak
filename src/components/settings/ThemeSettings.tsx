import { Check, Moon, Sun } from "lucide-react";
import { BreakArt } from "@/components/art/BreakArt";
import { BackgroundSettings } from "@/components/settings/BackgroundSettings";
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
        "group relative overflow-hidden rounded-[16px] border bg-card/40 text-left shadow-sm transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        active
          ? "border-primary/70 ring-2 ring-primary/25"
          : "border-border/70 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md",
      )}
    >
      <span className="relative block h-28 w-full overflow-hidden">
        <BreakArt theme={theme.id} className="absolute inset-0" />
      </span>

      <span className="block p-3">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <Icon className="size-3.5 text-primary" />
          {theme.name}
        </span>
        <span className="mt-1 block text-xs leading-snug text-muted-foreground">
          {theme.description}
        </span>
      </span>

      {active ? (
        <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full border border-primary/30 bg-primary text-primary-foreground shadow-sm">
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
          <CardTitle>App theme</CardTitle>
          <CardDescription>
            Colors apply to the app and the break card.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Color mode</p>
            <Segmented
              value={settings.appearance}
              onChange={(appearance) => update({ appearance })}
              options={[
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
              ]}
              className="w-full"
            />
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
        </CardContent>
      </Card>

      <BackgroundSettings />
    </div>
  );
}

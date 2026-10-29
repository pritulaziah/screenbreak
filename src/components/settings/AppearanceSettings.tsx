import { Moon, Sun } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import { useSettings } from "@/lib/appState";
import type { Position } from "@/lib/types";
import { cn } from "@/lib/utils";

const POSITIONS: { value: Position; label: string }[] = [
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
  { value: "middle-left", label: "Middle left" },
  { value: "center", label: "Center" },
  { value: "middle-right", label: "Middle right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
];

export function AppearanceSettings() {
  const { settings, update } = useSettings();
  const currentPosition = POSITIONS.find(
    (position) => position.value === settings.position,
  );

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

      <Card>
        <CardHeader>
          <CardTitle>Card size</CardTitle>
          <CardDescription>Compact, normal, or large.</CardDescription>
        </CardHeader>
        <CardContent>
          <Segmented
            value={settings.notification_size}
            onChange={(notification_size) => update({ notification_size })}
            options={[
              { value: "compact", label: "Compact" },
              { value: "normal", label: "Normal" },
              { value: "large", label: "Large" },
            ]}
            className="w-full"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orientation</CardTitle>
          <CardDescription>Horizontal or vertical.</CardDescription>
        </CardHeader>
        <CardContent>
          <Segmented
            value={settings.card_orientation}
            onChange={(card_orientation) => update({ card_orientation })}
            options={[
              { value: "horizontal", label: "Horizontal" },
              { value: "vertical", label: "Vertical" },
            ]}
            className="w-full"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Position</CardTitle>
          <CardDescription>
            Where the card appears on the screen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mx-auto grid w-full max-w-[250px] grid-cols-3 gap-1.5 rounded-[16px] border border-border/70 bg-background/25 p-2">
            {POSITIONS.map((position) => {
              const active = settings.position === position.value;

              return (
                <button
                  key={position.value}
                  type="button"
                  aria-label={position.label}
                  aria-pressed={active}
                  onClick={() => update({ position: position.value })}
                  className={cn(
                    "grid h-[54px] place-items-center rounded-lg border transition-all",
                    active
                      ? "border-primary/60 bg-primary/12"
                      : "border-transparent bg-background/30 hover:bg-background/55",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full transition-colors",
                      active ? "bg-primary" : "bg-muted-foreground/35",
                    )}
                  />
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {currentPosition?.label}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

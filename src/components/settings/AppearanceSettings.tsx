import { Moon, Sun } from "lucide-react";
import { BreakArt } from "@/components/art/BreakArt";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import type { Position, Settings } from "@/lib/types";
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

const SIZE_PREVIEW = {
  compact: { box: "h-[72px] w-[146px]", label: "360 × 180" },
  normal: { box: "h-[90px] w-[184px]", label: "420 × 210" },
  large: { box: "h-[108px] w-[220px]", label: "500 × 250" },
} as const;

interface AppearanceSettingsProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}

export function AppearanceSettings({
  settings,
  onChange,
}: AppearanceSettingsProps) {
  const currentPosition = POSITIONS.find(
    (position) => position.value === settings.position,
  );
  const sizePreview = SIZE_PREVIEW[settings.notification_size];

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
            onChange={(appearance) => onChange({ appearance })}
            options={[
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
            ]}
            className="w-full"
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
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
                    onClick={() => onChange({ position: position.value })}
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

        <Card>
          <CardHeader>
            <CardTitle>Card size</CardTitle>
            <CardDescription>Compact, normal, or large.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Segmented
              value={settings.notification_size}
              onChange={(notification_size) => onChange({ notification_size })}
              options={[
                { value: "compact", label: "Compact" },
                { value: "normal", label: "Normal" },
                { value: "large", label: "Large" },
              ]}
              className="w-full"
            />

            <div className="flex h-[152px] items-center justify-center rounded-[16px] border border-dashed border-border/60 bg-black/10 p-4">
              <div
                className={cn(
                  "relative overflow-hidden rounded-[14px] border border-white/20 shadow-lg transition-all",
                  sizePreview.box,
                )}
              >
                <BreakArt
                  theme={settings.theme}
                  className="absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/20" />
                <div className="relative flex h-full flex-col justify-between p-2.5 text-white">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/70">
                    Break
                  </p>
                  <div>
                    <p className="text-lg font-semibold leading-none tabular-nums">
                      04:32
                    </p>
                    <div className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-white/25">
                      <div className="h-full w-1/2 rounded-full bg-white/90" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] text-muted-foreground">
              {sizePreview.label} px
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

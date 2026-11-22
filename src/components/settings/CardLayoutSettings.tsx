import {
  Card,
  CardContent,
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

export function CardLayoutSettings() {
  const { settings, update } = useSettings();
  const currentPosition = POSITIONS.find(
    (position) => position.value === settings.position,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Layout</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border/60">
        <section className="space-y-3 pb-4">
          <h3 className="text-sm font-medium">Card size</h3>
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
        </section>
        <section className="space-y-3 py-4">
          <h3 className="text-sm font-medium">Orientation</h3>
          <Segmented
            value={settings.card_orientation}
            onChange={(card_orientation) => update({ card_orientation })}
            options={[
              { value: "horizontal", label: "Horizontal" },
              { value: "vertical", label: "Vertical" },
            ]}
            className="w-full"
          />
        </section>
        <section className="space-y-3 pt-4">
          <h3 className="text-sm font-medium">Position</h3>
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
                    "grid h-[54px] place-items-center rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
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
          <p className="text-center text-xs text-muted-foreground">
            {currentPosition?.label}
          </p>
        </section>
      </CardContent>
    </Card>
  );
}

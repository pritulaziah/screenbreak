import { ChevronDown, Play } from "lucide-react";
import { SliderField } from "@/components/settings/SliderField";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/lib/appState";
import { playChime } from "@/lib/sound";
import type { SoundTone } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SoundSettings() {
  const { settings, update } = useSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Break alert</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Sound notification</p>
            <p className="text-xs text-muted-foreground">
              Play the selected tone with the break card.
            </p>
          </div>
          <Switch
            aria-label="Sound notification"
            checked={settings.sound}
            onCheckedChange={(sound) => update({ sound })}
          />
        </div>

        <Separator />

        <div className={cn("space-y-2", !settings.sound && "opacity-50")}>
          <Label htmlFor="sound-tone">Tone</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                id="sound-tone"
                value={settings.sound_tone}
                onChange={(event) =>
                  update({ sound_tone: event.target.value as SoundTone })
                }
                disabled={!settings.sound}
                className="select-field w-full"
              >
                <option value="chime">Soft chime</option>
                <option value="bell">Warm bell</option>
                <option value="soft">Short beep</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="size-[2.35rem] shrink-0"
              onClick={() =>
                playChime(settings.sound_tone, settings.sound_volume)
              }
              disabled={!settings.sound}
              aria-label="Play test sound"
              title="Play test sound"
            >
              <Play />
            </Button>
          </div>
        </div>

        <SliderField
          label="Volume"
          value={settings.sound_volume}
          min={0}
          max={100}
          step={5}
          format={(value) => `${value}%`}
          onCommit={(sound_volume) => update({ sound_volume })}
          disabled={!settings.sound}
        />
      </CardContent>
    </Card>
  );
}

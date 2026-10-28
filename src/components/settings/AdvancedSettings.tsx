import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getThemeMeta } from "@/lib/themes";
import type { Settings } from "@/lib/types";

interface AdvancedSettingsProps {
  settings: Settings;
  onReset: () => void;
  onQuit: () => void;
}

export function AdvancedSettings({
  settings,
  onReset,
  onQuit,
}: AdvancedSettingsProps) {
  const meta = getThemeMeta(settings.theme);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Reset</CardTitle>
          <CardDescription>Restore the default settings.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-md text-sm text-muted-foreground">
            Theme, schedule, sound, and appearance return to defaults.
          </p>
          <Button variant="outline" size="sm" onClick={onReset}>
            Reset settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>ScreenBreak 0.1.0</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>Tauri 2 · React 19</p>
          <p>
            Theme: {meta.name} · {settings.appearance === "dark" ? "Dark" : "Light"}
          </p>
          <p>Non-blocking break reminders for your desktop.</p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={onQuit}
        >
          <LogOut />
          Quit ScreenBreak
        </Button>
      </div>
    </div>
  );
}

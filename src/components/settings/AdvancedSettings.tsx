import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSettings } from "@/lib/appState";

export function AdvancedSettings() {
  const { reset } = useSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset</CardTitle>
        <CardDescription>Restore the default settings.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-md text-sm text-muted-foreground">
          Theme, schedule, sound, and appearance return to defaults.
        </p>
        <Button variant="outline" size="sm" onClick={() => void reset()}>
          Reset settings
        </Button>
      </CardContent>
    </Card>
  );
}

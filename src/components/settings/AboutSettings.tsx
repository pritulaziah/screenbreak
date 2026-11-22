import { useState } from "react";
import { Download, Loader2, RefreshCw, RotateCcw } from "lucide-react";
import { ResetSettingsDialog } from "@/components/settings/ResetSettingsDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSettings } from "@/lib/appState";
import { useUpdater } from "@/lib/updater";
import { cn } from "@/lib/utils";

function UpdatesCard() {
  const {
    status,
    currentVersion,
    version,
    notes,
    progress,
    error,
    checkNow,
    install,
  } = useUpdater();

  const busy =
    status === "checking" ||
    status === "downloading" ||
    status === "installing";

  let message = "Updates are checked automatically after startup.";
  if (status === "checking") message = "Checking for updates…";
  else if (status === "available") message = `Version ${version} is available.`;
  else if (status === "current") message = "You have the latest version.";
  else if (status === "downloading")
    message =
      progress !== null
        ? `Downloading the update — ${progress}%.`
        : "Downloading the update…";
  else if (status === "installing")
    message = "Installing the update. The app will restart.";
  else if (status === "error") message = error ?? "The update check failed.";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Updates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">
              ScreenBreak {currentVersion || "…"}
            </p>
            <p
              className={cn(
                "mt-1 text-xs leading-relaxed",
                status === "error"
                  ? "text-destructive"
                  : "text-muted-foreground",
              )}
            >
              {message}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {status === "available" ? (
              <Button size="sm" onClick={() => void install()}>
                <Download />
                Install {version}
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => void checkNow(true)}
            >
              {status === "checking" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <RefreshCw />
              )}
              Check for updates
            </Button>
          </div>
        </div>

        {status === "downloading" ? (
          <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress ?? 0}%` }}
            />
          </div>
        ) : null}

        {notes && status === "available" ? (
          <div className="max-h-32 overflow-y-auto rounded-xl border border-border/60 bg-background/25 p-3 text-[11px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {notes}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AboutSettings() {
  const { reset } = useSettings();
  const [resetOpen, setResetOpen] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <UpdatesCard />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Default settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-sm text-sm text-muted-foreground">
              Restore all settings to their defaults. Uploaded backgrounds are
              kept.
            </p>
            <Button
              variant="destructive-outline"
              size="sm"
              onClick={() => {
                setResetStatus(null);
                setResetOpen(true);
              }}
            >
              <RotateCcw />
              Reset all settings…
            </Button>
          </div>
          {resetStatus ? (
            <p role="status" className="text-xs text-muted-foreground">
              {resetStatus}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {resetOpen ? (
        <ResetSettingsDialog
          onClose={() => setResetOpen(false)}
          onConfirm={async () => {
            await reset();
            setResetStatus("Settings reset to defaults.");
          }}
        />
      ) : null}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Download, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdater } from "@/lib/updater";

export function UpdateBanner() {
  const {
    status,
    version,
    progress,
    error,
    dismissed,
    install,
    dismiss,
  } = useUpdater();
  const [announcement, setAnnouncement] = useState("");

  const busy = status === "downloading" || status === "installing";
  const visible =
    !dismissed &&
    (status === "available" ||
      busy ||
      (status === "error" && version !== null));

  useEffect(() => {
    if (status === "available") {
      setAnnouncement(`ScreenBreak ${version} is ready to install.`);
    } else if (status === "installing") {
      setAnnouncement("Installing the update. The app will restart.");
    } else if (status === "error") {
      setAnnouncement(error ?? "The update failed.");
    } else if (
      status === "downloading" &&
      progress !== null &&
      progress % 25 === 0
    ) {
      setAnnouncement(`Downloading the update, ${progress} percent.`);
    }
  }, [status, version, progress, error]);

  if (!visible) return null;

  const title =
    status === "installing"
      ? "Installing update"
      : status === "downloading"
        ? "Downloading update"
        : status === "error"
          ? "Update failed"
          : "Update available";

  return (
    <div className="fixed bottom-5 right-5 z-40 w-[320px] rounded-[18px] border border-border/70 bg-popover/95 p-4 text-popover-foreground shadow-2xl backdrop-blur-xl">
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {status === "available"
              ? `ScreenBreak ${version} is ready to install.`
              : status === "downloading"
                ? progress !== null
                  ? `Downloading ScreenBreak ${version} — ${progress}%.`
                  : `Downloading ScreenBreak ${version}.`
                : status === "installing"
                  ? "The app will restart when the update is ready."
                  : error}
          </p>
        </div>

        {busy ? null : (
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss update"
            title="Dismiss"
            className="-mr-1 -mt-1 grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {status === "downloading" ? (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress ?? 0}%` }}
          />
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        {status === "available" ? (
          <>
            <Button variant="ghost" size="sm" onClick={dismiss}>
              Later
            </Button>
            <Button size="sm" onClick={() => void install()}>
              <Download />
              Install update
            </Button>
          </>
        ) : null}

        {busy ? (
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            {status === "installing" ? "Installing…" : "Downloading…"}
          </span>
        ) : null}

        {status === "error" ? (
          <Button
            variant="outline"
            size="sm"
            disabled={!version}
            onClick={() => void install()}
          >
            Retry
          </Button>
        ) : null}
      </div>
    </div>
  );
}

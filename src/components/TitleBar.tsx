import { useEffect, useState } from "react";
import { Copy, Minus, Sparkles, Square, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface TitleBarProps {
  section: string;
}

function currentWindow() {
  try {
    return getCurrentWindow();
  } catch {
    return null;
  }
}

function run(action: () => Promise<void>) {
  action().catch((error) => console.error(error));
}

export function TitleBar({ section }: TitleBarProps) {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    const appWindow = currentWindow();
    if (!appWindow) return;

    let active = true;
    let unlisten: (() => void) | undefined;

    const sync = () => {
      void appWindow
        .isMaximized()
        .then((value) => {
          if (active) setMaximized(value);
        })
        .catch(() => {});
    };

    sync();
    void appWindow
      .onResized(sync)
      .then((stop) => {
        if (active) unlisten = stop;
        else stop();
      })
      .catch(() => {});

    return () => {
      active = false;
      unlisten?.();
    };
  }, []);

  function handleMaximize() {
    const appWindow = currentWindow();
    if (appWindow) run(() => appWindow.toggleMaximize());
  }

  return (
    <header
      data-tauri-drag-region
      className="relative z-30 flex h-11 shrink-0 select-none items-center justify-between border-b border-border/50 px-3"
    >
      <div
        data-tauri-drag-region
        className="flex min-w-0 items-center gap-2.5 pl-1"
      >
        <div
          data-tauri-drag-region
          className="grid size-6 shrink-0 place-items-center rounded-lg border border-primary/25 bg-primary/15 text-primary"
        >
          <Sparkles className="pointer-events-none size-3.5" />
        </div>
        <span
          data-tauri-drag-region
          className="text-[13px] font-semibold tracking-tight"
        >
          ScreenBreak
        </span>
        <span
          data-tauri-drag-region
          className="text-[11px] text-muted-foreground/60"
        >
          /
        </span>
        <span
          data-tauri-drag-region
          className="truncate text-[11px] font-medium text-muted-foreground"
        >
          {section}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Minimize"
          title="Minimize"
          onClick={() => {
            const appWindow = currentWindow();
            if (appWindow) run(() => appWindow.minimize());
          }}
          className="titlebar-button"
        >
          <Minus className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label={maximized ? "Restore" : "Maximize"}
          title={maximized ? "Restore" : "Maximize"}
          onClick={handleMaximize}
          className="titlebar-button"
        >
          {maximized ? (
            <Copy className="size-3.5" />
          ) : (
            <Square className="size-3.5" />
          )}
        </button>
        <button
          type="button"
          aria-label="Close"
          title="Close"
          data-close="true"
          onClick={() => {
            const appWindow = currentWindow();
            if (appWindow) run(() => appWindow.close());
          }}
          className="titlebar-button"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </header>
  );
}

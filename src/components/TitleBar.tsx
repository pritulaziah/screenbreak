import { Minus, Sparkles, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface TitleBarProps {
  section: string;
}

function run(action: () => Promise<void>) {
  action().catch((error) => console.error(error));
}

export function TitleBar({ section }: TitleBarProps) {
  const appWindow = (() => {
    try {
      return getCurrentWindow();
    } catch {
      return null;
    }
  })();

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
          onClick={() => appWindow && run(() => appWindow.minimize())}
          className="titlebar-button"
        >
          <Minus className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Close"
          title="Close"
          data-close="true"
          onClick={() => appWindow && run(() => appWindow.close())}
          className="titlebar-button"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </header>
  );
}

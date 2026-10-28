import { Pause, Play, Timer } from "lucide-react";
import { BreakArt } from "@/components/art/BreakArt";
import { formatCountdown, formatTimer } from "@/lib/format";
import type { SchedulerSnapshot, ThemeId } from "@/lib/types";

interface StatusCardProps {
  snapshot: SchedulerSnapshot;
  theme: ThemeId;
  onTogglePause: () => void | Promise<void>;
  onShowNow: () => void | Promise<void>;
}

export function StatusCard({
  snapshot,
  theme,
  onTogglePause,
  onShowNow,
}: StatusCardProps) {
  const paused = snapshot.paused;
  const activeBreak = snapshot.phase === "break";

  const label = paused ? "Paused" : activeBreak ? "On a break" : "Active";

  const description = paused
    ? "Paused for"
    : activeBreak
      ? "Time left"
      : "Next break";

  const value = paused
    ? formatCountdown(snapshot.pause_remaining)
    : activeBreak
      ? formatTimer(snapshot.remaining)
      : formatCountdown(snapshot.next_in);

  const rawProgress = paused
    ? snapshot.pause_remaining / 3600
    : activeBreak
      ? snapshot.remaining / Math.max(1, snapshot.duration)
      : snapshot.next_in /
        Math.max(1, snapshot.settings.microbreak_interval_min * 60);
  const progress = Math.max(0, Math.min(1, rawProgress)) * 100;

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/20 text-white shadow-xl">
      <BreakArt theme={theme} align="bottom" className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      <div className="relative flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
              <Timer className="size-4" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
                {description}
              </p>
            </div>
          </div>

          <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80 backdrop-blur-sm">
            {label}
          </span>
        </div>

        <div className="text-5xl font-semibold tabular-nums leading-none tracking-tight drop-shadow-sm">
          {value}
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-black/30">
          <div
            className="h-full rounded-full bg-white/90 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void onTogglePause()}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
            {paused ? "Resume" : "Pause for 1 hour"}
          </button>
          <button
            type="button"
            onClick={() => void onShowNow()}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/80 bg-white px-3.5 text-xs font-semibold text-black transition-colors hover:bg-white/90"
          >
            <Play className="size-3.5" />
            Show now
          </button>
        </div>
      </div>
    </div>
  );
}

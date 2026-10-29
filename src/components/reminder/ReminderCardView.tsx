import { useState, type ReactNode } from "react";
import { Clock, Pause, Play, Square, X } from "lucide-react";
import { BreakArt } from "@/components/art/BreakArt";
import { useAppState } from "@/lib/appState";
import { getThemeMeta } from "@/lib/themes";
import type { CardOrientation, ThemeId } from "@/lib/types";
import { cn } from "@/lib/utils";

const SNOOZE_OPTIONS = [
  { minutes: 5, label: "5 min" },
  { minutes: 15, label: "15 min" },
  { minutes: 30, label: "30 min" },
  { minutes: 60, label: "1 hour" },
];

interface CircleButtonProps {
  label: string;
  onClick?: () => void;
  active?: boolean;
  children: ReactNode;
}

function CircleButton({
  label,
  onClick,
  active,
  children,
}: CircleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      data-active={active ? "true" : undefined}
      className="reminder-glass-button"
    >
      {children}
    </button>
  );
}

export interface ReminderCardViewProps {
  label: string;
  time: string;
  progress: number;
  theme: ThemeId;
  orientation?: CardOrientation;
  showCountdown: boolean;
  allowSnooze: boolean;
  showStop: boolean;
  breakPaused?: boolean;
  initialSnoozeOpen?: boolean;
  onSnooze?: (minutes: number) => void;
  onPause?: () => void;
  onStop?: () => void;
  onClose?: () => void;
  className?: string;
}

export function ReminderCardView({
  label,
  time,
  progress,
  theme,
  orientation = "horizontal",
  showCountdown,
  allowSnooze,
  showStop,
  breakPaused = false,
  initialSnoozeOpen = false,
  onSnooze,
  onPause,
  onStop,
  onClose,
  className,
}: ReminderCardViewProps) {
  const meta = getThemeMeta(theme);
  const Icon = meta.icon;
  const [snoozeOpen, setSnoozeOpen] = useState(initialSnoozeOpen);
  const { customBackground } = useAppState();
  const progressValue = Math.max(0, Math.min(1, progress)) * 100;
  const vertical = orientation === "vertical";

  const countdown = showCountdown ? (
    <>
      <div className="text-[30px] font-semibold leading-none tabular-nums tracking-tight drop-shadow-sm">
        {time}
      </div>
      <div className="mt-2 h-1 w-full max-w-[230px] overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-white/90 transition-all duration-500"
          style={{ width: `${progressValue}%` }}
        />
      </div>
    </>
  ) : null;

  const snoozeChips = (
    <div className="flex flex-wrap items-center gap-1.5">
      {SNOOZE_OPTIONS.map((option) => (
        <button
          key={option.minutes}
          type="button"
          onClick={() => onSnooze?.(option.minutes)}
          title={`Snooze for ${option.label}`}
          className="reminder-chip"
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  const controls = (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2",
        vertical && "flex-col",
      )}
    >
      {allowSnooze || snoozeOpen ? (
        <CircleButton
          label="Snooze"
          active={snoozeOpen}
          onClick={() => setSnoozeOpen((open) => !open)}
        >
          <Clock className="size-4" />
        </CircleButton>
      ) : null}
      {snoozeOpen ? null : (
        <CircleButton label={breakPaused ? "Resume" : "Pause"} onClick={onPause}>
          {breakPaused ? (
            <Play className="size-4" />
          ) : (
            <Pause className="size-4" />
          )}
        </CircleButton>
      )}
      {showStop ? (
        <CircleButton label="Stop break" onClick={onStop}>
          <Square className="size-3.5" />
        </CircleButton>
      ) : null}
    </div>
  );

  return (
    <div
      className={cn(
        "reminder-card relative flex h-full w-full flex-col overflow-hidden rounded-[26px] border border-white/20 text-white shadow-2xl",
        className,
      )}
    >
      {customBackground ? (
        <img
          src={customBackground}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <BreakArt theme={theme} className="absolute inset-0" />
      )}
      <div className="reminder-scrim absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 flex h-full flex-col p-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">
              <span className="grid size-5 place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                <Icon className="size-3" />
              </span>
              <span className="drop-shadow-sm">{label}</span>
            </div>
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                title="Close"
                className="-mr-1 -mt-1 grid size-7 place-items-center rounded-full border border-white/15 bg-black/25 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/40 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>

          {snoozeOpen ? (
            <div className="mt-2">
              <h2 className="text-[19px] font-semibold leading-tight tracking-tight drop-shadow-sm">
                Not yet?
              </h2>
            </div>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="min-w-0 flex-1">
            {snoozeOpen ? snoozeChips : countdown}
          </div>
          {controls}
        </div>
      </div>
    </div>
  );
}

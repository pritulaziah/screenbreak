import { ReminderCardView } from "@/components/reminder/ReminderCardView";
import { formatTimer } from "@/lib/format";
import { endBreak, snooze, toggleBreakPause } from "@/lib/tauri";
import type { SchedulerSnapshot } from "@/lib/types";

interface ReminderCardProps {
  snapshot: SchedulerSnapshot;
  onChange: (snapshot: SchedulerSnapshot) => void;
}

export function ReminderCard({ snapshot, onChange }: ReminderCardProps) {
  const isLong = snapshot.kind === "long";
  const duration =
    snapshot.duration ||
    (isLong
      ? snapshot.settings.long_break_duration_min * 60
      : snapshot.settings.microbreak_duration_sec);
  const progress = duration > 0 ? snapshot.remaining / duration : 0;

  const label = isLong ? "Long break" : "Micro break";
  const title = isLong ? "Time for a long break" : "Time for a break";

  async function run(action: Promise<SchedulerSnapshot>) {
    try {
      onChange(await action);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <ReminderCardView
      label={label}
      title={title}
      time={formatTimer(snapshot.remaining)}
      progress={progress}
      theme={snapshot.settings.theme}
      showCountdown={snapshot.settings.show_countdown}
      allowSnooze={snapshot.settings.allow_snooze}
      showStop={snapshot.settings.show_stop}
      breakPaused={snapshot.break_paused}
      onSnooze={(minutes) => void run(snooze(minutes))}
      onPause={() => void run(toggleBreakPause())}
      onStop={() => void run(endBreak())}
      onClose={() => void run(endBreak())}
    />
  );
}

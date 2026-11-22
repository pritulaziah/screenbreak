import { ReminderCardView } from "@/components/reminder/ReminderCardView";
import { useAppState } from "@/lib/appState";
import { formatTimer } from "@/lib/format";

export function ReminderCard({ backgroundUrl }: { backgroundUrl?: string }) {
  const { snapshot, snooze, endBreak, toggleBreakPause } = useAppState();
  if (!snapshot) return null;

  const isLong = snapshot.kind === "long";
  const duration =
    snapshot.duration ||
    (isLong
      ? snapshot.settings.long_break_duration_min * 60
      : snapshot.settings.microbreak_duration_sec);
  const progress = duration > 0 ? snapshot.remaining / duration : 0;

  const label = isLong ? "Long break" : "Micro break";

  return (
    <ReminderCardView
      label={label}
      time={formatTimer(snapshot.remaining)}
      progress={progress}
      backgroundUrl={backgroundUrl}
      theme={snapshot.settings.theme}
      orientation={snapshot.settings.card_orientation}
      showCountdown={snapshot.settings.show_countdown}
      allowSnooze={snapshot.settings.allow_snooze}
      showStop={snapshot.settings.show_stop}
      breakPaused={snapshot.break_paused}
      onSnooze={(minutes) => void snooze(minutes)}
      onPause={() => void toggleBreakPause()}
      onStop={() => void endBreak()}
      onClose={() => void endBreak()}
    />
  );
}

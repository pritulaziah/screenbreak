import { useEffect, useRef } from "react";
import { ReminderCard } from "@/components/reminder/ReminderCard";
import { useAppState } from "@/lib/appState";
import { playChime } from "@/lib/sound";
import type { Phase } from "@/lib/types";

export function ReminderApp() {
  const { snapshot } = useAppState();
  const previousPhase = useRef<Phase | null>(null);

  useEffect(() => {
    if (!snapshot) return;

    if (
      snapshot.phase === "break" &&
      previousPhase.current !== "break" &&
      snapshot.settings.sound
    ) {
      playChime(snapshot.settings.sound_tone, snapshot.settings.sound_volume);
    }

    previousPhase.current = snapshot.phase;
  }, [snapshot]);

  if (!snapshot || snapshot.phase === "idle") return null;

  return (
    <div className="box-border flex h-full w-full items-stretch overflow-hidden p-3">
      <ReminderCard key={snapshot.phase} />
    </div>
  );
}

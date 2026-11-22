import { useEffect, useMemo, useRef } from "react";
import { ReminderCard } from "@/components/reminder/ReminderCard";
import { useAppState } from "@/lib/appState";
import { pickBackgroundIndex } from "@/lib/background";
import { playChime } from "@/lib/sound";
import type { Phase } from "@/lib/types";

export function ReminderApp() {
  const { snapshot, customBackgrounds } = useAppState();
  const previousPhase = useRef<Phase | null>(null);
  const lastBackgroundIndex = useRef<number | null>(null);

  const backgroundIndex = useMemo(() => {
    if (!snapshot || customBackgrounds.length === 0) return 0;

    return pickBackgroundIndex(
      snapshot.breaks_done,
      customBackgrounds.length,
      snapshot.settings.background_random,
      lastBackgroundIndex.current,
    );
  }, [
    snapshot?.breaks_done,
    snapshot?.settings.background_random,
    customBackgrounds.length,
  ]);

  useEffect(() => {
    if (customBackgrounds.length > 0) {
      lastBackgroundIndex.current = backgroundIndex;
    }
  }, [backgroundIndex, customBackgrounds.length]);

  useEffect(() => {
    if (!snapshot) return;

    if (previousPhase.current === null) {
      previousPhase.current = snapshot.phase;
      return;
    }

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
      <ReminderCard
        backgroundUrl={customBackgrounds[backgroundIndex]?.url}
      />
    </div>
  );
}

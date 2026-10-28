import { useEffect, useRef, useState } from "react";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { ReminderCard } from "@/components/reminder/ReminderCard";
import { getState } from "@/lib/tauri";
import { applyTheme } from "@/lib/theme";
import { playChime } from "@/lib/sound";
import type { Phase, SchedulerSnapshot } from "@/lib/types";

export function ReminderApp() {
  const [snapshot, setSnapshot] = useState<SchedulerSnapshot | null>(null);
  const previousPhase = useRef<Phase | null>(null);

  useEffect(() => {
    let disposed = false;
    let unlisten: UnlistenFn | undefined;

    getState()
      .then((next) => {
        if (!disposed) setSnapshot(next);
      })
      .catch((error) => console.error(error));

    listen<SchedulerSnapshot>("scheduler:update", (event) => {
      if (!disposed) setSnapshot(event.payload);
    }).then((stop) => {
      if (disposed) stop();
      else unlisten = stop;
    });

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, []);

  useEffect(() => {
    if (!snapshot) return;
    applyTheme(snapshot.settings.theme, snapshot.settings.appearance);
  }, [snapshot?.settings.theme, snapshot?.settings.appearance]);

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
      <ReminderCard
        key={snapshot.phase}
        snapshot={snapshot}
        onChange={setSnapshot}
      />
    </div>
  );
}

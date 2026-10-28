import { useState } from "react";
import { ReminderCardView } from "@/components/reminder/ReminderCardView";
import { Segmented } from "@/components/ui/segmented";
import { formatTimer } from "@/lib/format";
import type { Settings } from "@/lib/types";

interface NotificationPreviewProps {
  settings: Settings;
}

type PreviewMode = "break" | "snooze";

export function NotificationPreview({ settings }: NotificationPreviewProps) {
  const [mode, setMode] = useState<PreviewMode>("break");
  const time = formatTimer(settings.microbreak_duration_sec);

  return (
    <div className="glass-panel rounded-[22px] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Preview</h2>
          <p className="text-xs text-muted-foreground">
            Preview the break card and the snooze panel.
          </p>
        </div>
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: "break", label: "Break" },
            { value: "snooze", label: "Not yet" },
          ]}
          className="shrink-0"
        />
      </div>

      <div className="mt-4 flex justify-center rounded-[18px] border border-dashed border-border/60 bg-black/10 p-5">
        <div className="h-[210px] w-full max-w-[400px]">
          <ReminderCardView
            key={mode}
            label="Micro break"
            title="Time for a break"
            time={time}
            progress={1}
            theme={settings.theme}
            showCountdown={settings.show_countdown}
            allowSnooze={settings.allow_snooze}
            showStop={settings.show_stop}
            breakPaused={false}
            initialSnoozeOpen={mode === "snooze" && settings.allow_snooze}
            onSnooze={() => {}}
            onPause={() => {}}
            onStop={() => {}}
            onClose={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

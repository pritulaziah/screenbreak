import { ScheduleCard } from "@/components/settings/ScheduleCard";
import { StatusCard } from "@/components/settings/StatusCard";
import type { SchedulerSnapshot, Settings } from "@/lib/types";

interface BreakSettingsProps {
  settings: Settings;
  snapshot: SchedulerSnapshot | null;
  onChange: (patch: Partial<Settings>) => void;
  onTogglePause: () => void | Promise<void>;
  onShowNow: () => void | Promise<void>;
}

export function BreakSettings({
  settings,
  snapshot,
  onChange,
  onTogglePause,
  onShowNow,
}: BreakSettingsProps) {
  return (
    <div className="space-y-4">
      {snapshot ? (
        <StatusCard
          snapshot={snapshot}
          theme={settings.theme}
          onTogglePause={onTogglePause}
          onShowNow={onShowNow}
        />
      ) : null}
      <ScheduleCard settings={settings} onChange={onChange} />
    </div>
  );
}

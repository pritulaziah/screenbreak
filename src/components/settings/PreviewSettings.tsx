import { NotificationPreview } from "@/components/settings/NotificationPreview";
import { StatusCard } from "@/components/settings/StatusCard";
import { useSettings } from "@/lib/appState";

export function PreviewSettings() {
  const { settings, snapshot, togglePause, showNow } = useSettings();

  return (
    <div className="space-y-4">
      {snapshot ? (
        <StatusCard
          snapshot={snapshot}
          theme={settings.theme}
          onTogglePause={togglePause}
          onShowNow={showNow}
        />
      ) : null}

      <NotificationPreview settings={settings} />
    </div>
  );
}

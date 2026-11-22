import { ScheduleCard } from "@/components/settings/ScheduleCard";
import { useSettings } from "@/lib/appState";

export function ScheduleSettings() {
  const { settings, update } = useSettings();

  return <ScheduleCard settings={settings} onChange={update} />;
}

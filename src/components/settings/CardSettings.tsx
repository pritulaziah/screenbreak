import { CardContentSettings } from "@/components/settings/CardContentSettings";
import { CardLayoutSettings } from "@/components/settings/CardLayoutSettings";

export function CardSettings() {
  return (
    <div className="space-y-4">
      <CardContentSettings />
      <CardLayoutSettings />
    </div>
  );
}

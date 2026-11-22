import { Clock, Square, Timer } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/lib/appState";

interface SettingSwitchProps {
  label: string;
  description: string;
  icon: typeof Timer;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function SettingSwitch({
  label,
  description,
  icon: Icon,
  checked,
  onChange,
}: SettingSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-border/70 bg-background/30 text-muted-foreground">
          <Icon className="size-3.5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <Switch
        aria-label={label}
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  );
}

export function CardContentSettings() {
  const { settings, update } = useSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contents and controls</CardTitle>
      </CardHeader>
      <CardContent>
        <SettingSwitch
          icon={Timer}
          label="Show countdown"
          description="Show the time left and a progress bar."
          checked={settings.show_countdown}
          onChange={(show_countdown) => update({ show_countdown })}
        />
        <Separator />
        <SettingSwitch
          icon={Clock}
          label="Allow snooze"
          description="Offer 5, 15, 30, and 60 minute delays."
          checked={settings.allow_snooze}
          onChange={(allow_snooze) => update({ allow_snooze })}
        />
        <Separator />
        <SettingSwitch
          icon={Square}
          label="Show stop button"
          description="Keep the Stop button during a break."
          checked={settings.show_stop}
          onChange={(show_stop) => update({ show_stop })}
        />
      </CardContent>
    </Card>
  );
}

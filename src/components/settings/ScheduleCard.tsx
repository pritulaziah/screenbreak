import {
  SelectField,
  type SelectOption,
} from "@/components/settings/SelectField";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Settings } from "@/lib/types";

interface ScheduleCardProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}

function range(from: number, to: number, step: number) {
  const values: number[] = [];
  for (let value = from; value <= to; value += step) values.push(value);
  return values;
}

function withCurrent(
  options: SelectOption[],
  current: number,
  label: (value: number) => string,
) {
  if (options.some((option) => option.value === current)) return options;
  return [...options, { value: current, label: label(current) }].sort(
    (a, b) => a.value - b.value,
  );
}

function ordinal(value: number) {
  const suffix =
    value % 10 === 1 && value % 100 !== 11
      ? "st"
      : value % 10 === 2 && value % 100 !== 12
        ? "nd"
        : value % 10 === 3 && value % 100 !== 13
          ? "rd"
          : "th";
  return `${value}${suffix}`;
}

export function ScheduleCard({ settings, onChange }: ScheduleCardProps) {
  const intervals = withCurrent(
    range(5, 60, 5).map((value) => ({ value, label: `${value} min` })),
    settings.microbreak_interval_min,
    (value) => `${value} min`,
  );
  const durations = withCurrent(
    range(10, 60, 5).map((value) => ({ value, label: `${value} sec` })),
    settings.microbreak_duration_sec,
    (value) => `${value} sec`,
  );
  const longDurations = withCurrent(
    range(1, 15, 1).map((value) => ({ value, label: `${value} min` })),
    settings.long_break_duration_min,
    (value) => `${value} min`,
  );
  const frequencies = withCurrent(
    range(2, 6, 1).map((value) => ({
      value,
      label: `${ordinal(value)} break`,
    })),
    settings.long_break_every,
    (value) => `${ordinal(value)} break`,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Intervals</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border/60">
        <section className="pb-3">
          <h3 className="text-sm font-semibold">Micro breaks</h3>
          <div className="divide-y divide-border/60">
            <SelectField
              label="Remind me every"
              value={settings.microbreak_interval_min}
              options={intervals}
              onChange={(value) => onChange({ microbreak_interval_min: value })}
            />
            <SelectField
              label="Micro break length"
              value={settings.microbreak_duration_sec}
              options={durations}
              onChange={(value) => onChange({ microbreak_duration_sec: value })}
            />
          </div>
        </section>
        <section className="pt-4">
          <h3 className="text-sm font-semibold">Long breaks</h3>
          <div className="divide-y divide-border/60">
            <SelectField
              label="Long break length"
              value={settings.long_break_duration_min}
              options={longDurations}
              onChange={(value) => onChange({ long_break_duration_min: value })}
            />
            <SelectField
              label="Long break every"
              value={settings.long_break_every}
              options={frequencies}
              onChange={(value) => onChange({ long_break_every: value })}
            />
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

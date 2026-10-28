import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onCommit: (value: number) => void;
  disabled?: boolean;
}

export function SliderField({
  label,
  value,
  min,
  max,
  step,
  format,
  onCommit,
  disabled = false,
}: SliderFieldProps) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  return (
    <div className={cn("space-y-2.5", disabled && "opacity-50")}>
      <div className="flex items-center justify-between gap-3">
        <Label className="text-sm">{label}</Label>
        <span className="rounded-md border border-border/60 bg-background/30 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground">
          {format(local)}
        </span>
      </div>
      <Slider
        aria-label={label}
        value={[local]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={([next]) => setLocal(next)}
        onValueCommit={([next]) => onCommit(next)}
      />
    </div>
  );
}

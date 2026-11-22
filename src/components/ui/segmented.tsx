import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex rounded-xl border border-border/80 bg-background/30 p-0.5 backdrop-blur-sm",
        className,
      )}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] px-2.5 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              active
                ? "bg-primary/12 text-foreground shadow-sm ring-1 ring-primary/35"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {Icon ? (
              <Icon className={cn("size-3.5", active && "text-primary")} />
            ) : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

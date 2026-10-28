import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: number;
  label: string;
}

interface SelectFieldProps {
  label: string;
  hint?: string;
  value: number;
  options: SelectOption[];
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function SelectField({
  label,
  hint,
  value,
  options,
  onChange,
  disabled = false,
}: SelectFieldProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-3",
        disabled && "opacity-50",
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {hint ? (
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>

      <div className="relative shrink-0">
        <select
          value={value}
          disabled={disabled}
          aria-label={label}
          onChange={(event) => onChange(Number(event.target.value))}
          className="select-field min-w-[112px]"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}

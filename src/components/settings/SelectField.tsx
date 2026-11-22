import { useId } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: number;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: number;
  options: SelectOption[];
  onChange: (value: number) => void;
}

export function SelectField({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps) {
  const selectId = useId();

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <label htmlFor={selectId} className="min-w-0 text-sm font-medium">
        {label}
      </label>

      <div className="relative shrink-0">
        <select
          id={selectId}
          value={value}
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

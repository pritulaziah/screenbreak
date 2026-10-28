import { BreakArt } from "@/components/art/BreakArt";
import type { ThemeMeta } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface ThemePreviewProps {
  theme: ThemeMeta;
  className?: string;
}

export function ThemePreview({ theme, className }: ThemePreviewProps) {
  const Icon = theme.icon;

  return (
    <div
      className={cn("relative overflow-hidden bg-black", className)}
      aria-hidden="true"
    >
      <BreakArt theme={theme.id} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/25 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm">
        <Icon className="size-2.5" />
        Break
      </div>

      <div className="absolute inset-x-3 bottom-3 text-white">
        <p className="text-[10px] font-medium text-white/65">Take a moment</p>
        <p className="mt-0.5 text-lg font-semibold leading-none tabular-nums">
          10:00
        </p>
        <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-white/20">
          <div className="h-full w-2/3 rounded-full bg-white/85" />
        </div>
      </div>
    </div>
  );
}

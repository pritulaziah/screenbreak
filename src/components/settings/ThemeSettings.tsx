import { useRef, useState } from "react";
import { Check, ImageUp, Trash2 } from "lucide-react";
import { ThemePreview } from "@/components/settings/ThemePreview";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSettings } from "@/lib/appState";
import { THEMES, type ThemeMeta } from "@/lib/themes";
import { cn } from "@/lib/utils";

function ThemeCard({
  theme,
  active,
  onSelect,
}: {
  theme: ThemeMeta;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = theme.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "group relative overflow-hidden rounded-[20px] border bg-card/40 text-left shadow-sm transition-all",
        active
          ? "border-primary/70 ring-2 ring-primary/25"
          : "border-border/70 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md",
      )}
    >
      <ThemePreview theme={theme} className="h-[118px] w-full" />

      <div className="p-3">
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <Icon className="size-3.5 text-primary" />
          {theme.name}
        </div>
        <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
          {theme.description}
        </p>
      </div>

      {active ? (
        <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full border border-white/30 bg-white/90 text-black shadow-sm">
          <Check className="size-3.5" />
        </span>
      ) : null}
    </button>
  );
}

export function ThemeSettings() {
  const {
    settings,
    update,
    customBackground,
    uploadBackground,
    removeBackground,
  } = useSettings();
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    setBusy(true);
    try {
      await uploadBackground(file);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setError(null);
    setBusy(true);
    try {
      await removeBackground();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Every scene comes with light and dark app colors.
        </p>
        <span className="text-[11px] text-muted-foreground/70">
          {THEMES.length} scenes
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {THEMES.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            active={settings.theme === theme.id}
            onSelect={() => update({ theme: theme.id })}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Break card background</CardTitle>
          <CardDescription>
            Your image replaces the theme scene on the break card.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {customBackground ? (
              <img
                src={customBackground}
                alt="Break card background"
                className="h-[84px] w-[168px] rounded-[12px] border border-border/60 object-cover"
              />
            ) : (
              <div className="grid h-[84px] w-[168px] place-items-center rounded-[12px] border border-dashed border-border/60 bg-black/10 text-[11px] text-muted-foreground">
                No image
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => fileInput.current?.click()}
              >
                <ImageUp />
                {customBackground ? "Replace" : "Upload image"}
              </Button>
              {customBackground ? (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => void remove()}
                >
                  <Trash2 />
                  Remove
                </Button>
              ) : null}
            </div>
          </div>

          {error ? <p className="text-xs text-destructive">{error}</p> : null}

          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void upload(file);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

import { useId, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialogFocus } from "@/lib/useDialogFocus";

interface ResetSettingsDialogProps {
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function ResetSettingsDialog({
  onConfirm,
  onClose,
}: ResetSettingsDialogProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useDialogFocus<HTMLDivElement>(onClose);
  const titleId = useId();
  const descriptionId = useId();

  async function confirmReset() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch {
      setError("Could not reset settings. Try again.");
      setBusy(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={busy}
        className="w-full max-w-[440px] space-y-4 rounded-[22px] border border-border/70 bg-popover p-5 text-popover-foreground shadow-2xl outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
            <RotateCcw className="size-4" />
          </span>
          <h2 id={titleId} className="text-base font-semibold tracking-tight">
            Reset all settings?
          </h2>
        </div>

        <div
          id={descriptionId}
          className="space-y-2 text-sm leading-relaxed text-muted-foreground"
        >
          <p>
            This resets the schedule, appearance, break card, and sound to their
            defaults.
          </p>
          <p>Your uploaded background images are kept. This cannot be undone.</p>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={busy}
            onClick={() => void confirmReset()}
          >
            {busy ? <Loader2 className="animate-spin" /> : <RotateCcw />}
            {busy ? "Resetting…" : "Reset all settings"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

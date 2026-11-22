import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const trigger = document.activeElement;
    return () => {
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, []);

  useEffect(() => {
    if (busy) dialogRef.current?.focus();
    else cancelRef.current?.focus();
  }, [busy]);

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

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      if (!busy) onClose();
      return;
    }
    if (event.key !== "Tab") return;

    const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>(
      "button:not(:disabled)",
    );
    if (!buttons?.length) {
      event.preventDefault();
      return;
    }

    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-6 backdrop-blur-sm"
      onClick={() => {
        if (!busy) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={busy}
        tabIndex={-1}
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
          <Button
            ref={cancelRef}
            variant="outline"
            disabled={busy}
            onClick={onClose}
          >
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

import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import type { CustomBackground } from "@/lib/types";
import { useDialogFocus } from "@/lib/useDialogFocus";

interface DeleteBackgroundDialogProps {
  background: CustomBackground;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteBackgroundDialog({
  background,
  busy,
  onCancel,
  onConfirm,
}: DeleteBackgroundDialogProps) {
  const dialogRef = useDialogFocus<HTMLDivElement>(onCancel);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Remove image"
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-6 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        className="flex w-full max-w-[440px] items-center gap-4 rounded-[22px] border border-border/70 bg-popover p-4 text-popover-foreground shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={background.url}
          alt=""
          className="h-[86px] w-[130px] shrink-0 rounded-[14px] border border-border/60 object-cover"
        />

        <div className="min-w-0">
          <p className="text-sm font-semibold">Remove image?</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            The image is deleted from the app data folder.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={busy}
              onClick={onConfirm}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

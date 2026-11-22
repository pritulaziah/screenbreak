import { createPortal } from "react-dom";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CustomBackground } from "@/lib/types";
import { useDialogFocus } from "@/lib/useDialogFocus";

interface BackgroundPreviewDialogProps {
  background: CustomBackground;
  busy: boolean;
  onClose: () => void;
  onRemove: () => void;
}

export function BackgroundPreviewDialog({
  background,
  busy,
  onClose,
  onRemove,
}: BackgroundPreviewDialogProps) {
  const dialogRef = useDialogFocus<HTMLDivElement>(onClose);

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/70 p-6 backdrop-blur-sm focus:outline-none"
      onClick={onClose}
    >
      <img
        src={background.url}
        alt="Break card background"
        className="max-h-[72vh] max-w-full rounded-[18px] border border-white/20 object-contain shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      />

      <div
        className="flex items-center gap-2"
        onClick={(event) => event.stopPropagation()}
      >
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="destructive"
          size="sm"
          disabled={busy}
          onClick={onRemove}
        >
          <Trash2 />
          Remove
        </Button>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        title="Close preview"
        className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-white/20 bg-black/50 text-white transition-colors hover:bg-black/70"
      >
        <X className="size-4" />
      </button>
    </div>,
    document.body,
  );
}

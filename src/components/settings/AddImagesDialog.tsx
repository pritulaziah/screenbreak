import { useEffect, useRef, useState, type DragEvent } from "react";
import { createPortal } from "react-dom";
import { ImageUp, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackgroundUploadError } from "@/lib/appState";
import { isAcceptedImage } from "@/lib/background";
import { useDialogFocus } from "@/lib/useDialogFocus";
import { cn } from "@/lib/utils";

interface StagedImage {
  file: File;
  url: string;
}

interface AddImagesDialogProps {
  initialFiles?: File[];
  onAdd: (files: File[]) => Promise<void>;
  onClose: () => void;
}

export function AddImagesDialog({
  initialFiles,
  onAdd,
  onClose,
}: AddImagesDialogProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const initialRef = useRef(initialFiles);
  const stagedRef = useRef<StagedImage[]>([]);
  const panelRef = useDialogFocus<HTMLDivElement>(onClose);
  const [staged, setStaged] = useState<StagedImage[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    stagedRef.current = staged;
  }, [staged]);

  useEffect(() => {
    return () => {
      for (const item of stagedRef.current) {
        URL.revokeObjectURL(item.url);
      }
    };
  }, []);

  useEffect(() => {
    const files = initialRef.current;
    if (files && files.length > 0) {
      initialRef.current = undefined;
      void addFiles(files);
    }
    // Stage the initial files one time on mount.
  }, []);

  async function addFiles(files: File[]) {
    if (files.length === 0) return;

    const accepted: File[] = [];
    for (const file of files) {
      if (await isAcceptedImage(file)) {
        accepted.push(file);
      }
    }

    if (accepted.length === 0) {
      setError("Use PNG, JPEG, or WebP images up to 25 MB.");
      return;
    }

    setError(
      accepted.length < files.length
        ? "Some files were skipped. Use PNG, JPEG, or WebP up to 25 MB."
        : null,
    );

    setStaged((current) => [
      ...current,
      ...accepted.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    ]);
  }

  function removeStaged(url: string) {
    URL.revokeObjectURL(url);
    setStaged((current) => current.filter((item) => item.url !== url));
  }

  function handleDragEnter(event: DragEvent) {
    event.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    void addFiles(Array.from(event.dataTransfer.files));
  }

  async function submit() {
    if (staged.length === 0 || busy) return;

    setBusy(true);
    setError(null);
    try {
      await onAdd(staged.map((item) => item.file));
      onClose();
    } catch (reason) {
      if (reason instanceof BackgroundUploadError && reason.saved > 0) {
        setStaged((current) => {
          for (const item of current.slice(0, reason.saved)) {
            URL.revokeObjectURL(item.url);
          }
          return current.slice(reason.saved);
        });
      }
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add images"
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        aria-busy={busy}
        className="flex max-h-full w-full max-w-[680px] flex-col gap-4 overflow-y-auto rounded-[22px] border border-border/70 bg-popover p-5 text-popover-foreground shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Add images</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              PNG, JPEG, or WebP · up to 25 MB each.
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="-mr-1 -mt-1 grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-[210px_1fr]">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileInput.current?.click()}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed px-4 py-5 text-center transition-colors disabled:opacity-60",
              dragging
                ? "border-primary bg-primary/10"
                : "border-border/70 bg-background/30 hover:border-foreground/30 hover:bg-background/50",
            )}
          >
            <span className="grid size-10 place-items-center rounded-full border border-border/60 bg-background/60 text-muted-foreground">
              <ImageUp className="size-4" />
            </span>
            <span className="text-sm font-medium">
              Drop images here or click to browse
            </span>
            <span className="text-[11px] text-muted-foreground/80">
              You can select several files.
            </span>
          </button>

          <div className="grid grid-cols-3 content-start gap-2">
            {staged.map((item) => (
              <div
                key={item.url}
                className="relative aspect-[16/10] overflow-hidden rounded-[12px] border border-border/60 bg-black/10"
              >
                <img
                  src={item.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => removeStaged(item.url)}
                  aria-label={`Remove ${item.file.name}`}
                  title={`Remove ${item.file.name}`}
                  className="absolute right-1 top-1 grid size-6 place-items-center rounded-full border border-white/25 bg-black/60 text-white/90 backdrop-blur-sm transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}

            <button
              type="button"
              disabled={busy}
              onClick={() => fileInput.current?.click()}
              aria-label="Add more images"
              title="Add more images"
              className="grid aspect-[16/10] place-items-center rounded-[12px] border border-dashed border-border/70 bg-background/25 text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-background/45 disabled:opacity-50"
            >
              <Plus className="size-5" />
            </button>
          </div>
        </div>

        {error ? (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={busy || staged.length === 0}
            onClick={() => void submit()}
          >
            {busy ? <Loader2 className="animate-spin" /> : null}
            Add{staged.length > 0 ? ` (${staged.length})` : ""}
          </Button>
        </div>

        <input
          ref={fileInput}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp"
          tabIndex={-1}
          className="hidden"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            void addFiles(files);
          }}
        />
      </div>
    </div>,
    document.body,
  );
}

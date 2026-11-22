import { useEffect, useRef, useState, type DragEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Eye,
  GripVertical,
  ImageUp,
  MoreHorizontal,
  Plus,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { AddImagesDialog } from "@/components/settings/AddImagesDialog";
import { BackgroundPreviewDialog } from "@/components/settings/BackgroundPreviewDialog";
import { DeleteBackgroundDialog } from "@/components/settings/DeleteBackgroundDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/lib/appState";
import { isAcceptedImage } from "@/lib/background";
import type { CustomBackground } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  destructive?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function MenuItem({
  icon: Icon,
  label,
  destructive = false,
  disabled = false,
  onClick,
}: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
        destructive
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground hover:bg-foreground/8",
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      {label}
    </button>
  );
}

export function BackgroundSettings() {
  const {
    settings,
    update,
    customBackgrounds,
    uploadBackgrounds,
    removeBackground,
    reorderBackgrounds,
    replaceBackground,
    downloadBackground,
  } = useSettings();

  const replaceInput = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const draggingPathRef = useRef<string | null>(null);
  const statusTimer = useRef<number | null>(null);

  const [dragging, setDragging] = useState(false);
  const [draggingPath, setDraggingPath] = useState<string | null>(null);
  const [dropPath, setDropPath] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [preview, setPreview] = useState<CustomBackground | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomBackground | null>(
    null,
  );
  const [addOpen, setAddOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[] | undefined>();
  const [replacePath, setReplacePath] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    function prevent(event: Event) {
      event.preventDefault();
    }

    function reset() {
      dragDepth.current = 0;
      setDragging(false);
    }

    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    window.addEventListener("dragend", reset);
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
      window.removeEventListener("dragend", reset);
      window.removeEventListener("blur", reset);
    };
  }, []);

  useEffect(() => {
    if (!menuFor) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-background-menu]")) return;
      setMenuFor(null);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuFor(null);
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuFor]);

  useEffect(() => {
    return () => {
      if (statusTimer.current) window.clearTimeout(statusTimer.current);
    };
  }, []);

  function showStatus(message: string) {
    setStatus(message);
    if (statusTimer.current) window.clearTimeout(statusTimer.current);
    statusTimer.current = window.setTimeout(() => {
      setStatus(null);
      statusTimer.current = null;
    }, 4000);
  }

  async function addImages(files: File[]) {
    if (busy) return;

    setError(null);
    setBusy(true);
    try {
      await uploadBackgrounds(files);
      showStatus(
        files.length === 1 ? "Image added." : `${files.length} images added.`,
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove(path: string) {
    if (busy) return;

    setError(null);
    setBusy(true);
    try {
      await removeBackground(path);
      if (path === preview?.path) setPreview(null);
      if (path === deleteTarget?.path) setDeleteTarget(null);
      if (path === replacePath) setReplacePath(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      setDeleteTarget(null);
    } finally {
      setBusy(false);
    }
  }

  async function reorder(paths: string[]) {
    if (busy) return;

    setError(null);
    try {
      await reorderBackgrounds(paths);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  }

  async function download(background: CustomBackground) {
    if (busy) return;

    setError(null);
    try {
      await downloadBackground(background.path);
      showStatus("Saved to Downloads.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  }

  function moveBackground(path: string, delta: number) {
    if (busy) return;

    const paths = customBackgrounds.map((background) => background.path);
    const from = paths.indexOf(path);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= paths.length) return;

    const next = [...paths];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    void reorder(next);
  }

  function startReplace(path: string) {
    if (busy) return;
    setReplacePath(path);
    replaceInput.current?.click();
  }

  async function handleReplace(file: File) {
    if (!replacePath || busy) return;

    if (!(await isAcceptedImage(file))) {
      setError("Use PNG, JPEG, or WebP images up to 25 MB.");
      setReplacePath(null);
      return;
    }

    const path = replacePath;
    setReplacePath(null);
    setError(null);
    setBusy(true);
    try {
      await replaceBackground(path, file);
      if (preview?.path === path) setPreview(null);
      if (deleteTarget?.path === path) setDeleteTarget(null);
      showStatus("Image replaced.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  function handleDragEnter(event: DragEvent) {
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }

  function handleDragOver(event: DragEvent) {
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }

  async function handleDrop(event: DragEvent) {
    if (!event.dataTransfer.types.includes("Files") || busy) return;
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);

    const files = Array.from(event.dataTransfer.files);
    const images: File[] = [];
    for (const file of files) {
      if (await isAcceptedImage(file)) images.push(file);
    }

    if (images.length === 0) {
      setError("Use PNG, JPEG, or WebP images up to 25 MB.");
      return;
    }

    setError(
      images.length < files.length
        ? "Some files are not PNG, JPEG, or WebP and were skipped."
        : null,
    );
    setPendingFiles(images);
    setAddOpen(true);
  }

  function handleCardDragStart(event: DragEvent, path: string) {
    setMenuFor(null);
    draggingPathRef.current = path;
    setDraggingPath(path);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", path);
  }

  function handleCardDragOver(event: DragEvent, path: string) {
    const source = draggingPathRef.current;
    if (!source || source === path) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropPath(path);
  }

  function handleCardDrop(event: DragEvent, path: string) {
    const source = draggingPathRef.current;
    if (!source) return;
    event.preventDefault();
    event.stopPropagation();

    draggingPathRef.current = null;
    setDraggingPath(null);
    setDropPath(null);
    if (source === path) return;

    const paths = customBackgrounds.map((background) => background.path);
    const from = paths.indexOf(source);
    const to = paths.indexOf(path);
    if (from < 0 || to < 0) return;

    const next = [...paths];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    void reorder(next);
  }

  function handleCardDragEnd() {
    draggingPathRef.current = null;
    setDraggingPath(null);
    setDropPath(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Break card backgrounds</CardTitle>
        <CardDescription>
          Uploaded images replace the theme background on the break card.
        </CardDescription>
      </CardHeader>

      <CardContent
        className="space-y-3"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-between gap-4 pb-2">
          <label htmlFor="background-random" className="min-w-0">
            <span className="block text-sm font-medium">Random order</span>
            <span
              id="background-random-description"
              className="block text-xs leading-relaxed text-muted-foreground"
            >
              Choose images at random instead of using the gallery order.
            </span>
          </label>
          <Switch
            id="background-random"
            aria-label="Random order"
            aria-describedby="background-random-description"
            checked={settings.background_random}
            onCheckedChange={(background_random) =>
              update({ background_random })
            }
          />
        </div>

        {customBackgrounds.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 min-[900px]:grid-cols-3">
            {customBackgrounds.map((background, index) => (
              <div
                key={background.path}
                className={cn(
                  "relative rounded-[16px] transition-opacity",
                  draggingPath === background.path && "opacity-50",
                  dropPath === background.path &&
                    "ring-2 ring-primary/60 ring-offset-2 ring-offset-background",
                  menuFor === background.path && "ring-2 ring-primary/50",
                )}
                onDragOver={(event) => handleCardDragOver(event, background.path)}
                onDragLeave={() => {
                  if (dropPath === background.path) setDropPath(null);
                }}
                onDrop={(event) => handleCardDrop(event, background.path)}
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-[16px] border border-border/60 bg-black/10">
                  <button
                    type="button"
                    onClick={() => setPreview(background)}
                    aria-label="Preview image"
                    title="Open preview"
                    className="block h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50"
                  >
                    <img
                      src={background.url}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                    />
                  </button>

                  <span
                    draggable
                    onDragStart={(event) =>
                      handleCardDragStart(event, background.path)
                    }
                    onDragEnd={handleCardDragEnd}
                    title="Drag to reorder"
                    className="absolute left-1.5 top-1.5 grid size-7 cursor-grab place-items-center rounded-full border border-white/25 bg-black/55 text-white/90 backdrop-blur-sm active:cursor-grabbing"
                  >
                    <GripVertical className="size-3.5" />
                  </span>

                  <button
                    type="button"
                    data-background-menu
                    onClick={() =>
                      setMenuFor(
                        menuFor === background.path ? null : background.path,
                      )
                    }
                    aria-label="Image actions"
                    aria-expanded={menuFor === background.path}
                    title="Image actions"
                    className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full border border-white/25 bg-black/55 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </div>

                {menuFor === background.path ? (
                  <div
                    data-background-menu
                    role="menu"
                    aria-label="Image actions"
                    className="absolute right-0 top-9 z-30 w-44 rounded-xl border border-border/70 bg-popover p-1 text-popover-foreground shadow-xl"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <MenuItem
                      icon={Eye}
                      label="Preview"
                      onClick={() => {
                        setMenuFor(null);
                        setPreview(background);
                      }}
                    />
                    <MenuItem
                      icon={ImageUp}
                      label="Replace"
                      disabled={busy}
                      onClick={() => {
                        setMenuFor(null);
                        startReplace(background.path);
                      }}
                    />
                    <MenuItem
                      icon={ArrowUp}
                      label="Move up"
                      disabled={busy || index === 0}
                      onClick={() => {
                        setMenuFor(null);
                        moveBackground(background.path, -1);
                      }}
                    />
                    <MenuItem
                      icon={ArrowDown}
                      label="Move down"
                      disabled={busy || index === customBackgrounds.length - 1}
                      onClick={() => {
                        setMenuFor(null);
                        moveBackground(background.path, 1);
                      }}
                    />
                    <MenuItem
                      icon={Download}
                      label="Download"
                      disabled={busy}
                      onClick={() => {
                        setMenuFor(null);
                        void download(background);
                      }}
                    />
                    <div className="my-1 h-px bg-border/70" />
                    <MenuItem
                      icon={Trash2}
                      label="Delete"
                      destructive
                      disabled={busy}
                      onClick={() => {
                        setMenuFor(null);
                        setDeleteTarget(background);
                      }}
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setPendingFiles(undefined);
            setAddOpen(true);
          }}
          className={cn(
            "flex min-h-[112px] w-full flex-col items-center justify-center gap-1.5 rounded-[16px] border border-dashed px-4 py-4 text-center transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            dragging
              ? "border-primary bg-primary/10"
              : "border-border/70 bg-black/5 hover:border-foreground/30 hover:bg-black/10",
          )}
        >
          <span className="grid size-8 place-items-center rounded-full border border-border/60 bg-background/50 text-muted-foreground">
            <Plus className="size-4" />
          </span>
          <span className="text-sm font-medium">Add image</span>
          <span className="text-xs text-muted-foreground">
            PNG, JPEG, WEBP · up to 25 MB
          </span>
        </button>

        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}

        <input
          ref={replaceInput}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void handleReplace(file);
          }}
        />
      </CardContent>

      {addOpen ? (
        <AddImagesDialog
          initialFiles={pendingFiles}
          onAdd={addImages}
          onClose={() => {
            setAddOpen(false);
            setPendingFiles(undefined);
          }}
        />
      ) : null}

      {preview ? (
        <BackgroundPreviewDialog
          background={preview}
          busy={busy}
          onClose={() => setPreview(null)}
          onRemove={() => {
            const background = preview;
            setPreview(null);
            setDeleteTarget(background);
          }}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteBackgroundDialog
          background={deleteTarget}
          busy={busy}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void remove(deleteTarget.path)}
        />
      ) : null}
    </Card>
  );
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import {
  downloadCustomBackground,
  endBreak as endBreakCommand,
  getCustomBackgrounds,
  getState,
  removeCustomBackground,
  reorderCustomBackgrounds,
  replaceCustomBackground,
  resetSettings,
  saveCustomBackground,
  snooze as snoozeCommand,
  toggleBreakPause as toggleBreakPauseCommand,
  togglePause as togglePauseCommand,
  updateSettings,
} from "./tauri";
import { isAcceptedImage } from "./background";
import { applyTheme } from "./theme";
import type { CustomBackground, SchedulerSnapshot, Settings } from "./types";

interface AppStateValue {
  settings: Settings | null;
  snapshot: SchedulerSnapshot | null;
  customBackgrounds: CustomBackground[];
  error: string | null;
  retry: () => void;
  update: (patch: Partial<Settings>) => void;
  reset: () => Promise<void>;
  togglePause: () => Promise<void>;
  snooze: (minutes: number) => Promise<void>;
  endBreak: () => Promise<void>;
  toggleBreakPause: () => Promise<void>;
  uploadBackgrounds: (files: File[]) => Promise<void>;
  removeBackground: (path: string) => Promise<void>;
  reorderBackgrounds: (paths: string[]) => Promise<void>;
  replaceBackground: (path: string, file: File) => Promise<void>;
  downloadBackground: (path: string) => Promise<string>;
}

export class BackgroundUploadError extends Error {
  readonly saved: number;

  constructor(message: string, saved: number) {
    super(message);
    this.name = "BackgroundUploadError";
    this.saved = saved;
  }
}

const AppStateContext = createContext<AppStateValue | null>(null);
const SAVE_DELAY_MS = 250;

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Cannot read the image."));
    reader.readAsDataURL(file);
  });
}

function toCustomBackgrounds(paths: string[]): CustomBackground[] {
  return paths.map((path) => ({ path, url: convertFileSrc(path) }));
}

function toMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : String(reason);
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [snapshot, setSnapshot] = useState<SchedulerSnapshot | null>(null);
  const [customBackgrounds, setCustomBackgrounds] = useState<CustomBackground[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const settingsRef = useRef<Settings | null>(null);
  const revisionRef = useRef(0);
  const hasPendingSave = useRef(false);
  const updateVersion = useRef(0);
  const saveTimer = useRef<number | null>(null);

  const applySnapshot = useCallback((next: SchedulerSnapshot) => {
    revisionRef.current = Math.max(revisionRef.current, next.revision);
    settingsRef.current = next.settings;
    setSettings(next.settings);
    setSnapshot(next);
    applyTheme(next.settings.theme, next.settings.appearance);
  }, []);

  const loadState = useCallback(() => {
    setError(null);

    getState()
      .then(applySnapshot)
      .catch((reason) => {
        setError(toMessage(reason));
      });

    getCustomBackgrounds()
      .then((paths) => {
        setCustomBackgrounds(toCustomBackgrounds(paths));
      })
      .catch((reason) => console.error(reason));
  }, [applySnapshot]);

  useEffect(() => {
    let disposed = false;
    let stopScheduler: UnlistenFn | undefined;
    let stopBackground: UnlistenFn | undefined;

    loadState();

    listen<SchedulerSnapshot>("scheduler:update", (event) => {
      if (disposed) return;

      const next = event.payload;
      if (next.revision < revisionRef.current) return;

      revisionRef.current = next.revision;
      setSnapshot(next);

      if (!hasPendingSave.current) {
        settingsRef.current = next.settings;
        setSettings(next.settings);
        applyTheme(next.settings.theme, next.settings.appearance);
      }
    })
      .then((stop) => {
        if (disposed) stop();
        else stopScheduler = stop;
      })
      .catch((reason) => {
        if (!disposed) console.error(reason);
      });

    listen<string[]>("custom-background:update", (event) => {
      if (!disposed) {
        setCustomBackgrounds(toCustomBackgrounds(event.payload));
      }
    })
      .then((stop) => {
        if (disposed) stop();
        else stopBackground = stop;
      })
      .catch((reason) => {
        if (!disposed) console.error(reason);
      });

    return () => {
      disposed = true;
      stopScheduler?.();
      stopBackground?.();
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, [loadState]);

  const update = useCallback((patch: Partial<Settings>) => {
    const current = settingsRef.current;
    if (!current) return;

    const next = { ...current, ...patch };
    settingsRef.current = next;
    setSettings(next);
    applyTheme(next.theme, next.appearance);

    hasPendingSave.current = true;
    const version = ++updateVersion.current;

    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = null;

      updateSettings(next)
        .then((result) => {
          if (version !== updateVersion.current) return;
          hasPendingSave.current = false;
          if (result.revision < revisionRef.current) return;
          revisionRef.current = result.revision;
          settingsRef.current = result.settings;
          setSettings(result.settings);
          setSnapshot(result);
          applyTheme(result.settings.theme, result.settings.appearance);
        })
        .catch((reason) => {
          if (version !== updateVersion.current) return;
          hasPendingSave.current = false;
          console.error(reason);
          settingsRef.current = current;
          setSettings(current);
          applyTheme(current.theme, current.appearance);
        });
    }, SAVE_DELAY_MS);
  }, []);

  const applyResult = useCallback((result: SchedulerSnapshot) => {
    if (result.revision < revisionRef.current) return;
    revisionRef.current = result.revision;
    settingsRef.current = result.settings;
    setSettings(result.settings);
    setSnapshot(result);
    applyTheme(result.settings.theme, result.settings.appearance);
  }, []);

  const reset = useCallback(async () => {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    hasPendingSave.current = false;
    updateVersion.current += 1;

    applyResult(await resetSettings());
  }, [applyResult]);

  const togglePause = useCallback(async () => {
    try {
      applyResult(await togglePauseCommand());
    } catch (reason) {
      console.error(reason);
    }
  }, [applyResult]);

  const snooze = useCallback(
    async (minutes: number) => {
      try {
        applyResult(await snoozeCommand(minutes));
      } catch (reason) {
        console.error(reason);
      }
    },
    [applyResult],
  );

  const endBreak = useCallback(async () => {
    try {
      applyResult(await endBreakCommand());
    } catch (reason) {
      console.error(reason);
    }
  }, [applyResult]);

  const toggleBreakPause = useCallback(async () => {
    try {
      applyResult(await toggleBreakPauseCommand());
    } catch (reason) {
      console.error(reason);
    }
  }, [applyResult]);

  const uploadBackgrounds = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    let paths: string[] = [];
    let saved = 0;

    for (const file of files) {
      if (!(await isAcceptedImage(file))) {
        throw new BackgroundUploadError(
          "Use PNG, JPEG, or WebP images up to 25 MB.",
          saved,
        );
      }

      try {
        paths = await saveCustomBackground(await readFile(file));
        saved += 1;
      } catch (reason) {
        try {
          setCustomBackgrounds(
            toCustomBackgrounds(await getCustomBackgrounds()),
          );
        } catch {
          // The next list refresh will reconcile the gallery.
        }
        throw new BackgroundUploadError(toMessage(reason), saved);
      }
    }

    setCustomBackgrounds(toCustomBackgrounds(paths));
  }, []);

  const removeBackground = useCallback(async (path: string) => {
    const paths = await removeCustomBackground(path);
    setCustomBackgrounds(toCustomBackgrounds(paths));
  }, []);

  const reorderBackgrounds = useCallback(async (paths: string[]) => {
    const next = await reorderCustomBackgrounds(paths);
    setCustomBackgrounds(toCustomBackgrounds(next));
  }, []);

  const replaceBackground = useCallback(async (path: string, file: File) => {
    if (!(await isAcceptedImage(file))) {
      throw new Error("Use PNG, JPEG, or WebP images up to 25 MB.");
    }

    const paths = await replaceCustomBackground(path, await readFile(file));
    setCustomBackgrounds(toCustomBackgrounds(paths));
  }, []);

  const downloadBackground = useCallback((path: string) => {
    return downloadCustomBackground(path);
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        settings,
        snapshot,
        customBackgrounds,
        error,
        retry: loadState,
        update,
        reset,
        togglePause,
        snooze,
        endBreak,
        toggleBreakPause,
        uploadBackgrounds,
        removeBackground,
        reorderBackgrounds,
        replaceBackground,
        downloadBackground,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) {
    throw new Error("useAppState must be used inside AppStateProvider.");
  }
  return value;
}

export function useSettings() {
  const state = useAppState();
  if (!state.settings) {
    throw new Error("Settings are not loaded.");
  }
  return { ...state, settings: state.settings };
}

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
  endBreak as endBreakCommand,
  getCustomBackground,
  getState,
  removeCustomBackground,
  resetSettings,
  saveCustomBackground,
  showNow as showNowCommand,
  snooze as snoozeCommand,
  toggleBreakPause as toggleBreakPauseCommand,
  togglePause as togglePauseCommand,
  updateSettings,
} from "./tauri";
import { applyTheme } from "./theme";
import type { SchedulerSnapshot, Settings } from "./types";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

interface AppStateValue {
  settings: Settings | null;
  snapshot: SchedulerSnapshot | null;
  customBackground: string | null;
  error: string | null;
  update: (patch: Partial<Settings>) => void;
  reset: () => Promise<void>;
  togglePause: () => Promise<void>;
  showNow: () => Promise<void>;
  snooze: (minutes: number) => Promise<void>;
  endBreak: () => Promise<void>;
  toggleBreakPause: () => Promise<void>;
  uploadBackground: (file: File) => Promise<void>;
  removeBackground: () => Promise<void>;
}

const AppStateContext = createContext<AppStateValue | null>(null);

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Cannot read the image."));
    reader.readAsDataURL(file);
  });
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [snapshot, setSnapshot] = useState<SchedulerSnapshot | null>(null);
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const settingsRef = useRef<Settings | null>(null);

  useEffect(() => {
    let disposed = false;
    let stopScheduler: UnlistenFn | undefined;
    let stopBackground: UnlistenFn | undefined;

    getState()
      .then((next) => {
        if (disposed) return;
        settingsRef.current = next.settings;
        setSettings(next.settings);
        setSnapshot(next);
        applyTheme(next.settings.theme, next.settings.appearance);
      })
      .catch((reason) => {
        if (!disposed) {
          setError(reason instanceof Error ? reason.message : String(reason));
        }
      });

    getCustomBackground()
      .then((path) => {
        if (!disposed) {
          setCustomBackground(path ? convertFileSrc(path) : null);
        }
      })
      .catch((reason) => console.error(reason));

    listen<SchedulerSnapshot>("scheduler:update", (event) => {
      if (!disposed) setSnapshot(event.payload);
    }).then((stop) => {
      if (disposed) stop();
      else stopScheduler = stop;
    });

    listen<string | null>("custom-background:update", (event) => {
      if (!disposed) {
        setCustomBackground(
          event.payload ? convertFileSrc(event.payload) : null,
        );
      }
    }).then((stop) => {
      if (disposed) stop();
      else stopBackground = stop;
    });

    return () => {
      disposed = true;
      stopScheduler?.();
      stopBackground?.();
    };
  }, []);

  useEffect(() => {
    if (!snapshot) return;
    applyTheme(snapshot.settings.theme, snapshot.settings.appearance);
  }, [snapshot?.settings.theme, snapshot?.settings.appearance]);

  const update = useCallback((patch: Partial<Settings>) => {
    const current = settingsRef.current;
    if (!current) return;

    const next = { ...current, ...patch };
    settingsRef.current = next;
    setSettings(next);
    applyTheme(next.theme, next.appearance);

    updateSettings(next)
      .then((result) => {
        settingsRef.current = result.settings;
        setSettings(result.settings);
        setSnapshot(result);
      })
      .catch((reason) => {
        console.error(reason);
        settingsRef.current = current;
        setSettings(current);
        applyTheme(current.theme, current.appearance);
      });
  }, []);

  const reset = useCallback(async () => {
    try {
      const result = await resetSettings();
      settingsRef.current = result.settings;
      setSettings(result.settings);
      setSnapshot(result);
      applyTheme(result.settings.theme, result.settings.appearance);
    } catch (reason) {
      console.error(reason);
    }
  }, []);

  const togglePause = useCallback(async () => {
    try {
      setSnapshot(await togglePauseCommand());
    } catch (reason) {
      console.error(reason);
    }
  }, []);

  const showNow = useCallback(async () => {
    try {
      setSnapshot(await showNowCommand());
    } catch (reason) {
      console.error(reason);
    }
  }, []);

  const snooze = useCallback(async (minutes: number) => {
    try {
      setSnapshot(await snoozeCommand(minutes));
    } catch (reason) {
      console.error(reason);
    }
  }, []);

  const endBreak = useCallback(async () => {
    try {
      setSnapshot(await endBreakCommand());
    } catch (reason) {
      console.error(reason);
    }
  }, []);

  const toggleBreakPause = useCallback(async () => {
    try {
      setSnapshot(await toggleBreakPauseCommand());
    } catch (reason) {
      console.error(reason);
    }
  }, []);

  const uploadBackground = useCallback(async (file: File) => {
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error("The image is larger than 8 MB.");
    }

    const data = await readFile(file);
    const path = await saveCustomBackground(data);
    setCustomBackground(convertFileSrc(path));
  }, []);

  const removeBackground = useCallback(async () => {
    await removeCustomBackground();
    setCustomBackground(null);
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        settings,
        snapshot,
        customBackground,
        error,
        update,
        reset,
        togglePause,
        showNow,
        snooze,
        endBreak,
        toggleBreakPause,
        uploadBackground,
        removeBackground,
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

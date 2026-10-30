import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getVersion } from "@tauri-apps/api/app";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";

export type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "current"
  | "downloading"
  | "installing"
  | "error";

interface UpdaterState {
  status: UpdateStatus;
  currentVersion: string;
  version: string | null;
  notes: string | null;
  progress: number | null;
  error: string | null;
  dismissed: boolean;
}

interface UpdaterValue extends UpdaterState {
  checkNow: (manual?: boolean) => Promise<void>;
  install: () => Promise<void>;
  dismiss: () => void;
}

const INITIAL_STATE: UpdaterState = {
  status: "idle",
  currentVersion: "",
  version: null,
  notes: null,
  progress: null,
  error: null,
  dismissed: false,
};

const UpdaterContext = createContext<UpdaterValue | null>(null);

function toMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : String(reason);
}

export function UpdateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UpdaterState>(INITIAL_STATE);
  const updateRef = useRef<Update | null>(null);
  const busyRef = useRef(false);

  const checkNow = useCallback(async (manual = false) => {
    if (busyRef.current) return;
    busyRef.current = true;

    setState((current) => ({
      ...current,
      status: "checking",
      error: null,
      progress: null,
      dismissed: manual ? false : current.dismissed,
    }));

    try {
      const update = await check({ timeout: 20000 });
      const previous = updateRef.current;
      updateRef.current = update;

      if (previous) {
        void previous.close().catch(() => {});
      }

      if (update) {
        setState((current) => ({
          ...current,
          status: "available",
          version: update.version,
          notes: update.body ?? null,
          error: null,
          progress: null,
          dismissed: false,
        }));
      } else {
        setState((current) => ({
          ...current,
          status: "current",
          version: null,
          notes: null,
          error: null,
          progress: null,
        }));
      }
    } catch (reason) {
      setState((current) => ({
        ...current,
        status: "error",
        error: toMessage(reason),
        progress: null,
      }));
    } finally {
      busyRef.current = false;
    }
  }, []);

  const install = useCallback(async () => {
    const update = updateRef.current;
    if (!update || busyRef.current) return;
    busyRef.current = true;

    setState((current) => ({
      ...current,
      status: "downloading",
      progress: 0,
      error: null,
      dismissed: false,
    }));

    try {
      let total = 0;
      let downloaded = 0;

      await update.downloadAndInstall(
        (event) => {
          if (event.event === "Started") {
            total = event.data.contentLength ?? 0;
            downloaded = 0;
            setState((current) => ({ ...current, progress: total > 0 ? 0 : null }));
          } else if (event.event === "Progress") {
            downloaded += event.data.chunkLength;
            setState((current) => ({
              ...current,
              progress:
                total > 0
                  ? Math.min(100, Math.round((downloaded / total) * 100))
                  : null,
            }));
          } else if (event.event === "Finished") {
            setState((current) => ({
              ...current,
              status: "installing",
              progress: 100,
            }));
          }
        },
        { restartAfterInstall: true },
      );

      await relaunch();
    } catch (reason) {
      setState((current) => ({
        ...current,
        status: "error",
        error: toMessage(reason),
      }));
    } finally {
      busyRef.current = false;
    }
  }, []);

  const dismiss = useCallback(() => {
    setState((current) => ({ ...current, dismissed: true }));
  }, []);

  useEffect(() => {
    let disposed = false;

    getVersion()
      .then((version) => {
        if (!disposed) {
          setState((current) => ({ ...current, currentVersion: version }));
        }
      })
      .catch(() => {});

    if (!import.meta.env.PROD) {
      return () => {
        disposed = true;
      };
    }

    const timer = window.setTimeout(() => {
      void checkNow();
    }, 5000);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
    };
  }, [checkNow]);

  useEffect(() => {
    return () => {
      const update = updateRef.current;
      updateRef.current = null;
      if (update) void update.close().catch(() => {});
    };
  }, []);

  return (
    <UpdaterContext.Provider
      value={{ ...state, checkNow, install, dismiss }}
    >
      {children}
    </UpdaterContext.Provider>
  );
}

export function useUpdater() {
  const value = useContext(UpdaterContext);
  if (!value) {
    throw new Error("useUpdater must be used inside UpdateProvider.");
  }
  return value;
}

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { BreakArt } from "@/components/art/BreakArt";
import { TitleBar } from "@/components/TitleBar";
import { AdvancedSettings } from "@/components/settings/AdvancedSettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { BreakSettings } from "@/components/settings/BreakSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import {
  SettingsSidebar,
  SETTINGS_TABS,
  type SettingsTab,
} from "@/components/settings/SettingsSidebar";
import { SoundSettings } from "@/components/settings/SoundSettings";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { formatCountdown, formatTimer } from "@/lib/format";
import {
  getState,
  quitApp,
  resetSettings,
  showNow as showNowCommand,
  togglePause as togglePauseCommand,
  updateSettings,
} from "@/lib/tauri";
import { applyTheme } from "@/lib/theme";
import type { SchedulerSnapshot, Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

const TAB_DESCRIPTIONS: Record<SettingsTab, string> = {
  break: "Your current state and schedule.",
  themes: "Choose the atmosphere for your breaks.",
  notifications: "Decide what the reminder card shows.",
  appearance: "Place the card where you want it.",
  sounds: "Play a soft signal when a break starts.",
  advanced: "Reset, app info, and quit.",
};

function statusText(snapshot: SchedulerSnapshot | null) {
  if (!snapshot) return "Loading";
  if (snapshot.paused) {
    return `Paused · ${formatCountdown(snapshot.pause_remaining)}`;
  }
  if (snapshot.phase === "break") {
    return `On a break · ${formatTimer(snapshot.remaining)}`;
  }
  return `Next break in ${formatCountdown(snapshot.next_in)}`;
}

export function SettingsApp() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [snapshot, setSnapshot] = useState<SchedulerSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<SettingsTab>("break");
  const settingsRef = useRef<Settings | null>(null);

  useEffect(() => {
    let disposed = false;
    let unlisten: UnlistenFn | undefined;

    getState()
      .then((next) => {
        if (disposed) return;
        settingsRef.current = next.settings;
        setSettings(next.settings);
        setSnapshot(next);
        applyTheme(next.settings.theme, next.settings.appearance);
      })
      .catch((err) => {
        if (!disposed) {
          setError(err instanceof Error ? err.message : String(err));
        }
      });

    listen<SchedulerSnapshot>("scheduler:update", (event) => {
      if (!disposed) setSnapshot(event.payload);
    }).then((stop) => {
      if (disposed) stop();
      else unlisten = stop;
    });

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, []);

  function save(patch: Partial<Settings>) {
    const current = settingsRef.current;
    if (!current) return;

    const next = { ...current, ...patch };
    settingsRef.current = next;
    setSettings(next);
    applyTheme(next.theme, next.appearance);

    updateSettings(next)
      .then((result) => setSnapshot(result))
      .catch((err) => console.error(err));
  }

  async function handleReset() {
    try {
      const result = await resetSettings();
      settingsRef.current = result.settings;
      setSettings(result.settings);
      setSnapshot(result);
      applyTheme(result.settings.theme, result.settings.appearance);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleTogglePause() {
    try {
      setSnapshot(await togglePauseCommand());
    } catch (err) {
      console.error(err);
    }
  }

  async function handleShowNow() {
    try {
      setSnapshot(await showNowCommand());
    } catch (err) {
      console.error(err);
    }
  }

  function handleQuit() {
    void quitApp();
  }

  function handleResize(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    try {
      void getCurrentWindow()
        .startResizeDragging("SouthEast")
        .catch(() => {});
    } catch {
      // The app runs outside Tauri during UI development.
    }
  }

  if (error) {
    return (
      <div className="relative grid h-screen place-items-center p-6 text-center">
        <div className="app-backdrop" aria-hidden="true" />
        <div className="glass-panel relative max-w-md space-y-2 rounded-[22px] p-6">
          <h1 className="text-lg font-semibold">Cannot connect to Tauri</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="relative grid h-screen place-items-center text-sm text-muted-foreground">
        <div className="app-backdrop" aria-hidden="true" />
        <span className="relative">Loading…</span>
      </div>
    );
  }

  const activeTab =
    SETTINGS_TABS.find((item) => item.id === tab) ?? SETTINGS_TABS[0];
  const active = Boolean(snapshot && !snapshot.paused);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <div
        className="pointer-events-none absolute inset-0 scale-110 opacity-25 blur-2xl dark:opacity-35"
        aria-hidden="true"
      >
        <BreakArt theme={settings.theme} />
      </div>
      <div className="app-backdrop" aria-hidden="true" />

      <TitleBar section={activeTab.label} />

      <div className="relative z-10 flex min-h-0 flex-1">
        <SettingsSidebar
          tab={tab}
          onTabChange={setTab}
          theme={settings.theme}
          paused={snapshot?.paused ?? false}
          phase={snapshot?.phase ?? "idle"}
        />

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-start justify-between gap-4 px-7 pb-5 pt-6">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                Settings
              </p>
              <h1 className="mt-1 text-[26px] font-semibold tracking-tight">
                {activeTab.label}
              </h1>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {TAB_DESCRIPTIONS[tab]}
              </p>
            </div>

            <div className="mt-1 flex shrink-0 items-center gap-2 rounded-full border border-border/70 bg-background/30 px-3 py-1.5 text-[11px] font-medium text-muted-foreground backdrop-blur">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  active ? "bg-primary" : "bg-muted-foreground/60",
                )}
              />
              {statusText(snapshot)}
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-8">
            {tab === "break" ? (
              <BreakSettings
                settings={settings}
                snapshot={snapshot}
                onChange={save}
                onTogglePause={handleTogglePause}
                onShowNow={handleShowNow}
              />
            ) : null}

            {tab === "themes" ? (
              <ThemeSettings settings={settings} onChange={save} />
            ) : null}

            {tab === "notifications" ? (
              <NotificationSettings settings={settings} onChange={save} />
            ) : null}

            {tab === "appearance" ? (
              <AppearanceSettings settings={settings} onChange={save} />
            ) : null}

            {tab === "sounds" ? (
              <SoundSettings settings={settings} onChange={save} />
            ) : null}

            {tab === "advanced" ? (
              <AdvancedSettings
                settings={settings}
                onReset={() => void handleReset()}
                onQuit={handleQuit}
              />
            ) : null}
          </div>
        </main>
      </div>

      <button
        type="button"
        tabIndex={-1}
        aria-label="Resize window"
        onMouseDown={handleResize}
        className="absolute bottom-0 right-0 z-50 size-4 cursor-nwse-resize bg-transparent"
      />
    </div>
  );
}

import { useState, type MouseEvent } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { BreakArt } from "@/components/art/BreakArt";
import { TitleBar } from "@/components/TitleBar";
import { AboutSettings } from "@/components/settings/AboutSettings";
import { CardSettings } from "@/components/settings/CardSettings";
import { ScheduleSettings } from "@/components/settings/ScheduleSettings";
import {
  SettingsSidebar,
  SETTINGS_TABS,
  type SettingsTab,
} from "@/components/settings/SettingsSidebar";
import { SoundSettings } from "@/components/settings/SoundSettings";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/appState";

const TAB_DESCRIPTIONS: Record<SettingsTab, string> = {
  schedule: "Choose how often breaks appear and how long they last.",
  card: "Choose the break card layout and controls.",
  themes: "Choose colors and backgrounds.",
  sound: "Play a sound when a break starts.",
  about: "App version, updates, and default settings.",
};

export function SettingsApp() {
  const { settings, error, retry } = useAppState();
  const [tab, setTab] = useState<SettingsTab>("schedule");

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

  const activeTab =
    SETTINGS_TABS.find((item) => item.id === tab) ?? SETTINGS_TABS[0];

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background text-foreground">
      {settings ? (
        <div
          className="pointer-events-none absolute inset-0 scale-110 opacity-25 blur-2xl dark:opacity-35"
          aria-hidden="true"
        >
          <BreakArt theme={settings.theme} />
        </div>
      ) : null}
      <div className="app-backdrop" aria-hidden="true" />

      <TitleBar section={activeTab.label} />

      <div className="relative z-10 flex min-h-0 flex-1">
        <SettingsSidebar tab={tab} onTabChange={setTab} />

        {error ? (
          <main className="flex min-h-0 min-w-0 flex-1 items-center justify-center p-6">
            <div className="glass-panel max-w-md space-y-3 rounded-[22px] p-6 text-center">
              <h1 className="text-lg font-semibold">Cannot connect to Tauri</h1>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button size="sm" onClick={retry}>
                Retry
              </Button>
            </div>
          </main>
        ) : !settings ? (
          <main className="flex min-h-0 min-w-0 flex-1 items-center justify-center text-sm text-muted-foreground">
            <span>Loading…</span>
          </main>
        ) : (
          <main className="flex min-h-0 min-w-0 flex-1 flex-col">
            <header className="shrink-0 px-5 pb-5 pt-6 min-[900px]:px-7">
              <div className="min-w-0">
                <h1 className="text-[26px] font-semibold tracking-tight">
                  {activeTab.label}
                </h1>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  {TAB_DESCRIPTIONS[activeTab.id]}
                </p>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 min-[900px]:px-7 min-[900px]:pb-7">
              {tab === "schedule" ? <ScheduleSettings /> : null}
              {tab === "card" ? <CardSettings /> : null}
              {tab === "themes" ? <ThemeSettings /> : null}
              {tab === "sound" ? <SoundSettings /> : null}
              {tab === "about" ? <AboutSettings /> : null}
            </div>
          </main>
        )}
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

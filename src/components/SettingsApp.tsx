import { useState, type MouseEvent } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { BreakArt } from "@/components/art/BreakArt";
import { TitleBar } from "@/components/TitleBar";
import { AboutSettings } from "@/components/settings/AboutSettings";
import { CardSettings } from "@/components/settings/CardSettings";
import { OverviewSettings } from "@/components/settings/OverviewSettings";
import { ScheduleSettings } from "@/components/settings/ScheduleSettings";
import {
  SettingsSidebar,
  SETTINGS_TABS,
  type SettingsTab,
} from "@/components/settings/SettingsSidebar";
import { SoundSettings } from "@/components/settings/SoundSettings";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { useAppState } from "@/lib/appState";

const TAB_DESCRIPTIONS: Record<SettingsTab, string> = {
  overview: "Your current state and schedule.",
  schedule: "Choose how often breaks appear and how long they last.",
  card: "Choose what the reminder card shows and where it appears.",
  themes: "Choose the atmosphere for your breaks.",
  sound: "Play a soft signal when a break starts.",
  about: "Version, updates, and reset.",
};

export function SettingsApp() {
  const { settings, error } = useAppState();
  const [tab, setTab] = useState<SettingsTab>("overview");

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
        <SettingsSidebar tab={tab} onTabChange={setTab} />

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
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-8">
            {tab === "overview" ? <OverviewSettings /> : null}
            {tab === "schedule" ? <ScheduleSettings /> : null}
            {tab === "card" ? <CardSettings /> : null}
            {tab === "themes" ? <ThemeSettings /> : null}
            {tab === "sound" ? <SoundSettings /> : null}
            {tab === "about" ? <AboutSettings /> : null}
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

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppStateProvider, useAppState } from "./appState";
import type { SchedulerSnapshot, Settings } from "./types";

const mocks = vi.hoisted(() => ({
  getState: vi.fn(),
  getCustomBackgrounds: vi.fn(),
  updateSettings: vi.fn(),
  saveCustomBackground: vi.fn(),
  removeCustomBackground: vi.fn(),
  reorderCustomBackgrounds: vi.fn(),
  replaceCustomBackground: vi.fn(),
  resetSettings: vi.fn(),
  downloadCustomBackground: vi.fn(),
  snooze: vi.fn(),
  endBreak: vi.fn(),
  toggleBreakPause: vi.fn(),
  togglePause: vi.fn(),
  listen: vi.fn(),
}));

vi.mock("./tauri", () => ({
  getState: mocks.getState,
  getCustomBackgrounds: mocks.getCustomBackgrounds,
  updateSettings: mocks.updateSettings,
  saveCustomBackground: mocks.saveCustomBackground,
  removeCustomBackground: mocks.removeCustomBackground,
  reorderCustomBackgrounds: mocks.reorderCustomBackgrounds,
  replaceCustomBackground: mocks.replaceCustomBackground,
  resetSettings: mocks.resetSettings,
  downloadCustomBackground: mocks.downloadCustomBackground,
  snooze: mocks.snooze,
  endBreak: mocks.endBreak,
  toggleBreakPause: mocks.toggleBreakPause,
  togglePause: mocks.togglePause,
}));

vi.mock("@tauri-apps/api/event", () => ({ listen: mocks.listen }));
vi.mock("@tauri-apps/api/core", () => ({
  convertFileSrc: (path: string) => `asset://${path}`,
}));

const settings: Settings = {
  schema_version: 1,
  microbreak_interval_min: 10,
  microbreak_duration_sec: 20,
  long_break_duration_min: 5,
  long_break_every: 3,
  theme: "cozy",
  appearance: "dark",
  sound: true,
  sound_tone: "chime",
  sound_volume: 60,
  position: "bottom-right",
  notification_size: "normal",
  card_orientation: "horizontal",
  show_countdown: true,
  allow_snooze: true,
  show_stop: true,
  background_random: false,
};

const snapshot: SchedulerSnapshot = {
  phase: "idle",
  kind: "micro",
  remaining: 0,
  duration: 0,
  next_in: 600,
  breaks_done: 0,
  paused: false,
  break_paused: false,
  revision: 1,
  settings,
};

function Probe() {
  const { settings: current, snapshot: state, error, retry, update } =
    useAppState();

  return (
    <div>
      <span data-testid="settings">{current?.theme ?? "none"}</span>
      <span data-testid="revision">{state?.revision ?? 0}</span>
      <span data-testid="error">{error ?? ""}</span>
      <button onClick={retry}>retry</button>
      <button onClick={() => update({ theme: "night" })}>night</button>
    </div>
  );
}

function renderProvider() {
  return render(
    <AppStateProvider>
      <Probe />
    </AppStateProvider>,
  );
}

describe("AppStateProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mocks.getState.mockResolvedValue(snapshot);
    mocks.getCustomBackgrounds.mockResolvedValue([]);
    mocks.listen.mockResolvedValue(() => {});
  });

  it("loads the snapshot and renders the settings", async () => {
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("settings")).toHaveTextContent("cozy");
      expect(screen.getByTestId("revision")).toHaveTextContent("1");
    });
  });

  it("recovers from a failed first load through retry", async () => {
    mocks.getState
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValue(snapshot);

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("boom");
    });

    fireEvent.click(screen.getByText("retry"));

    await waitFor(() => {
      expect(screen.getByTestId("settings")).toHaveTextContent("cozy");
      expect(screen.getByTestId("error")).toBeEmptyDOMElement();
    });
  });

  it("applies a settings change immediately and saves it once", async () => {
    mocks.updateSettings.mockResolvedValue({
      ...snapshot,
      revision: 2,
      settings: { ...settings, theme: "night" },
    });

    renderProvider();
    await waitFor(() => {
      expect(screen.getByTestId("settings")).toHaveTextContent("cozy");
    });

    fireEvent.click(screen.getByText("night"));

    expect(screen.getByTestId("settings")).toHaveTextContent("night");

    await waitFor(() => {
      expect(mocks.updateSettings).toHaveBeenCalledTimes(1);
    });
    expect(mocks.updateSettings.mock.calls[0][0]).toMatchObject({
      theme: "night",
    });
  });
});

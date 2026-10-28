import { invoke } from "@tauri-apps/api/core";
import type { SchedulerSnapshot, Settings } from "./types";

export function getState() {
  return invoke<SchedulerSnapshot>("get_state");
}

export function updateSettings(settings: Settings) {
  return invoke<SchedulerSnapshot>("update_settings", { settings });
}

export function snooze(minutes = 5) {
  return invoke<SchedulerSnapshot>("snooze", { minutes });
}

export function endBreak() {
  return invoke<SchedulerSnapshot>("end_break");
}

export function toggleBreakPause() {
  return invoke<SchedulerSnapshot>("toggle_break_pause");
}

export function togglePause() {
  return invoke<SchedulerSnapshot>("toggle_pause");
}

export function showNow() {
  return invoke<SchedulerSnapshot>("show_now");
}

export function resetSettings() {
  return invoke<SchedulerSnapshot>("reset_settings");
}

export function quitApp() {
  return invoke<void>("quit_app");
}

import { invoke } from "@tauri-apps/api/core";
import type { SchedulerSnapshot, Settings } from "./types";

export function getState() {
  return invoke<SchedulerSnapshot>("get_state");
}

export function getCustomBackground() {
  return invoke<string | null>("get_custom_background");
}

export function saveCustomBackground(data: string) {
  return invoke<string>("save_custom_background", { data });
}

export function removeCustomBackground() {
  return invoke<void>("remove_custom_background");
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

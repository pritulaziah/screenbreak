export type ThemeId = "cozy" | "night" | "nature";
export type Appearance = "light" | "dark";
export type Position =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";
export type NotificationSize = "compact" | "normal" | "large";
export type CardOrientation = "horizontal" | "vertical";
export type SoundTone = "chime" | "bell" | "soft";
export type Phase = "idle" | "break";
export type BreakKind = "micro" | "long";

export interface Settings {
  microbreak_interval_min: number;
  microbreak_duration_sec: number;
  long_break_duration_min: number;
  long_break_every: number;
  theme: ThemeId;
  appearance: Appearance;
  sound: boolean;
  sound_tone: SoundTone;
  sound_volume: number;
  position: Position;
  notification_size: NotificationSize;
  card_orientation: CardOrientation;
  show_countdown: boolean;
  allow_snooze: boolean;
  show_stop: boolean;
}

export interface SchedulerSnapshot {
  phase: Phase;
  kind: BreakKind;
  remaining: number;
  duration: number;
  next_in: number;
  breaks_done: number;
  paused: boolean;
  break_paused: boolean;
  pause_remaining: number;
  settings: Settings;
}

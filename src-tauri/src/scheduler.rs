use crate::settings::Settings;
use serde::Serialize;
use std::time::{Duration, SystemTime};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Phase {
    Idle,
    Break,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum BreakKind {
    Micro,
    Long,
}

#[derive(Clone, Debug, Serialize)]
pub struct Snapshot {
    pub phase: Phase,
    pub kind: BreakKind,
    pub remaining: u64,
    pub duration: u64,
    pub next_in: u64,
    pub breaks_done: u64,
    pub paused: bool,
    pub break_paused: bool,
    pub revision: u64,
    pub settings: Settings,
}

pub struct Scheduler {
    pub settings: Settings,
    phase: Phase,
    kind: BreakKind,
    remaining: u64,
    duration: u64,
    next_in: u64,
    breaks_done: u64,
    break_paused: bool,
    paused_until: Option<SystemTime>,
    revision: u64,
}

impl Scheduler {
    pub fn new(settings: Settings) -> Self {
        let next_in = settings.microbreak_interval_min * 60;

        Self {
            settings,
            phase: Phase::Idle,
            kind: BreakKind::Micro,
            remaining: 0,
            duration: 0,
            next_in,
            breaks_done: 0,
            break_paused: false,
            paused_until: None,
            revision: 0,
        }
    }

    pub fn snapshot(&self) -> Snapshot {
        let now = SystemTime::now();

        Snapshot {
            phase: self.phase,
            kind: self.kind,
            remaining: self.remaining,
            duration: self.duration,
            next_in: self.next_in,
            breaks_done: self.breaks_done,
            paused: self.is_paused(now),
            break_paused: self.break_paused,
            revision: self.revision,
            settings: self.settings.clone(),
        }
    }

    fn bump(&mut self) {
        self.revision = self.revision.wrapping_add(1);
    }

    pub fn is_paused(&self, now: SystemTime) -> bool {
        self.paused_until.map(|until| until > now).unwrap_or(false)
    }

    pub fn tick(&mut self, now: SystemTime) {
        if self.is_paused(now) {
            return;
        }

        if self.paused_until.is_some() {
            self.paused_until = None;
        }

        match self.phase {
            Phase::Idle => {
                if self.next_in > 0 {
                    self.next_in -= 1;
                }
                if self.next_in == 0 {
                    self.begin_break();
                }
            }
            Phase::Break => {
                if !self.break_paused && self.remaining > 0 {
                    self.remaining -= 1;
                }
                if self.remaining == 0 {
                    self.finish_break();
                }
            }
        }

        self.bump();
    }

    fn begin_break(&mut self) {
        self.phase = Phase::Break;
        let every = self.settings.long_break_every.max(1);
        self.kind = if (self.breaks_done + 1).is_multiple_of(every) {
            BreakKind::Long
        } else {
            BreakKind::Micro
        };
        self.duration = match self.kind {
            BreakKind::Micro => self.settings.microbreak_duration_sec,
            BreakKind::Long => self.settings.long_break_duration_min * 60,
        };
        self.remaining = self.duration;
        self.next_in = 0;
        self.break_paused = false;
    }

    pub fn snooze(&mut self, minutes: u64) {
        self.phase = Phase::Idle;
        self.next_in = minutes.max(1) * 60;
        self.remaining = 0;
        self.duration = 0;
        self.break_paused = false;
        self.paused_until = None;
        self.bump();
    }

    pub fn end_break(&mut self) {
        if self.phase == Phase::Break {
            self.finish_break();
            self.bump();
        }
    }

    fn finish_break(&mut self) {
        self.phase = Phase::Idle;
        self.next_in = self.settings.microbreak_interval_min * 60;
        self.remaining = 0;
        self.duration = 0;
        self.breaks_done += 1;
        self.break_paused = false;
    }

    pub fn skip(&mut self) {
        if self.phase != Phase::Idle {
            self.phase = Phase::Idle;
            self.next_in = self.settings.microbreak_interval_min * 60;
            self.remaining = 0;
            self.duration = 0;
            self.breaks_done += 1;
            self.break_paused = false;
            self.bump();
        }
    }

    pub fn toggle_break_pause(&mut self) {
        if self.phase == Phase::Break {
            self.break_paused = !self.break_paused;
            self.bump();
        }
    }

    pub fn toggle_pause(&mut self, now: SystemTime) {
        if self.is_paused(now) {
            self.paused_until = None;
        } else {
            self.paused_until = Some(now + Duration::from_secs(60 * 60));
        }
        self.bump();
    }

    pub fn show_now(&mut self) {
        if self.phase == Phase::Break {
            return;
        }

        self.paused_until = None;
        self.phase = Phase::Idle;
        self.next_in = 0;
        self.begin_break();
        self.bump();
    }

    pub fn update_settings(&mut self, settings: Settings) {
        let interval_changed =
            settings.microbreak_interval_min != self.settings.microbreak_interval_min;

        self.settings = settings;

        if interval_changed && self.phase == Phase::Idle {
            self.next_in = self.settings.microbreak_interval_min * 60;
        }

        if self.phase == Phase::Break {
            let new_duration = match self.kind {
                BreakKind::Micro => self.settings.microbreak_duration_sec,
                BreakKind::Long => self.settings.long_break_duration_min * 60,
            };

            if new_duration > self.duration {
                self.remaining = self.remaining.saturating_add(new_duration - self.duration);
            } else {
                self.remaining = self.remaining.min(new_duration);
            }

            self.duration = new_duration;
        }

        self.bump();
    }
}

pub fn format_clock(seconds: u64) -> String {
    format!("{:02}:{:02}", seconds / 60, seconds % 60)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::UNIX_EPOCH;

    fn scheduler() -> Scheduler {
        Scheduler::new(Settings::default())
    }

    #[test]
    fn microbreak_cycle() {
        let mut scheduler = scheduler();
        let now = UNIX_EPOCH + Duration::from_secs(1_000);

        for _ in 0..600 {
            scheduler.tick(now);
        }

        let snapshot = scheduler.snapshot();
        assert_eq!(snapshot.phase, Phase::Break);
        assert_eq!(snapshot.kind, BreakKind::Micro);
        assert_eq!(snapshot.remaining, 20);
        assert_eq!(snapshot.duration, 20);

        for _ in 0..20 {
            scheduler.tick(now);
        }

        assert_eq!(scheduler.snapshot().phase, Phase::Idle);
        assert_eq!(scheduler.snapshot().breaks_done, 1);
    }

    #[test]
    fn every_third_break_is_long() {
        let mut scheduler = scheduler();

        for _ in 0..2 {
            scheduler.show_now();
            scheduler.end_break();
        }

        scheduler.show_now();
        assert_eq!(scheduler.snapshot().kind, BreakKind::Long);
    }

    #[test]
    fn snooze_postpones_without_counting_break() {
        let mut scheduler = scheduler();

        scheduler.show_now();
        scheduler.snooze(5);

        let snapshot = scheduler.snapshot();
        assert_eq!(snapshot.phase, Phase::Idle);
        assert_eq!(snapshot.next_in, 300);
        assert_eq!(snapshot.breaks_done, 0);
    }

    #[test]
    fn show_now_clears_the_pause() {
        let mut scheduler = scheduler();
        let now = SystemTime::now();

        scheduler.toggle_pause(now);
        assert!(scheduler.snapshot().paused);

        scheduler.show_now();

        let snapshot = scheduler.snapshot();
        assert!(!snapshot.paused);
        assert_eq!(snapshot.phase, Phase::Break);
        assert_eq!(snapshot.remaining, 20);
    }

    #[test]
    fn show_now_is_ignored_during_a_break() {
        let mut scheduler = scheduler();

        scheduler.show_now();
        let remaining = scheduler.snapshot().remaining;
        scheduler.show_now();

        assert_eq!(scheduler.snapshot().remaining, remaining);
    }

    #[test]
    fn snooze_clears_a_pause() {
        let mut scheduler = scheduler();
        let now = SystemTime::now();

        scheduler.toggle_pause(now);
        scheduler.snooze(5);

        let snapshot = scheduler.snapshot();
        assert!(!snapshot.paused);
        assert_eq!(snapshot.next_in, 300);
    }

    #[test]
    fn skip_advances_the_long_break_cadence() {
        let mut scheduler = scheduler();

        scheduler.show_now();
        scheduler.skip();
        scheduler.show_now();
        scheduler.skip();
        scheduler.show_now();

        assert_eq!(scheduler.snapshot().kind, BreakKind::Long);
    }

    #[test]
    fn format_clock_uses_minutes_and_seconds() {
        assert_eq!(format_clock(5), "00:05");
        assert_eq!(format_clock(65), "01:05");
        assert_eq!(format_clock(600), "10:00");
    }

    #[test]
    fn pause_stops_the_countdown() {
        let mut scheduler = scheduler();
        let now = SystemTime::now();
        let before = scheduler.snapshot().next_in;

        scheduler.toggle_pause(now);
        for _ in 0..10 {
            scheduler.tick(now + Duration::from_secs(1));
        }

        assert_eq!(scheduler.snapshot().next_in, before);

        scheduler.toggle_pause(now + Duration::from_secs(2));
        scheduler.tick(now + Duration::from_secs(3));

        assert_eq!(scheduler.snapshot().next_in, before - 1);
    }

    #[test]
    fn a_duration_change_does_not_reset_the_interval() {
        let mut scheduler = scheduler();
        let before = scheduler.snapshot().next_in;
        let settings = Settings {
            microbreak_duration_sec: 45,
            ..Settings::default()
        };

        scheduler.update_settings(settings);

        assert_eq!(scheduler.snapshot().next_in, before);
    }

    #[test]
    fn a_longer_duration_extends_the_running_break() {
        let mut scheduler = scheduler();
        scheduler.show_now();
        scheduler.tick(SystemTime::now());

        let before = scheduler.snapshot();
        let settings = Settings {
            microbreak_duration_sec: before.duration + 10,
            ..Settings::default()
        };

        scheduler.update_settings(settings);

        let after = scheduler.snapshot();
        assert_eq!(after.duration, before.duration + 10);
        assert_eq!(after.remaining, before.remaining + 10);
    }

    #[test]
    fn revision_advances_on_tick_and_actions() {
        let mut scheduler = scheduler();
        let start = scheduler.snapshot().revision;

        scheduler.tick(SystemTime::now());
        let after_tick = scheduler.snapshot().revision;
        assert!(after_tick > start);

        scheduler.show_now();
        assert!(scheduler.snapshot().revision > after_tick);
    }
}

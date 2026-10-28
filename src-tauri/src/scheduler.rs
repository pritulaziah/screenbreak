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
    pub pause_remaining: u64,
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
            pause_remaining: self.pause_remaining(now),
            settings: self.settings.clone(),
        }
    }

    pub fn is_paused(&self, now: SystemTime) -> bool {
        self.paused_until.map(|until| until > now).unwrap_or(false)
    }

    pub fn pause_remaining(&self, now: SystemTime) -> u64 {
        self.paused_until
            .and_then(|until| until.duration_since(now).ok())
            .map(|duration| duration.as_secs())
            .unwrap_or(0)
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
    }

    fn begin_break(&mut self) {
        self.phase = Phase::Break;
        self.kind = if (self.breaks_done + 1).is_multiple_of(self.settings.long_break_every) {
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
    }

    pub fn end_break(&mut self) {
        if self.phase == Phase::Break {
            self.finish_break();
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
        }
    }

    pub fn toggle_break_pause(&mut self) {
        if self.phase == Phase::Break {
            self.break_paused = !self.break_paused;
        }
    }

    pub fn toggle_pause(&mut self, now: SystemTime) {
        if self.is_paused(now) {
            self.paused_until = None;
        } else {
            self.paused_until = Some(now + Duration::from_secs(60 * 60));
        }
    }

    pub fn show_now(&mut self) {
        self.paused_until = None;
        self.phase = Phase::Idle;
        self.next_in = 0;
        self.begin_break();
    }

    pub fn update_settings(&mut self, settings: Settings) {
        let schedule_changed = settings.microbreak_interval_min
            != self.settings.microbreak_interval_min
            || settings.microbreak_duration_sec != self.settings.microbreak_duration_sec
            || settings.long_break_duration_min != self.settings.long_break_duration_min
            || settings.long_break_every != self.settings.long_break_every;

        self.settings = settings;

        if schedule_changed && self.phase == Phase::Idle {
            self.next_in = self.settings.microbreak_interval_min * 60;
        }

        if self.phase == Phase::Break {
            let new_duration = match self.kind {
                BreakKind::Micro => self.settings.microbreak_duration_sec,
                BreakKind::Long => self.settings.long_break_duration_min * 60,
            };

            if new_duration != self.duration {
                self.duration = new_duration;
                self.remaining = self.remaining.min(new_duration);
            }
        }
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
}

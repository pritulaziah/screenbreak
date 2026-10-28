use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(default)]
pub struct Settings {
    pub microbreak_interval_min: u64,
    pub microbreak_duration_sec: u64,
    pub long_break_duration_min: u64,
    pub long_break_every: u64,
    pub theme: String,
    pub appearance: String,
    pub sound: bool,
    pub sound_tone: String,
    pub sound_volume: u64,
    pub position: String,
    pub notification_size: String,
    pub show_countdown: bool,
    pub allow_snooze: bool,
    pub show_stop: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            microbreak_interval_min: 10,
            microbreak_duration_sec: 20,
            long_break_duration_min: 5,
            long_break_every: 3,
            theme: "cozy".into(),
            appearance: "dark".into(),
            sound: true,
            sound_tone: "chime".into(),
            sound_volume: 60,
            position: "bottom-right".into(),
            notification_size: "normal".into(),
            show_countdown: true,
            allow_snooze: true,
            show_stop: true,
        }
    }
}

impl Settings {
    pub fn sanitize(mut self) -> Self {
        self.microbreak_interval_min = self.microbreak_interval_min.clamp(1, 120);
        self.microbreak_duration_sec = self.microbreak_duration_sec.clamp(5, 300);
        self.long_break_duration_min = self.long_break_duration_min.clamp(1, 60);
        self.long_break_every = self.long_break_every.clamp(1, 12);

        self.theme = match self.theme.as_str() {
            "cozy" | "night" | "nature" => self.theme.clone(),
            "anime" => "cozy".into(),
            "cyberpunk" => "night".into(),
            "forest" => "nature".into(),
            _ => "cozy".into(),
        };
        if !matches!(self.appearance.as_str(), "light" | "dark") {
            self.appearance = "dark".into();
        }

        self.position = match self.position.as_str() {
            "right" => "bottom-right".into(),
            "top-left" | "top-center" | "top-right" | "middle-left" | "center" | "middle-right"
            | "bottom-left" | "bottom-center" | "bottom-right" => self.position.clone(),
            _ => "bottom-right".into(),
        };

        if !matches!(
            self.notification_size.as_str(),
            "compact" | "normal" | "large"
        ) {
            self.notification_size = "normal".into();
        }
        if !matches!(self.sound_tone.as_str(), "chime" | "bell" | "soft") {
            self.sound_tone = "chime".into();
        }
        self.sound_volume = self.sound_volume.clamp(0, 100);

        self
    }
}

fn settings_path(app: &tauri::AppHandle) -> Option<PathBuf> {
    app.path()
        .app_data_dir()
        .ok()
        .map(|dir| dir.join("settings.json"))
}

pub fn load_settings(app: &tauri::AppHandle) -> Settings {
    let Some(path) = settings_path(app) else {
        return Settings::default();
    };
    let Ok(raw) = fs::read_to_string(path) else {
        return Settings::default();
    };

    serde_json::from_str::<Settings>(&raw)
        .unwrap_or_default()
        .sanitize()
}

pub fn save_settings(app: &tauri::AppHandle, settings: &Settings) {
    let Some(path) = settings_path(app) else {
        return;
    };

    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }

    if let Ok(raw) = serde_json::to_string_pretty(settings) {
        let temp = path.with_extension("json.tmp");
        if fs::write(&temp, raw).is_ok() {
            let _ = fs::rename(temp, path);
        }
    }
}

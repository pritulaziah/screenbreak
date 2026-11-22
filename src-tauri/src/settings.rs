use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::Manager;

pub const SCHEMA_VERSION: u32 = 1;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(default)]
pub struct Settings {
    pub schema_version: u32,
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
    pub card_orientation: String,
    pub show_countdown: bool,
    pub allow_snooze: bool,
    pub show_stop: bool,
    pub background_random: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            schema_version: SCHEMA_VERSION,
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
            card_orientation: "horizontal".into(),
            show_countdown: true,
            allow_snooze: true,
            show_stop: true,
            background_random: false,
        }
    }
}

impl Settings {
    fn migrate(mut self) -> Self {
        if self.schema_version < SCHEMA_VERSION {
            self.schema_version = SCHEMA_VERSION;
        }
        self
    }

    pub fn sanitize(mut self) -> Self {
        self.schema_version = SCHEMA_VERSION;
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

        if self.notification_size == "tall" {
            self.notification_size = "normal".into();
            self.card_orientation = "vertical".into();
        }
        if !matches!(
            self.notification_size.as_str(),
            "compact" | "normal" | "large"
        ) {
            self.notification_size = "normal".into();
        }
        if !matches!(self.card_orientation.as_str(), "horizontal" | "vertical") {
            self.card_orientation = "horizontal".into();
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
    let Ok(raw) = fs::read_to_string(&path) else {
        return Settings::default();
    };

    match serde_json::from_str::<Settings>(&raw) {
        Ok(settings) => settings.migrate().sanitize(),
        Err(error) => {
            eprintln!("cannot read settings.json: {error}");
            let backup = path.with_extension("json.bad");
            let _ = fs::copy(&path, &backup);
            Settings::default()
        }
    }
}

pub fn save_settings(app: &tauri::AppHandle, settings: &Settings) -> Result<(), String> {
    let path =
        settings_path(app).ok_or_else(|| "The app data folder is not available.".to_string())?;
    let raw = serde_json::to_string_pretty(settings).map_err(|error| error.to_string())?;
    atomic_write(&path, raw.as_bytes())
}

pub fn atomic_write(path: &Path, bytes: &[u8]) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }

    let temp = path.with_extension("json.tmp");
    fs::write(&temp, bytes).map_err(|error| error.to_string())?;
    fs::rename(&temp, path).map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn defaults_are_already_sanitized() {
        assert_eq!(Settings::default().sanitize(), Settings::default());
    }

    #[test]
    fn sanitize_clamps_and_rejects_unknown_values() {
        let settings = Settings {
            schema_version: 0,
            microbreak_interval_min: 0,
            microbreak_duration_sec: 1,
            long_break_duration_min: 0,
            long_break_every: 0,
            theme: "anime".into(),
            appearance: "dim".into(),
            position: "right".into(),
            notification_size: "huge".into(),
            card_orientation: "diagonal".into(),
            sound_tone: "gong".into(),
            sound_volume: 200,
            ..Settings::default()
        }
        .sanitize();

        assert_eq!(settings.schema_version, SCHEMA_VERSION);
        assert_eq!(settings.microbreak_interval_min, 1);
        assert_eq!(settings.microbreak_duration_sec, 5);
        assert_eq!(settings.long_break_duration_min, 1);
        assert_eq!(settings.long_break_every, 1);
        assert_eq!(settings.theme, "cozy");
        assert_eq!(settings.appearance, "dark");
        assert_eq!(settings.position, "bottom-right");
        assert_eq!(settings.notification_size, "normal");
        assert_eq!(settings.card_orientation, "horizontal");
        assert_eq!(settings.sound_tone, "chime");
        assert_eq!(settings.sound_volume, 100);
    }

    #[test]
    fn atomic_write_replaces_the_target() {
        let dir = std::env::temp_dir().join(format!("screenbreak-settings-{}", std::process::id()));
        let path = dir.join("settings.json");

        atomic_write(&path, b"{\"a\":1}").unwrap();
        atomic_write(&path, b"{\"a\":2}").unwrap();

        assert_eq!(fs::read_to_string(&path).unwrap(), "{\"a\":2}");
        let _ = fs::remove_dir_all(dir);
    }
}

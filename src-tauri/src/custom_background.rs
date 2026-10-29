use base64::{Engine, engine::general_purpose::STANDARD};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager};

const PREFIX: &str = "break-background-";
const MAX_BYTES: usize = 8 * 1024 * 1024;

fn app_dir(app: &AppHandle) -> Option<PathBuf> {
    app.path().app_data_dir().ok()
}

fn image_extension(bytes: &[u8]) -> Option<&'static str> {
    if bytes.starts_with(&[0x89, b'P', b'N', b'G', 0x0d, 0x0a, 0x1a, 0x0a]) {
        Some("png")
    } else if bytes.starts_with(&[0xff, 0xd8, 0xff]) {
        Some("jpg")
    } else if bytes.len() >= 12 && &bytes[0..4] == b"RIFF" && &bytes[8..12] == b"WEBP" {
        Some("webp")
    } else {
        None
    }
}

fn is_background_file(path: &Path) -> bool {
    path.file_name()
        .and_then(|name| name.to_str())
        .is_some_and(|name| name.starts_with(PREFIX))
}

fn newest_background(app: &AppHandle) -> Option<PathBuf> {
    let entries = fs::read_dir(app_dir(app)?).ok()?;
    let mut newest: Option<(SystemTime, PathBuf)> = None;

    for entry in entries.flatten() {
        let path = entry.path();
        if !is_background_file(&path) {
            continue;
        }

        let Ok(modified) = entry.metadata().and_then(|meta| meta.modified()) else {
            continue;
        };

        if newest.as_ref().is_none_or(|(time, _)| modified > *time) {
            newest = Some((modified, path));
        }
    }

    newest.map(|(_, path)| path)
}

fn remove_all_except(app: &AppHandle, keep: Option<&Path>) {
    let Some(dir) = app_dir(app) else {
        return;
    };
    let Ok(entries) = fs::read_dir(dir) else {
        return;
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if keep == Some(path.as_path()) || !is_background_file(&path) {
            continue;
        }
        let _ = fs::remove_file(path);
    }
}

pub fn current(app: &AppHandle) -> Option<String> {
    newest_background(app).map(|path| path.to_string_lossy().into_owned())
}

pub fn save(app: &AppHandle, data: &str) -> Result<String, String> {
    let encoded = data.split_once(',').map_or(data, |(_, body)| body);
    let bytes = STANDARD
        .decode(encoded)
        .map_err(|_| "The image data is not valid.".to_string())?;

    if bytes.is_empty() {
        return Err("The image is empty.".into());
    }
    if bytes.len() > MAX_BYTES {
        return Err("The image is larger than 8 MB.".into());
    }

    let extension = image_extension(&bytes)
        .ok_or_else(|| "Unsupported format. Use PNG, JPEG, or WebP.".to_string())?;

    let dir = app_dir(app).ok_or_else(|| "The app data folder is not available.".to_string())?;
    fs::create_dir_all(&dir).map_err(|error| error.to_string())?;

    let stamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or_default();
    let path = dir.join(format!("{PREFIX}{stamp}.{extension}"));

    fs::write(&path, bytes).map_err(|error| error.to_string())?;
    remove_all_except(app, Some(&path));

    Ok(path.to_string_lossy().into_owned())
}

pub fn remove(app: &AppHandle) {
    remove_all_except(app, None);
}

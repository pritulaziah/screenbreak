use base64::{Engine, engine::general_purpose::STANDARD};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager};

const PREFIX: &str = "break-background-";
const MANIFEST: &str = "break-backgrounds.json";
const MAX_BYTES: usize = 25 * 1024 * 1024;

#[derive(Debug, Default, Deserialize, Serialize)]
struct Manifest {
    #[serde(default)]
    order: Vec<String>,
}

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

fn file_name(path: &Path) -> Option<String> {
    path.file_name()
        .and_then(|name| name.to_str())
        .map(ToString::to_string)
}

fn background_files(app: &AppHandle) -> Vec<PathBuf> {
    let Some(dir) = app_dir(app) else {
        return Vec::new();
    };
    let Ok(entries) = fs::read_dir(dir) else {
        return Vec::new();
    };

    let mut files: Vec<PathBuf> = entries
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| is_background_file(path))
        .collect();

    files.sort();
    files
}

fn manifest_path(app: &AppHandle) -> Option<PathBuf> {
    app_dir(app).map(|dir| dir.join(MANIFEST))
}

fn load_manifest(app: &AppHandle) -> Manifest {
    manifest_path(app)
        .and_then(|path| fs::read_to_string(path).ok())
        .and_then(|raw| serde_json::from_str(&raw).ok())
        .unwrap_or_default()
}

fn save_manifest(app: &AppHandle, manifest: &Manifest) {
    let Some(path) = manifest_path(app) else {
        return;
    };
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    if let Ok(raw) = serde_json::to_string_pretty(manifest) {
        let _ = fs::write(path, raw);
    }
}

fn ordered_names(app: &AppHandle) -> Vec<String> {
    let names: Vec<String> = background_files(app)
        .iter()
        .filter_map(|path| file_name(path))
        .collect();
    let manifest = load_manifest(app);

    let mut order: Vec<String> = Vec::with_capacity(names.len());
    for name in manifest.order {
        if names.contains(&name) && !order.contains(&name) {
            order.push(name);
        }
    }
    for name in names {
        if !order.contains(&name) {
            order.push(name);
        }
    }

    order
}

pub fn list(app: &AppHandle) -> Vec<String> {
    let Some(dir) = app_dir(app) else {
        return Vec::new();
    };

    ordered_names(app)
        .into_iter()
        .map(|name| dir.join(name).to_string_lossy().into_owned())
        .collect()
}

fn decode_image(data: &str) -> Result<Vec<u8>, String> {
    let encoded = data.split_once(',').map_or(data, |(_, body)| body);
    let bytes = STANDARD
        .decode(encoded)
        .map_err(|_| "The image data is not valid.".to_string())?;

    if bytes.is_empty() {
        return Err("The image is empty.".into());
    }
    if bytes.len() > MAX_BYTES {
        return Err("The image is larger than 25 MB.".into());
    }

    Ok(bytes)
}

fn write_unique(dir: &Path, bytes: &[u8], extension: &str) -> Result<PathBuf, String> {
    let stamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_nanos())
        .unwrap_or_default();
    let mut path = dir.join(format!("{PREFIX}{stamp}.{extension}"));
    let mut suffix = 1;
    while path.exists() {
        path = dir.join(format!("{PREFIX}{stamp}-{suffix}.{extension}"));
        suffix += 1;
    }

    fs::write(&path, bytes).map_err(|error| error.to_string())?;
    Ok(path)
}

fn add_to_manifest(app: &AppHandle, name: String) {
    let mut order = ordered_names(app);
    order.retain(|item| item != &name);
    order.push(name);
    save_manifest(app, &Manifest { order });
}

fn remove_from_manifest(app: &AppHandle, name: &str) {
    let mut manifest = load_manifest(app);
    manifest.order.retain(|item| item != name);
    save_manifest(app, &manifest);
}

pub fn save(app: &AppHandle, data: &str) -> Result<String, String> {
    let bytes = decode_image(data)?;
    let extension = image_extension(&bytes)
        .ok_or_else(|| "Unsupported format. Use PNG, JPEG, or WebP.".to_string())?;

    let dir = app_dir(app).ok_or_else(|| "The app data folder is not available.".to_string())?;
    fs::create_dir_all(&dir).map_err(|error| error.to_string())?;

    let path = write_unique(&dir, &bytes, extension)?;
    if let Some(name) = file_name(&path) {
        add_to_manifest(app, name);
    }

    Ok(path.to_string_lossy().into_owned())
}

pub fn replace(app: &AppHandle, target: &str, data: &str) -> Result<String, String> {
    let bytes = decode_image(data)?;
    let extension = image_extension(&bytes)
        .ok_or_else(|| "Unsupported format. Use PNG, JPEG, or WebP.".to_string())?;

    let dir = app_dir(app).ok_or_else(|| "The app data folder is not available.".to_string())?;
    fs::create_dir_all(&dir).map_err(|error| error.to_string())?;

    let canonical_dir = fs::canonicalize(&dir).map_err(|error| error.to_string())?;
    let target_path =
        fs::canonicalize(target).map_err(|_| "The image was not found.".to_string())?;
    if target_path.parent() != Some(canonical_dir.as_path()) || !is_background_file(&target_path) {
        return Err("The image was not found.".into());
    }

    let old_name = file_name(&target_path);
    let mut order = ordered_names(app);

    let path = write_unique(&dir, &bytes, extension)?;
    let new_name = file_name(&path).ok_or_else(|| "Cannot save the image.".to_string())?;

    let _ = fs::remove_file(&target_path);

    match old_name {
        Some(old_name) => match order.iter().position(|item| item == &old_name) {
            Some(position) => order[position] = new_name,
            None => order.push(new_name),
        },
        None => order.push(new_name),
    }
    save_manifest(app, &Manifest { order });

    Ok(path.to_string_lossy().into_owned())
}

fn remove_one(app: &AppHandle, target: &str) {
    let Some(dir) = app_dir(app) else {
        return;
    };
    let Ok(dir) = fs::canonicalize(dir) else {
        return;
    };
    let Ok(target) = fs::canonicalize(target) else {
        return;
    };

    if target.parent() != Some(dir.as_path()) || !is_background_file(&target) {
        return;
    }

    let name = file_name(&target);
    let _ = fs::remove_file(&target);
    if let Some(name) = name {
        remove_from_manifest(app, &name);
    }
}

fn remove_all(app: &AppHandle) {
    for path in background_files(app) {
        let _ = fs::remove_file(path);
    }
    save_manifest(app, &Manifest::default());
}

pub fn remove(app: &AppHandle, target: Option<&str>) {
    match target {
        Some(target) => remove_one(app, target),
        None => remove_all(app),
    }
}

pub fn reorder(app: &AppHandle, paths: &[String]) -> Vec<String> {
    let current = ordered_names(app);
    let mut order: Vec<String> = Vec::with_capacity(current.len());

    for path in paths {
        let Some(name) = Path::new(path).file_name().and_then(|name| name.to_str()) else {
            continue;
        };
        if current.iter().any(|item| item == name) && !order.iter().any(|item| item == name) {
            order.push(name.to_string());
        }
    }
    for name in current {
        if !order.contains(&name) {
            order.push(name);
        }
    }

    save_manifest(app, &Manifest { order });
    list(app)
}

pub fn download(app: &AppHandle, target: &str) -> Result<String, String> {
    let dir = app_dir(app).ok_or_else(|| "The app data folder is not available.".to_string())?;
    let canonical_dir = fs::canonicalize(&dir).map_err(|error| error.to_string())?;
    let target = fs::canonicalize(target).map_err(|_| "The image was not found.".to_string())?;

    if target.parent() != Some(canonical_dir.as_path()) || !is_background_file(&target) {
        return Err("The image was not found.".into());
    }

    let download_dir = app
        .path()
        .download_dir()
        .map_err(|error| error.to_string())?;
    fs::create_dir_all(&download_dir).map_err(|error| error.to_string())?;

    let extension = target
        .extension()
        .and_then(|extension| extension.to_str())
        .unwrap_or("png");
    let stamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or_default();
    let mut path = download_dir.join(format!("screenbreak-background-{stamp}.{extension}"));
    let mut suffix = 1;
    while path.exists() {
        path = download_dir.join(format!(
            "screenbreak-background-{stamp}-{suffix}.{extension}"
        ));
        suffix += 1;
    }

    fs::copy(&target, &path).map_err(|error| error.to_string())?;
    Ok(path.to_string_lossy().into_owned())
}

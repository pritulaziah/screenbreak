mod custom_background;
mod scheduler;
mod settings;
mod tray;
mod windows;

use scheduler::{Scheduler, Snapshot};
use settings::{Settings, load_settings, save_settings};
use std::sync::Mutex;
use std::time::{Duration, SystemTime};
use tauri::{AppHandle, Emitter, Manager, WindowEvent};
use tray::{setup_tray, update_tray};
use windows::{create_reminder_window, show_main, sync_reminder, update_reminder_window};

fn mutate_and_broadcast(
    app: &AppHandle,
    state: &Mutex<Scheduler>,
    mutate: impl FnOnce(&mut Scheduler),
) -> Snapshot {
    let snapshot = {
        let mut scheduler = state.lock().unwrap();
        mutate(&mut scheduler);
        scheduler.snapshot()
    };

    let _ = app.emit("scheduler:update", &snapshot);
    update_tray(app, &snapshot);
    sync_reminder(app, &snapshot);

    snapshot
}

#[tauri::command]
fn get_state(state: tauri::State<Mutex<Scheduler>>) -> Snapshot {
    state.lock().unwrap().snapshot()
}

#[tauri::command]
fn save_custom_background(app: AppHandle, data: String) -> Result<Vec<String>, String> {
    custom_background::save(&app, &data)?;
    let paths = custom_background::list(&app);
    let _ = app.emit("custom-background:update", &paths);
    Ok(paths)
}

#[tauri::command]
fn get_custom_backgrounds(app: AppHandle) -> Vec<String> {
    custom_background::list(&app)
}

#[tauri::command]
fn remove_custom_background(app: AppHandle, path: Option<String>) -> Vec<String> {
    custom_background::remove(&app, path.as_deref());
    let paths = custom_background::list(&app);
    let _ = app.emit("custom-background:update", &paths);
    paths
}

#[tauri::command]
fn reorder_custom_backgrounds(app: AppHandle, paths: Vec<String>) -> Vec<String> {
    let paths = custom_background::reorder(&app, &paths);
    let _ = app.emit("custom-background:update", &paths);
    paths
}

#[tauri::command]
fn replace_custom_background(
    app: AppHandle,
    path: String,
    data: String,
) -> Result<Vec<String>, String> {
    custom_background::replace(&app, &path, &data)?;
    let paths = custom_background::list(&app);
    let _ = app.emit("custom-background:update", &paths);
    Ok(paths)
}

#[tauri::command]
fn download_custom_background(app: AppHandle, path: String) -> Result<String, String> {
    custom_background::download(&app, &path)
}

#[tauri::command]
fn update_settings(
    app: AppHandle,
    state: tauri::State<Mutex<Scheduler>>,
    settings: Settings,
) -> Snapshot {
    let settings = settings.sanitize();
    save_settings(&app, &settings);
    update_reminder_window(&app, &settings);

    mutate_and_broadcast(&app, state.inner(), |scheduler| {
        scheduler.update_settings(settings);
    })
}

#[tauri::command]
fn reset_settings(app: AppHandle, state: tauri::State<Mutex<Scheduler>>) -> Snapshot {
    let settings = Settings::default();
    save_settings(&app, &settings);
    update_reminder_window(&app, &settings);

    mutate_and_broadcast(&app, state.inner(), |scheduler| {
        scheduler.update_settings(settings);
    })
}

#[tauri::command]
fn snooze(app: AppHandle, state: tauri::State<Mutex<Scheduler>>, minutes: u64) -> Snapshot {
    mutate_and_broadcast(&app, state.inner(), |scheduler| scheduler.snooze(minutes))
}

#[tauri::command]
fn end_break(app: AppHandle, state: tauri::State<Mutex<Scheduler>>) -> Snapshot {
    mutate_and_broadcast(&app, state.inner(), |scheduler| scheduler.end_break())
}

#[tauri::command]
fn toggle_break_pause(app: AppHandle, state: tauri::State<Mutex<Scheduler>>) -> Snapshot {
    mutate_and_broadcast(&app, state.inner(), |scheduler| {
        scheduler.toggle_break_pause()
    })
}

#[tauri::command]
fn toggle_pause(app: AppHandle, state: tauri::State<Mutex<Scheduler>>) -> Snapshot {
    mutate_and_broadcast(&app, state.inner(), |scheduler| {
        scheduler.toggle_pause(SystemTime::now())
    })
}

#[tauri::command]
fn show_now(app: AppHandle, state: tauri::State<Mutex<Scheduler>>) -> Snapshot {
    mutate_and_broadcast(&app, state.inner(), |scheduler| scheduler.show_now())
}

pub(crate) fn toggle_pause_from_tray(app: &AppHandle) {
    let state = app.state::<Mutex<Scheduler>>();
    mutate_and_broadcast(app, state.inner(), |scheduler| {
        scheduler.toggle_pause(SystemTime::now())
    });
}

pub(crate) fn skip_from_tray(app: &AppHandle) {
    let state = app.state::<Mutex<Scheduler>>();
    mutate_and_broadcast(app, state.inner(), |scheduler| scheduler.skip());
}

fn start_scheduler_loop(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_secs(1));
        interval.set_missed_tick_behavior(tokio::time::MissedTickBehavior::Skip);

        loop {
            interval.tick().await;

            let snapshot = {
                let state = app.state::<Mutex<Scheduler>>();
                let mut scheduler = state.lock().unwrap();
                scheduler.tick(SystemTime::now());
                scheduler.snapshot()
            };

            let _ = app.emit("scheduler:update", &snapshot);
            update_tray(&app, &snapshot);
            sync_reminder(&app, &snapshot);
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            show_main(app);
        }))
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            let settings = load_settings(app.handle());
            app.manage(Mutex::new(Scheduler::new(settings.clone())));
            create_reminder_window(app.handle(), &settings)?;
            setup_tray(app.handle())?;
            start_scheduler_loop(app.handle().clone());
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                if window.label() == "reminder" {
                    windows::note_reminder_hidden();
                }
                let _ = window.hide();
            }
        })
        .invoke_handler(tauri::generate_handler![
            get_state,
            save_custom_background,
            get_custom_backgrounds,
            remove_custom_background,
            reorder_custom_backgrounds,
            replace_custom_background,
            download_custom_background,
            update_settings,
            snooze,
            end_break,
            toggle_break_pause,
            toggle_pause,
            show_now,
            reset_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

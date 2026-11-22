use crate::scheduler::{Phase, Snapshot};
use crate::settings::Settings;
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{
    AppHandle, LogicalSize, Manager, PhysicalPosition, WebviewUrl, WebviewWindow,
    WebviewWindowBuilder,
};

/// The reminder window is created hidden, so the tracked state starts as hidden.
static REMINDER_VISIBLE: AtomicBool = AtomicBool::new(false);

pub fn reminder_size(size: &str, orientation: &str) -> (f64, f64) {
    if orientation == "vertical" {
        match size {
            "compact" => (210.0, 360.0),
            "large" => (360.0, 500.0),
            _ => (300.0, 420.0),
        }
    } else {
        match size {
            "compact" => (360.0, 180.0),
            "large" => (500.0, 250.0),
            _ => (420.0, 210.0),
        }
    }
}

pub fn create_reminder_window(app: &AppHandle, settings: &Settings) -> tauri::Result<()> {
    let (width, height) = reminder_size(&settings.notification_size, &settings.card_orientation);
    let window = WebviewWindowBuilder::new(
        app,
        "reminder",
        WebviewUrl::App("index.html?window=reminder".into()),
    )
    .title("ScreenBreak")
    .inner_size(width, height)
    .resizable(false)
    .maximizable(false)
    .minimizable(false)
    .closable(false)
    .decorations(false)
    .transparent(true)
    .always_on_top(true)
    .skip_taskbar(true)
    .shadow(false)
    .focused(false)
    .visible(false)
    .build()?;

    position_reminder(&window, &settings.position);
    Ok(())
}

fn place_reminder(window: &WebviewWindow, position: &str, width: i32, height: i32) {
    let Ok(Some(monitor)) = window.primary_monitor() else {
        return;
    };
    let work = monitor.work_area();

    let x = match position {
        "top-left" | "middle-left" | "bottom-left" => work.position.x,
        "top-center" | "center" | "bottom-center" => {
            work.position.x + (work.size.width as i32 - width) / 2
        }
        _ => work.position.x + work.size.width as i32 - width,
    };

    let y = match position {
        "top-left" | "top-center" | "top-right" => work.position.y,
        "middle-left" | "center" | "middle-right" => {
            work.position.y + (work.size.height as i32 - height) / 2
        }
        _ => work.position.y + work.size.height as i32 - height,
    };

    let _ = window.set_position(PhysicalPosition::new(x, y));
}

pub fn position_reminder(window: &WebviewWindow, position: &str) {
    let Ok(size) = window.outer_size() else {
        return;
    };
    place_reminder(window, position, size.width as i32, size.height as i32);
}

pub fn update_reminder_window(app: &AppHandle, settings: &Settings) {
    let Some(window) = app.get_webview_window("reminder") else {
        return;
    };

    let (width, height) = reminder_size(&settings.notification_size, &settings.card_orientation);
    let _ = window.set_size(LogicalSize::new(width, height));

    let scale = window.scale_factor().unwrap_or(1.0);
    place_reminder(
        &window,
        &settings.position,
        (width * scale).round() as i32,
        (height * scale).round() as i32,
    );
}

pub fn show_reminder(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("reminder") {
        // Do not call `ShowWindow` directly here. The window runtime tracks the
        // visibility flag, and `hide` is a no-op when that flag never changed.
        // `show` uses `SW_SHOWNOACTIVATE` because the window is built with
        // `focused(false)`, so it does not take focus.
        let _ = window.show();
        REMINDER_VISIBLE.store(true, Ordering::Relaxed);
    }
}

pub fn hide_reminder(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("reminder") {
        let _ = window.hide();
        REMINDER_VISIBLE.store(false, Ordering::Relaxed);
    }
}

/// Clears the tracked visibility when another code path hid the reminder window.
pub fn note_reminder_hidden() {
    REMINDER_VISIBLE.store(false, Ordering::Relaxed);
}

/// Shows or hides the reminder window to match the scheduler state.
///
/// A visible reminder window covers the desktop, so it must be hidden as soon
/// as the break ends. Otherwise it keeps receiving mouse clicks.
pub fn sync_reminder(app: &AppHandle, snapshot: &Snapshot) {
    let should_show = !snapshot.paused && matches!(snapshot.phase, Phase::Break);

    if should_show == REMINDER_VISIBLE.load(Ordering::Relaxed) {
        return;
    }

    if should_show {
        show_reminder(app);
    } else {
        hide_reminder(app);
    }
}

pub fn show_main(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

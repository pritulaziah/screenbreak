use crate::settings::Settings;
use tauri::{
    AppHandle, LogicalSize, Manager, PhysicalPosition, WebviewUrl, WebviewWindow,
    WebviewWindowBuilder,
};

pub fn reminder_size(size: &str) -> (f64, f64) {
    match size {
        "compact" => (360.0, 180.0),
        "large" => (500.0, 250.0),
        _ => (420.0, 210.0),
    }
}

pub fn create_reminder_window(app: &AppHandle, settings: &Settings) -> tauri::Result<()> {
    let (width, height) = reminder_size(&settings.notification_size);
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

pub fn position_reminder(window: &WebviewWindow, position: &str) {
    let Ok(Some(monitor)) = window.primary_monitor() else {
        return;
    };
    let work = monitor.work_area();
    let Ok(size) = window.outer_size() else {
        return;
    };

    let x = match position {
        "top-left" | "middle-left" | "bottom-left" => work.position.x,
        "top-center" | "center" | "bottom-center" => {
            work.position.x + (work.size.width as i32 - size.width as i32) / 2
        }
        _ => work.position.x + work.size.width as i32 - size.width as i32,
    };

    let y = match position {
        "top-left" | "top-center" | "top-right" => work.position.y,
        "middle-left" | "center" | "middle-right" => {
            work.position.y + (work.size.height as i32 - size.height as i32) / 2
        }
        _ => work.position.y + work.size.height as i32 - size.height as i32,
    };

    let _ = window.set_position(PhysicalPosition::new(x, y));
}

pub fn update_reminder_position(app: &AppHandle, position: &str) {
    if let Some(window) = app.get_webview_window("reminder") {
        position_reminder(&window, position);
    }
}

pub fn update_reminder_size(app: &AppHandle, size: &str) {
    if let Some(window) = app.get_webview_window("reminder") {
        let (width, height) = reminder_size(size);
        let _ = window.set_size(LogicalSize::new(width, height));
    }
}

pub fn show_reminder(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("reminder") {
        #[cfg(windows)]
        {
            use windows::Win32::UI::WindowsAndMessaging::{SW_SHOWNOACTIVATE, ShowWindow};

            if let Ok(hwnd) = window.hwnd() {
                // SAFETY: `hwnd` belongs to the live reminder window. ShowWindow only
                // changes its visibility and does not take ownership of the handle.
                unsafe {
                    let _ = ShowWindow(hwnd, SW_SHOWNOACTIVATE);
                }
                return;
            }
        }

        let _ = window.show();
    }
}

pub fn hide_reminder(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("reminder") {
        let _ = window.hide();
    }
}

pub fn show_main(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

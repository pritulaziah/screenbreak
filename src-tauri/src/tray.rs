use crate::scheduler::{Phase, Snapshot, format_clock};
use crate::windows::show_main;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Manager};

pub struct TrayItems {
    pub pause: MenuItem<tauri::Wry>,
    pub skip: MenuItem<tauri::Wry>,
}

pub fn setup_tray(app: &AppHandle) -> tauri::Result<()> {
    let settings = MenuItem::with_id(app, "settings", "Open settings", true, None::<&str>)?;
    let pause = MenuItem::with_id(app, "pause", "Pause for 1 hour", true, None::<&str>)?;
    let skip = MenuItem::with_id(app, "skip", "Skip break", false, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&settings, &pause, &skip, &separator, &quit])?;

    let mut builder = TrayIconBuilder::with_id("main")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .tooltip("ScreenBreak")
        .on_menu_event(|app, event| match event.id().as_ref() {
            "settings" => show_main(app),
            "pause" => crate::toggle_pause_from_tray(app),
            "skip" => crate::skip_from_tray(app),
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                show_main(tray.app_handle());
            }
        });

    if let Some(icon) = app.default_window_icon().cloned() {
        builder = builder.icon(icon);
    }

    builder.build(app)?;
    app.manage(TrayItems { pause, skip });

    Ok(())
}

pub fn update_tray(app: &AppHandle, snapshot: &Snapshot) {
    if let Some(tray) = app.tray_by_id("main") {
        let tooltip = match snapshot.phase {
            Phase::Idle if snapshot.paused => "ScreenBreak — paused".to_string(),
            Phase::Idle => format!(
                "ScreenBreak — next break in {}",
                format_clock(snapshot.next_in)
            ),
            Phase::Break => format!(
                "ScreenBreak — break, {} left",
                format_clock(snapshot.remaining)
            ),
        };

        let _ = tray.set_tooltip(Some(&tooltip));
    }

    if let Some(items) = app.try_state::<TrayItems>() {
        let _ = items.pause.set_text(if snapshot.paused {
            "Resume"
        } else {
            "Pause for 1 hour"
        });
        let _ = items
            .skip
            .set_enabled(matches!(snapshot.phase, Phase::Break));
    }
}

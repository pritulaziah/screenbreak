use crate::scheduler::{Phase, Snapshot, format_clock};
use crate::windows::show_main;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Manager};

pub struct TrayItems {
    pub show_now: MenuItem<tauri::Wry>,
    pub pause: MenuItem<tauri::Wry>,
    pub skip: MenuItem<tauri::Wry>,
}

#[derive(Debug, PartialEq, Eq)]
pub struct TrayState {
    pub tooltip: String,
    pub show_now_enabled: bool,
    pub pause_label: &'static str,
    pub skip_enabled: bool,
}

pub fn setup_tray(app: &AppHandle) -> tauri::Result<()> {
    let settings = MenuItem::with_id(app, "settings", "Open settings", true, None::<&str>)?;
    let show_now = MenuItem::with_id(app, "show_now", "Show break now", true, None::<&str>)?;
    let pause = MenuItem::with_id(app, "pause", "Pause for 1 hour", true, None::<&str>)?;
    let skip = MenuItem::with_id(app, "skip", "Skip break", false, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(
        app,
        &[&settings, &show_now, &pause, &skip, &separator, &quit],
    )?;

    let mut builder = TrayIconBuilder::with_id("main")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .tooltip("ScreenBreak")
        .on_menu_event(|app, event| match event.id().as_ref() {
            "settings" => show_main(app),
            "show_now" => crate::show_now_from_tray(app),
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
    app.manage(TrayItems {
        show_now,
        pause,
        skip,
    });

    Ok(())
}

pub(crate) fn can_show_now(phase: Phase) -> bool {
    matches!(phase, Phase::Idle)
}

pub fn tray_state(snapshot: &Snapshot) -> TrayState {
    let tooltip = if snapshot.paused {
        "ScreenBreak — paused".to_string()
    } else {
        match snapshot.phase {
            Phase::Idle => format!(
                "ScreenBreak — next break in {}",
                format_clock(snapshot.next_in)
            ),
            Phase::Break if snapshot.break_paused => format!(
                "ScreenBreak — break paused, {} left",
                format_clock(snapshot.remaining)
            ),
            Phase::Break => format!(
                "ScreenBreak — break, {} left",
                format_clock(snapshot.remaining)
            ),
        }
    };

    TrayState {
        tooltip,
        show_now_enabled: can_show_now(snapshot.phase),
        pause_label: if snapshot.paused {
            "Resume"
        } else {
            "Pause for 1 hour"
        },
        skip_enabled: matches!(snapshot.phase, Phase::Break),
    }
}

pub fn update_tray(app: &AppHandle, snapshot: &Snapshot) {
    let state = tray_state(snapshot);

    if let Some(tray) = app.tray_by_id("main") {
        let _ = tray.set_tooltip(Some(&state.tooltip));
    }

    if let Some(items) = app.try_state::<TrayItems>() {
        let _ = items.show_now.set_enabled(state.show_now_enabled);
        let _ = items.pause.set_text(state.pause_label);
        let _ = items.skip.set_enabled(state.skip_enabled);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::scheduler::{BreakKind, Scheduler};
    use crate::settings::Settings;
    use std::time::SystemTime;

    fn snapshot(phase: Phase, paused: bool, break_paused: bool) -> Snapshot {
        Snapshot {
            phase,
            kind: BreakKind::Micro,
            remaining: 20,
            duration: 20,
            next_in: 600,
            breaks_done: 0,
            paused,
            break_paused,
            revision: 0,
            settings: Settings::default(),
        }
    }

    #[test]
    fn show_now_is_enabled_while_idle_including_pause() {
        let state = tray_state(&snapshot(Phase::Idle, true, false));
        assert!(state.show_now_enabled);
        assert_eq!(state.pause_label, "Resume");
        assert_eq!(state.tooltip, "ScreenBreak — paused");
    }

    #[test]
    fn show_now_is_disabled_during_break_including_break_pause() {
        assert!(!tray_state(&snapshot(Phase::Break, false, false)).show_now_enabled);
        assert!(!tray_state(&snapshot(Phase::Break, false, true)).show_now_enabled);
        assert!(!tray_state(&snapshot(Phase::Break, true, false)).show_now_enabled);
    }

    #[test]
    fn skip_is_enabled_only_during_a_break() {
        assert!(!tray_state(&snapshot(Phase::Idle, false, false)).skip_enabled);
        assert!(tray_state(&snapshot(Phase::Break, false, false)).skip_enabled);
        assert!(tray_state(&snapshot(Phase::Break, false, true)).skip_enabled);
    }

    #[test]
    fn tooltip_describes_idle_break_and_pause() {
        assert_eq!(
            tray_state(&snapshot(Phase::Idle, false, false)).tooltip,
            "ScreenBreak — next break in 10:00"
        );
        assert_eq!(
            tray_state(&snapshot(Phase::Break, false, false)).tooltip,
            "ScreenBreak — break, 00:20 left"
        );
        assert_eq!(
            tray_state(&snapshot(Phase::Break, false, true)).tooltip,
            "ScreenBreak — break paused, 00:20 left"
        );
        assert_eq!(
            tray_state(&snapshot(Phase::Break, true, false)).tooltip,
            "ScreenBreak — paused"
        );
    }

    #[test]
    fn scheduler_state_matches_the_menu() {
        let mut scheduler = Scheduler::new(Settings::default());
        assert!(!tray_state(&scheduler.snapshot()).skip_enabled);

        scheduler.show_now();
        assert!(tray_state(&scheduler.snapshot()).skip_enabled);
        assert!(!tray_state(&scheduler.snapshot()).show_now_enabled);

        scheduler.toggle_pause(SystemTime::now());
        assert_eq!(tray_state(&scheduler.snapshot()).pause_label, "Resume");
    }
}

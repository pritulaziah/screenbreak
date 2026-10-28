# ScreenBreak

Break reminders for the desktop. The screen stays available.

## Description

ScreenBreak helps you take short breaks while you work at the computer. A card appears over other windows and does not block the screen.

A micro break lasts 20 seconds and repeats every 10 minutes. Every third break is long and lasts 5 minutes.

The app runs in the system tray. The tray menu opens the settings, pauses the schedule for one hour, skips a break, and quits the app.

## Features

- A reminder card that does not block the screen.
- Micro breaks and long breaks with editable intervals and lengths.
- Three themes: Cozy, Night, and Nature. Each theme has light and dark colors.
- Settings for break, themes, notifications, appearance, sounds, and advanced options.
- A break card with a live countdown and snooze options.
- System tray menu: open settings, pause, skip, and quit.
- Settings are saved between launches.

## Run from source

Requirements: Node.js 20.19 or later, Rust 1.87 or later, and the [Tauri system dependencies](https://tauri.app/start/prerequisites/).

```bash
npm install
npm run tauri dev
```

Build the installer:

```bash
npm run tauri build
```

## License

MIT. See [LICENSE](LICENSE).

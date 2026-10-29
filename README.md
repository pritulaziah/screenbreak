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

## Release

The app version is in `package.json`. `src-tauri/tauri.conf.json` reads the version from that file. The version in `src-tauri/Cargo.toml` is the Rust crate version. Do not change it at release.

1. The working tree must be clean.
2. Run `npm version X.Y.Z`. The command updates `package.json` and `package-lock.json`, creates a commit, and creates the tag `vX.Y.Z`.
3. Run `git push --follow-tags`.

The tag starts the release workflow. The workflow stops if the tag and the `package.json` version differ.

Review the `ScreenBreak vX.Y.Z` draft release and publish it.

## Download

Open the [Releases page](https://github.com/pritulaziah/screenbreak/releases) and download `ScreenBreak_X.Y.Z_x64-setup.exe`. Replace `X.Y.Z` with the release version.

The repository is private. You need Read access to open the Releases page.

The installer runs without administrator rights.

## SmartScreen

The installer is not signed, so Windows shows "Unknown publisher". Choose "More info", then "Run anyway".

## Uninstall

1. Open Settings → Apps → Installed apps on Windows 11, or Settings → Apps → Apps & features on Windows 10.
2. Find ScreenBreak.
3. Choose Uninstall.

## License

MIT. See [LICENSE](LICENSE).

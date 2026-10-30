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
- Settings for break, themes, notifications, appearance, sounds, and
  advanced options.
- A break card with a live countdown and snooze options.
- System tray menu: open settings, pause, skip, and quit.
- Settings are saved between launches.
- Automatic updates from GitHub Releases.

## Run from source

Requirements: Node.js 20.19 or later, Rust 1.87 or later, and the
[Tauri system dependencies](https://tauri.app/start/prerequisites/).

```bash
npm install
npm run tauri dev
```

Build the installer:

```bash
npm run tauri build
```

The build signs the update artifacts. Set `TAURI_SIGNING_PRIVATE_KEY` and
`TAURI_SIGNING_PRIVATE_KEY_PASSWORD` before you build the installer.

## Release

The app version is in `package.json`. `src-tauri/tauri.conf.json` reads the
version from that file. The version in `src-tauri/Cargo.toml` is the Rust
crate version. Do not change it at release.

1. The working tree must be clean.
2. Run `npm version X.Y.Z`. The command updates `package.json` and
   `package-lock.json`, creates a commit, and creates the tag `vX.Y.Z`.
3. Run `git push --follow-tags`.

The tag starts the release workflow. The workflow stops if the tag and the
`package.json` version differ. Add the signing secrets before the first
release with updates (see below).

Review the `ScreenBreak vX.Y.Z` draft release and publish it. The updater
uses only published releases.

### Signing keys

Updates are signed. The public key is in `src-tauri/tauri.conf.json` under
`plugins.updater.pubkey`.

Store the private key and its password outside the repository. Add them to
the repository secrets:

- `TAURI_SIGNING_PRIVATE_KEY` — the private key.
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` — the key password.

Back up both values. If you lose the private key or the password, you cannot
sign updates for installed apps.

The build creates the NSIS installer and its update signature. The workflow
uploads `latest.json` to the draft release. Publish the release to make the
update available.

## Updates

ScreenBreak checks for updates after the settings window starts. The Advanced
settings page also has a manual check. When a new version is available, a
banner offers to install it. The app restarts after the installation.

Updates work from the first version that includes the updater. Install that
version manually. Later versions update in place. The updater reads
`latest.json` from the latest published GitHub release. A draft release does
not deliver updates.

## Download

Open the [Releases page](https://github.com/pritulaziah/screenbreak/releases)
and download `ScreenBreak_X.Y.Z_x64-setup.exe`. Replace `X.Y.Z` with the
release version.

The installer runs without administrator rights.

## SmartScreen

The installer is not code-signed, so Windows shows "Unknown publisher".
Choose "More info", then "Run anyway".

## Uninstall

1. Open Settings → Apps → Installed apps on Windows 11, or Settings → Apps
   → Apps & features on Windows 10.
2. Find ScreenBreak.
3. Choose Uninstall.

## License

MIT. See [LICENSE](LICENSE).

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const configPath = fileURLToPath(
  new URL("../src-tauri/tauri.conf.json", import.meta.url),
);
const capabilitiesDir = fileURLToPath(
  new URL("../src-tauri/capabilities/", import.meta.url),
);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function capability(name) {
  return readJson(`${capabilitiesDir}${name}`);
}

test("builds signed updater artifacts", () => {
  const config = readJson(configPath);

  assert.equal(config.bundle.createUpdaterArtifacts, true);
});

test("reads updates from the latest published GitHub release", () => {
  const config = readJson(configPath);
  const updater = config.plugins?.updater;

  assert.ok(updater, "The updater config is missing.");
  assert.ok(
    typeof updater.pubkey === "string" && updater.pubkey.length > 0,
    "The updater public key is missing.",
  );
  assert.ok(
    Array.isArray(updater.endpoints) &&
      updater.endpoints.some((endpoint) =>
        endpoint.endsWith("/releases/latest/download/latest.json"),
      ),
    "The latest.json endpoint is missing.",
  );
});

test("sets a content security policy for both webviews", () => {
  const config = readJson(configPath);
  const security = config.app?.security;

  assert.ok(security, "The security config is missing.");
  assert.equal(typeof security.csp, "string");
  assert.match(security.csp, /default-src 'self'/);
  assert.match(security.csp, /connect-src ipc: http:\/\/ipc\.localhost/);
  assert.equal(typeof security.devCsp, "string");
});

test("serves only background images through the asset protocol", () => {
  const config = readJson(configPath);
  const asset = config.app?.security?.assetProtocol;

  assert.equal(asset.enable, true);
  assert.deepEqual(asset.scope, ["$APPDATA/break-background-*"]);
});

test("grants the settings window only the updater commands it uses", () => {
  const main = capability("default.json");
  const permissions = main.permissions ?? [];

  assert.ok(permissions.includes("updater:allow-check"));
  assert.ok(permissions.includes("updater:allow-download-and-install"));
  assert.ok(!permissions.includes("updater:default"));
  assert.ok(!permissions.includes("process:default"));
  assert.deepEqual(main.windows, ["main"]);
});

test("keeps plugin authority out of the reminder window", () => {
  const reminder = capability("reminder.json");
  const permissions = reminder.permissions ?? [];

  assert.deepEqual(reminder.windows, ["reminder"]);
  assert.deepEqual(permissions, ["core:event:default"]);
});

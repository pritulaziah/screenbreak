import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const configPath = fileURLToPath(
  new URL("../src-tauri/tauri.conf.json", import.meta.url),
);
const capabilitiesPath = fileURLToPath(
  new URL("../src-tauri/capabilities/default.json", import.meta.url),
);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
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

test("grants the updater and process permissions", () => {
  const capabilities = readJson(capabilitiesPath);
  const permissions = capabilities.permissions ?? [];

  assert.ok(permissions.includes("updater:default"));
  assert.ok(permissions.includes("process:default"));
});

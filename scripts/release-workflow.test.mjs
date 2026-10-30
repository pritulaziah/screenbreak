import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const workflowPath = fileURLToPath(
  new URL("../.github/workflows/release.yml", import.meta.url),
);

function readWorkflow() {
  return readFileSync(workflowPath, "utf8");
}

test("declares the tag trigger", () => {
  const workflow = readWorkflow();

  assert.match(workflow, /^on:\s*$/m);
  assert.match(workflow, /^\s+push:\s*$/m);
  assert.match(workflow, /^\s+tags:\s*\n\s+- ["']?v\*["']?\s*$/m);
});

test("grants contents write permission", () => {
  const workflow = readWorkflow();

  assert.match(workflow, /^permissions:\s*$/m);
  assert.match(workflow, /^\s+contents:\s*write\s*$/m);
});

test("serializes runs for the same tag", () => {
  const workflow = readWorkflow();

  assert.ok(workflow.includes("group: release-${{ github.ref }}"));
  assert.match(workflow, /^\s+cancel-in-progress:\s*false\s*$/m);
});

test("sets the 60 minute timeout", () => {
  assert.match(readWorkflow(), /^\s+timeout-minutes:\s*60\s*$/m);
});

test("uses the Windows runner and pinned build actions", () => {
  const workflow = readWorkflow();

  for (const expected of [
    "runs-on: windows-latest",
    "node-version: 22",
    "cache: npm",
    "rustup default stable",
    "npm ci",
    "actions/checkout@v7",
    "actions/setup-node@v7",
    "Swatinem/rust-cache@v2",
    'workspaces: "src-tauri -> target"',
    "tauri-apps/tauri-action@v1",
  ]) {
    assert.ok(
      workflow.includes(expected),
      `Expected workflow to include ${expected}`,
    );
  }
});

test("runs the version check before the release action", () => {
  const workflow = readWorkflow();
  const versionCheck = workflow.indexOf(
    "node scripts/check-release-version.mjs",
  );
  const releaseAction = workflow.indexOf("tauri-apps/tauri-action@v1");

  assert.notEqual(versionCheck, -1, "Version check step is missing");
  assert.notEqual(releaseAction, -1, "Release action is missing");
  assert.ok(
    versionCheck < releaseAction,
    "Version check must run before the release action",
  );
});

test("passes the draft release inputs", () => {
  const workflow = readWorkflow();

  for (const expected of [
    "secrets.GITHUB_TOKEN",
    "args: --bundles nsis",
    "tagName: ${{ github.ref_name }}",
    "releaseName: ScreenBreak ${{ github.ref_name }}",
    "releaseDraft: true",
    "generateReleaseNotes: true",
    "uploadUpdaterJson: true",
    "secrets.TAURI_SIGNING_PRIVATE_KEY",
    "secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD",
  ]) {
    assert.ok(
      workflow.includes(expected),
      `Expected workflow to include ${expected}`,
    );
  }
});

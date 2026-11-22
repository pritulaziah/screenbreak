import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const workflowPath = fileURLToPath(
  new URL("../.github/workflows/release.yml", import.meta.url),
);
const ciPath = fileURLToPath(
  new URL("../.github/workflows/ci.yml", import.meta.url),
);

function readWorkflow(path = workflowPath) {
  return parse(readFileSync(path, "utf8"));
}

function stepsOf(workflow) {
  return workflow.jobs.release.steps;
}

function stepByRun(steps, command) {
  return steps.find((step) => step.run?.includes(command));
}

test("declares the tag trigger", () => {
  const workflow = readWorkflow();

  assert.deepEqual(workflow.on.push.tags, ["v*"]);
});

test("grants contents write permission", () => {
  const workflow = readWorkflow();

  assert.equal(workflow.permissions.contents, "write");
});

test("serializes runs for the same tag", () => {
  const workflow = readWorkflow();

  assert.equal(workflow.concurrency.group, "release-${{ github.ref }}");
  assert.equal(workflow.concurrency["cancel-in-progress"], false);
});

test("sets the 60 minute timeout", () => {
  assert.equal(readWorkflow().jobs.release["timeout-minutes"], 60);
});

test("uses the Windows runner and immutable action pins", () => {
  const workflow = readWorkflow();
  const steps = stepsOf(workflow);

  assert.equal(workflow.jobs.release["runs-on"], "windows-latest");

  for (const step of steps.filter((item) => item.uses)) {
    assert.match(
      step.uses,
      /@[0-9a-f]{40}$/,
      `${step.name} must pin a full commit SHA`,
    );
  }

  const node = steps.find((step) => step.name === "Set up Node.js");
  assert.equal(node.with["node-version"], 22);
  assert.equal(node.with.cache, "npm");

  assert.ok(stepByRun(steps, "rustup default stable"));
  assert.ok(stepByRun(steps, "npm ci"));
  assert.ok(stepByRun(steps, "node scripts/check-release-version.mjs"));
  assert.ok(stepByRun(steps, "npm test"));
  assert.ok(stepByRun(steps, "npm run build"));
  assert.ok(stepByRun(steps, "cargo test --locked"));
  assert.ok(stepByRun(steps, "cargo fmt --check"));
  assert.ok(stepByRun(steps, "cargo clippy --all-targets --locked -- -D warnings"));
});

test("runs the version check and tests before the release action", () => {
  const steps = stepsOf(readWorkflow());
  const names = steps.map((step) => step.name);
  const release = names.indexOf("Build and draft release");

  assert.notEqual(release, -1, "Release action is missing");

  for (const name of [
    "Check release version",
    "Run tests",
    "Typecheck and build",
    "Run Rust tests",
    "Check Rust formatting",
    "Lint Rust",
  ]) {
    const index = names.indexOf(name);
    assert.notEqual(index, -1, `${name} is missing`);
    assert.ok(index < release, `${name} must run before the release action`);
    assert.ok(!steps[index].if, `${name} must not be conditional`);
    assert.ok(
      !steps[index]["continue-on-error"],
      `${name} must not continue on error`,
    );
  }
});

test("passes the draft release inputs", () => {
  const steps = stepsOf(readWorkflow());
  const release = steps.find((step) => step.name === "Build and draft release");

  assert.equal(release.with.args, "--bundles nsis");
  assert.equal(release.with.tagName, "${{ github.ref_name }}");
  assert.equal(
    release.with.releaseName,
    "ScreenBreak ${{ github.ref_name }}",
  );
  assert.equal(release.with.releaseDraft, true);
  assert.equal(release.with.generateReleaseNotes, true);
  assert.equal(release.with.uploadUpdaterJson, true);
  assert.equal(
    release.env.TAURI_SIGNING_PRIVATE_KEY,
    "${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}",
  );
  assert.equal(
    release.env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD,
    "${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}",
  );
});

test("the CI workflow runs the same checks on pushes and pull requests", () => {
  const workflow = readWorkflow(ciPath);
  const steps = workflow.jobs.check.steps;

  assert.equal(workflow.jobs.check["runs-on"], "windows-latest");
  assert.ok("push" in workflow.on);
  assert.ok("pull_request" in workflow.on);
  assert.ok(stepByRun(steps, "npm test"));
  assert.ok(stepByRun(steps, "npm run build"));
  assert.ok(stepByRun(steps, "cargo test --locked"));
  assert.ok(stepByRun(steps, "cargo fmt --check"));
  assert.ok(stepByRun(steps, "cargo clippy --all-targets --locked -- -D warnings"));
});

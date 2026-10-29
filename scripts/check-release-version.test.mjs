import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { assertReleaseVersion } from "./check-release-version.mjs";

const scriptPath = fileURLToPath(new URL("./check-release-version.mjs", import.meta.url));

const validPackageJson = JSON.stringify({ version: "0.2.0" }, null, 2);
const validTauriConfig = JSON.stringify({ version: "../package.json" }, null, 2);

function createProject(t, { packageJson, tauriConfig } = {}) {
  const directory = mkdtempSync(join(tmpdir(), "screenbreak-version-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));

  if (packageJson !== undefined) {
    writeFileSync(join(directory, "package.json"), packageJson);
  }

  if (tauriConfig !== undefined) {
    mkdirSync(join(directory, "src-tauri"), { recursive: true });
    writeFileSync(join(directory, "src-tauri", "tauri.conf.json"), tauriConfig);
  }

  return directory;
}

function runCli(directory, tag) {
  const env = { ...process.env };
  delete env.GITHUB_REF_NAME;

  if (tag !== undefined) {
    env.GITHUB_REF_NAME = tag;
  }

  return spawnSync(process.execPath, [scriptPath], {
    cwd: directory,
    encoding: "utf8",
    env,
  });
}

test("accepts a tag that matches the package version", () => {
  assert.doesNotThrow(() =>
    assertReleaseVersion({
      tag: "v0.2.0",
      packageVersion: "0.2.0",
      tauriVersion: "../package.json",
    }),
  );
});

test("rejects a tag that differs from the package version", () => {
  assert.throws(
    () =>
      assertReleaseVersion({
        tag: "v9.9.9",
        packageVersion: "0.1.0",
        tauriVersion: "../package.json",
      }),
    (error) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /v9\.9\.9/);
      assert.match(error.message, /(?<!v)9\.9\.9/);
      assert.match(error.message, /0\.1\.0/);
      return true;
    },
  );
});

test("rejects a tauri version that does not reference package.json", () => {
  assert.throws(
    () =>
      assertReleaseVersion({
        tag: "v0.2.0",
        packageVersion: "0.2.0",
        tauriVersion: "0.1.0",
      }),
    (error) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /0\.1\.0/);
      assert.match(error.message, /\.\.\/package\.json/);
      return true;
    },
  );
});

test("exits with status 0 when the tag and configs match", (t) => {
  const directory = createProject(t, {
    packageJson: validPackageJson,
    tauriConfig: validTauriConfig,
  });

  const result = runCli(directory, "v0.2.0");

  assert.equal(result.status, 0, result.stderr);
});

test("exits with status 1 when the tauri config is missing", (t) => {
  const directory = createProject(t, { packageJson: validPackageJson });

  const result = runCli(directory, "v0.2.0");

  assert.equal(result.status, 1);
  assert.match(result.stderr, /tauri\.conf\.json/);
});

test("exits with status 1 when package.json is missing", (t) => {
  const directory = createProject(t);

  const result = runCli(directory, "v0.2.0");

  assert.equal(result.status, 1);
  assert.match(result.stderr, /package\.json/);
});

test("exits with status 1 when package.json is not valid JSON", (t) => {
  const directory = createProject(t, {
    packageJson: '{ "version": ',
    tauriConfig: validTauriConfig,
  });

  const result = runCli(directory, "v0.2.0");

  assert.equal(result.status, 1);
  assert.match(result.stderr, /package\.json/);
});

test("exits with status 1 when package.json is null", (t) => {
  const directory = createProject(t, {
    packageJson: "null",
    tauriConfig: validTauriConfig,
  });

  const result = runCli(directory, "v0.2.0");

  assert.equal(result.status, 1);
  assert.match(result.stderr, /package\.json/);
});

test("exits with status 1 when GITHUB_REF_NAME is unset", (t) => {
  const directory = createProject(t, {
    packageJson: validPackageJson,
    tauriConfig: validTauriConfig,
  });

  const result = runCli(directory);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /GITHUB_REF_NAME/);
});

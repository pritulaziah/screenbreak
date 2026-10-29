import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const TAURI_VERSION_PATH = "../package.json";

export function assertReleaseVersion({ tag, packageVersion, tauriVersion }) {
  const tagVersion = tag.startsWith("v") ? tag.slice(1) : tag;

  if (tagVersion !== packageVersion) {
    throw new Error(
      `Release tag "${tag}" (version "${tagVersion}") does not match the package.json version "${packageVersion}".`,
    );
  }

  if (tauriVersion !== TAURI_VERSION_PATH) {
    throw new Error(
      `tauri.conf.json version is "${tauriVersion}", expected "${TAURI_VERSION_PATH}".`,
    );
  }
}

function readJson(relativePath) {
  let text;

  try {
    text = readFileSync(join(process.cwd(), relativePath), "utf8");
  } catch (error) {
    throw new Error(`Cannot read ${relativePath}: ${error.message}`);
  }

  let value;

  try {
    value = JSON.parse(text);
  } catch (error) {
    throw new Error(`Cannot parse ${relativePath}: ${error.message}`);
  }

  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid ${relativePath}: expected a JSON object.`);
  }

  return value;
}

function run() {
  try {
    const tag = process.env.GITHUB_REF_NAME;

    if (!tag) {
      throw new Error("GITHUB_REF_NAME is not set.");
    }

    const packageJson = readJson("package.json");
    const tauriConfig = readJson("src-tauri/tauri.conf.json");

    assertReleaseVersion({
      tag,
      packageVersion: packageJson.version,
      tauriVersion: tauriConfig.version,
    });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  run();
}

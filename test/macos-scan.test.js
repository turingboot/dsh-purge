import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

test("macOS bundle disables startup host writes", () => {
  const patch = readFileSync(path.join(ROOT, "cordis.macos.patch.yml"), "utf8");
  assert.match(patch, /autoApplyOnStart:\s*false/);
  assert.doesNotMatch(patch, /skipStartup(?:Settle|RestoreMissingOriginals)/);
});

test("package uses the macOS-safe bundle patch", () => {
  const pkg = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8"));
  assert.equal(pkg.dsh.bundle.patch, "./cordis.macos.patch.yml");
  assert.ok(pkg.files.includes("cordis.macos.patch.yml"));
});

test("desktop host enumeration ignores a discoverable Web host under HOME", () => {
  const temp = mkdtempSync(path.join(os.tmpdir(), "dsh-purge-macos-scan-"));
  const app = path.join(temp, "DeepSeek Harness.app");
  const exe = path.join(app, "Contents", "MacOS", "DeepSeek Harness");
  const aiBase = path.join(app, "Contents", "Resources", "app", "dsh", "node_modules", "@deepseek-ai");
  const webBase = path.join(temp, "projects", "web", "node_modules", "@deepseek-ai");
  mkdirSync(path.dirname(exe), { recursive: true });
  writeFileSync(exe, "");
  mkdirSync(path.join(aiBase, "dsh-agent-instructions", "lib"), { recursive: true });
  mkdirSync(path.join(webBase, "dsh-agent-instructions", "lib"), { recursive: true });
  try {
    const script = [
      "import { enumeratePatchAiBases } from './lib/core.js';",
      "process.stdout.write(JSON.stringify(enumeratePatchAiBases()));",
    ].join("\n");
    const env = {
      ...process.env,
      DSH_SURFACE: "desktop",
      DSH_DESKTOP_INSTALL: app,
      DSH_HOME: path.join(temp, ".dsh"),
      HOME: temp,
    };
    delete env.DSH_BASE;
    delete env.DSH_PURGE_INCLUDE_WEB_HOST;
    const run = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
      cwd: ROOT,
      encoding: "utf8",
      timeout: 5000,
      env,
    });
    assert.equal(run.status, 0, run.stderr || `child exited ${run.status}`);
    assert.deepEqual(JSON.parse(run.stdout), [aiBase]);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

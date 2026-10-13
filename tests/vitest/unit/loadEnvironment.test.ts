import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadEnvironment } from "../../../src/utils/loadEnvironment.js";

let directory: string;
let messages: string[];
const report = (message: string) => messages.push(message);

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "ft-env-source-"));
  messages = [];
});

afterEach(() => rmSync(directory, { recursive: true, force: true }));

describe("configuration source", () => {
  it("defaults to development without reading the example", () => {
    writeFileSync(join(directory, ".env.development"), "NODE_ENV=development\nPORT=7000\n");
    writeFileSync(join(directory, ".env.example"), "PORT=9999\n");
    const processEnv: NodeJS.ProcessEnv = {};
    const source = loadEnvironment({ processEnv, cwd: directory, report });
    expect(source).toMatchObject({ file: ".env.development", selection: "default", loaded: true });
    expect(processEnv.PORT).toBe("7000");
    expect(messages.join("\n")).toContain("No se encontró NODE_ENV");
    expect(messages.join("\n")).toContain("Por defecto se usa development");
  });

  it("preserves production with only injected variables", () => {
    const processEnv = { NODE_ENV: "production", TOKEN_KEY_JWT: "synthetic-injected-secret" };
    const source = loadEnvironment({ processEnv, cwd: directory, report });
    expect(source).toMatchObject({ file: null, selection: "process.env", loaded: false });
    expect(messages.join("\n")).not.toContain("synthetic-injected-secret");
  });

  it("loads an explicit profile using dotenv and preserves an empty public port", () => {
    writeFileSync(join(directory, "production.fixture"), "WEB_SITE_PORT =\r\n\r\n// Tokens\r\nTOKEN_KEY_JWT=synthetic-file-secret\r\n");
    const processEnv: NodeJS.ProcessEnv = { NODE_ENV: "production", APP_ENV_FILE: "production.fixture" };
    const source = loadEnvironment({ processEnv, cwd: directory, report });
    expect(source).toMatchObject({ file: "production.fixture", selection: "explicit", loaded: true });
    expect(processEnv.WEB_SITE_PORT).toBe("");
    expect(Number(processEnv.WEB_SITE_PORT)).toBe(0);
    expect(messages.join("\n")).not.toContain("synthetic-file-secret");
  });

  it("reports stale inherited keys without replacing them or logging their values", () => {
    writeFileSync(join(directory, "production.fixture"), "WEB_SITE_PORT=\nTOKEN_KEY_JWT=synthetic-file-secret\n");
    const processEnv = { APP_ENV_FILE: "production.fixture", WEB_SITE_PORT: "// Tokens", TOKEN_KEY_JWT: "synthetic-stale-secret" };
    const source = loadEnvironment({ processEnv, cwd: directory, report });
    expect(source.conflictingKeys).toEqual(["TOKEN_KEY_JWT", "WEB_SITE_PORT"]);
    expect(source.retainedVariables).toBe(2);
    expect(processEnv.WEB_SITE_PORT).toBe("// Tokens");
    expect(messages.join("\n")).not.toMatch(/synthetic-(file|stale)-secret|\/\/ Tokens/);
  });

  it("fails on a missing explicitly selected file", () => {
    expect(() => loadEnvironment({ processEnv: { APP_ENV_FILE: "missing.fixture" }, cwd: directory, report })).toThrow("No se pudo leer el archivo");
    expect(messages.join("\n")).toContain('"loaded":false');
  });

  it("preserves the test profile and injected precedence", () => {
    writeFileSync(join(directory, ".env.test"), "PORT=7000\n");
    const processEnv = { NODE_ENV: "test", PORT: "7001" };
    expect(loadEnvironment({ processEnv, cwd: directory, report })).toMatchObject({ file: ".env.test", selection: "default", loaded: true });
    expect(processEnv.PORT).toBe("7001");
  });

  it("does not fall back to the example when the default file is missing", () => {
    writeFileSync(join(directory, ".env.example"), "PORT=9999\n");
    const processEnv: NodeJS.ProcessEnv = {};
    expect(loadEnvironment({ processEnv, cwd: directory, report })).toMatchObject({ loaded: false, file: ".env.development" });
    expect(processEnv.PORT).toBeUndefined();
  });

  it("checks a complete synthetic profile without connecting to its closed database port", () => {
    const file = join(directory, "synthetic.fixture");
    const fixture = readFileSync("tests/fixtures/ci-quick.env", "utf8");
    writeFileSync(file, fixture.replace(/^WEB_SITE_PORT=.*$/m, "") + "\nWEB_SITE_PORT=\n");
    const processEnv: NodeJS.ProcessEnv = { NODE_ENV: "production", APP_ENV_FILE: file, APP_STAGE: "qa" };
    for (const key of ["Path", "PATH", "SystemRoot", "SYSTEMROOT", "WINDIR", "TEMP", "TMP"]) {
      if (process.env[key]) processEnv[key] = process.env[key];
    }
    const child = spawnSync(process.execPath, ["--import", "tsx", "src/scripts/check_config.ts", "production"], { env: processEnv, encoding: "utf8", windowsHide: true, timeout: 5000 });
    expect(child.status, child.stderr).toBe(0);
    expect(child.stdout).toContain("validation=passed environment=production");
    expect(child.stdout).toContain("database=not-connected");
    expect(child.stdout).toContain("Instancia: qa");
  });

  it("rejects a stale invalid port before startup without exposing its value", () => {
    const file = join(directory, "synthetic.fixture");
    writeFileSync(file, readFileSync("tests/fixtures/ci-quick.env", "utf8").replace(/^WEB_SITE_PORT=.*$/m, "") + "\nWEB_SITE_PORT=\n");
    const processEnv: NodeJS.ProcessEnv = { NODE_ENV: "production", APP_ENV_FILE: file, WEB_SITE_PORT: "// Tokens" };
    for (const key of ["Path", "PATH", "SystemRoot", "SYSTEMROOT", "WINDIR", "TEMP", "TMP"]) {
      if (process.env[key]) processEnv[key] = process.env[key];
    }
    const child = spawnSync(process.execPath, ["--import", "tsx", "src/scripts/check_config.ts", "production"], { env: processEnv, encoding: "utf8", windowsHide: true, timeout: 5000 });
    expect(child.status).toBe(1);
    expect(child.stderr).toContain("Variable WEB_SITE_PORT: inválida");
    expect(child.stdout).toContain("WEB_SITE_PORT");
    expect(child.stdout + child.stderr).not.toContain("// Tokens");
  });

  it("captures missing configuration before importing application dependencies", () => {
    const processEnv: NodeJS.ProcessEnv = { NODE_ENV: "production", APP_ENV_FILE: join(directory, "missing.fixture") };
    for (const key of ["Path", "PATH", "SystemRoot", "SYSTEMROOT", "WINDIR", "TEMP", "TMP"]) {
      if (process.env[key]) processEnv[key] = process.env[key];
    }
    const child = spawnSync(process.execPath, ["--import", "tsx", "src/index.ts"], { env: processEnv, encoding: "utf8", windowsHide: true, timeout: 5000 });
    expect(child.status, child.stderr).toBe(1);
    expect(child.stderr).toContain('"etapa":"configuracion","evento":"fallo"');
    expect(child.stderr).toContain('"category":"archivo_configuracion"');
    expect(child.stdout).not.toMatch(/"etapa":"dependencias"|"evento":"listo"/);
  });
});

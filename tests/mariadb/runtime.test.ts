import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { spawn, execFile, type ChildProcess } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, mkdtemp, writeFile, rm } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { db } from "./businessSupport.js";
import { root, assertTestTarget } from "../../scripts/integration/mariadb-common.mjs";

const runId = process.env.FT_INTEGRATION_RUN_ID!;
const databaseURL = process.env.FT_INTEGRATION_DATABASE_URL!;
assertTestTarget(databaseURL, runId); // No iniciar un backend contra una base ajena.
const execute = promisify(execFile);
const children = new Set<ChildProcess>();
let workspace: string;
let buildDir: string;
let bridge: string;
const evidence: Record<string, unknown> = { runId, startedAt: new Date().toISOString(), node: process.version, platform: process.platform, arch: process.arch, cases: [] };

function environment(port: number): NodeJS.ProcessEnv {
  // Entorno propio: no heredar secretos, NODE_OPTIONS ni conexiones de desarrollo.
  const values: NodeJS.ProcessEnv = {};
  for (const key of ["PATH", "Path", "SystemRoot", "SYSTEMROOT", "WINDIR", "TEMP", "TMP", "HOME", "USERPROFILE"]) {
    if (process.env[key]) values[key] = process.env[key];
  }
  Object.assign(values, {
    NODE_ENV: "production", TZ: "UTC", PORT: String(port), WEB_SITE: "http://127.0.0.1", WEB_SITE_PORT: String(port),
    TOKEN_KEY_JWT: "runtime-synthetic-jwt", TOKEN_KEY_OTP: "runtime-synthetic-otp", MAIL_ENCRYPTION_KEY_COFIG: "runtime-synthetic-mail",
    TELEGRAM_ACTIVE: "false", LOG_LEVEL_CONSOLE: "info", LOG_LEVEL_FILE: "silent",
    PRISMA_DATABASE_FACTORING_NICKNAME: "runtime-exclusive-test", PRISMA_DATABASE_FACTORING_URL: databaseURL,
    PRISMA_DATABASE_FACTORING_TRANSACTION_TIMEOUT: "10000", PRISMA_DATABASE_FACTORING_SLOW_QUERY_THRESHOLD: "200",
    DECOLECTA_BASE_URL: "http://127.0.0.1:1", DECOLECTA_API_TOKEN: "synthetic", APISPERU_BASE_URL: "http://127.0.0.1:1", APISPERU_API_TOKEN: "synthetic",
  });
  for (const suffix of ["QUERY", "INFO", "WARN", "ERROR", "SLOW_QUERIES"]) values[`PRISMA_DATABASE_FACTORING_LOG_${suffix}`] = "false";
  for (const suffix of ["IMPORTANT_TOKEN", "IMPORTANT_CHATID", "IMFORMATION_TOKEN", "IMFORMATION_CHATID", "WARING_TOKEN", "WARRING_CHATID", "ERROR_TOKEN", "ERROR_CHATID"]) values[`TELEGRAM_${suffix}`] = "synthetic";
  return values;
}

async function freePort() {
  const server = createServer();
  await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No se pudo reservar puerto local.");
  const port = address.port;
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}

function launch(env: NodeJS.ProcessEnv) {
  const args = process.platform === "win32" ? ["--import", pathToFileURL(bridge).href] : [];
  const child = spawn(process.execPath, [...args, path.join(buildDir, "index.js")], {
    cwd: workspace, env, shell: false, windowsHide: true,
    stdio: process.platform === "win32" ? ["ignore", "pipe", "pipe", "ipc"] : ["ignore", "pipe", "pipe"],
  });
  children.add(child);
  let output = "";
  child.stdout!.on("data", chunk => { output = (output + chunk.toString()).slice(-64000); });
  child.stderr!.on("data", chunk => { output = (output + chunk.toString()).slice(-64000); });
  const exited = new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code, signal) => { children.delete(child); resolve({ code, signal }); });
  });
  return { child, exited, output: () => output };
}

async function deadline<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  try {
    return await Promise.race([promise, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("El proceso compilado excedió el tiempo permitido.")), milliseconds);
    })]);
  } finally { clearTimeout(timer!); }
}

async function ready(instance: ReturnType<typeof launch>, port: number) {
  for (let attempt = 0; attempt < 120; attempt++) {
    if (instance.child.exitCode !== null || instance.child.signalCode !== null) throw new Error(`El backend terminó antes de escuchar: ${instance.output().replaceAll(databaseURL, "[base exclusiva]")}`);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/ping`, {
        headers: { Origin: "https://app.finanzatech.com", "User-Agent": "Mozilla/5.0 RuntimeRegression" }, signal: AbortSignal.timeout(1000),
      });
      expect(response.status).toBe(200);
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === "AssertionError") throw error;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  throw new Error("El backend compilado no respondió en localhost.");
}

beforeAll(async () => {
  const parent = path.join(root, "coverage/mariadb/runtime");
  await mkdir(parent, { recursive: true });
  workspace = await mkdtemp(path.join(parent, `${runId}-`));
  buildDir = path.join(workspace, "build");
  bridge = path.join(workspace, "windows-signal.mjs");
  // Windows no entrega SIGTERM nativo con child.kill: IPC entrega la señal al hook real.
  await writeFile(bridge, 'process.on("message", message => { if (message === "runtime-test-stop") process.emit("SIGTERM", "SIGTERM"); });\n');
  await mkdir(path.join(workspace, "security/ip"), { recursive: true });
  await writeFile(path.join(workspace, "security/ip/whitelist.txt"), "127.0.0.1\n::1\n");
  await writeFile(path.join(workspace, "security/ip/blacklist.txt"), "");
  await execute(process.execPath, [path.join(root, "node_modules/typescript/bin/tsc"), "--noEmit"], { cwd: root, timeout: 90000, windowsHide: true });
  // Configuración de compilación existente; cambiar únicamente la salida, nunca dist/ZIP.
  await execute(process.execPath, [path.join(root, "node_modules/tsup/dist/cli-default.js"), "--out-dir", buildDir], { cwd: root, timeout: 90000, windowsHide: true });
  evidence.compilation = { sourceTypecheck: "passed", config: "tsup.config.ts", isolatedOutput: true };
}, 180000);

afterAll(async () => {
  for (const child of children) {
    const closed = new Promise(resolve => child.once("close", resolve));
    child.kill("SIGKILL");
    await deadline(closed, 10000);
  }
  await db.$disconnect();
  evidence.finishedAt = new Date().toISOString();
  evidence.status = (evidence.cases as unknown[]).length === 2 ? "passed" : "incomplete-or-failed";
  await mkdir(path.join(root, "coverage/mariadb/runtime"), { recursive: true });
  await writeFile(path.join(root, "coverage/mariadb/runtime", `result-${runId}.json`), JSON.stringify(evidence, null, 2) + "\n");
  if (workspace) {
    const parent = path.resolve(root, "coverage/mariadb/runtime") + path.sep;
    if (!path.resolve(workspace).startsWith(parent)) throw new Error("Limpieza fuera del entorno exclusivo rechazada.");
    await rm(workspace, { recursive: true, force: true });
  }
}, 30000);

describe("Backend compilado: proceso real y MariaDB exclusiva", () => {
  it("arranca, consulta MariaDB por HTTP y cierra mediante el hook real", async () => {
    const port = await freePort();
    const instance = launch(environment(port));
    const response = await ready(instance, port);
    expect(await response.json()).toEqual({ result: "pong" });
    expect(instance.output()).toContain("Database successful connection.");
    if (process.platform === "win32") instance.child.send("runtime-test-stop");
    else instance.child.kill("SIGTERM");
    expect(await deadline(instance.exited, 15000)).toEqual({ code: 0, signal: null });
    expect(instance.output()).toContain("Disconnected.");
    expect(instance.output()).toContain("Graceful shutdown complete.");
    await expect(fetch(`http://127.0.0.1:${port}/ping`, { signal: AbortSignal.timeout(1000) })).rejects.toThrow();
    (evidence.cases as unknown[]).push({ case: "startup-http-shutdown", passed: true, signalDelivery: process.platform === "win32" ? "IPC-to-real-SIGTERM-hook" : "native-SIGTERM" });
  }, 35000);

  it("credenciales MariaDB inválidas agotan reintentos y salen con código 1 sin escuchar", async () => {
    const port = await freePort();
    const url = new URL(databaseURL);
    url.password = "runtime-deliberately-invalid-password";
    const instance = launch({ ...environment(port), PRISMA_DATABASE_FACTORING_URL: url.href });
    expect(await deadline(instance.exited, 45000)).toEqual({ code: 1, signal: null });
    expect(instance.output()).toContain("Max retries reached.");
    expect(instance.output()).toContain("Error starting server:");
    expect(instance.output()).not.toContain("Server running at");
    await expect(fetch(`http://127.0.0.1:${port}/ping`, { signal: AbortSignal.timeout(1000) })).rejects.toThrow();
    (evidence.cases as unknown[]).push({ case: "database-rejected-startup", passed: true });
  }, 55000);
});

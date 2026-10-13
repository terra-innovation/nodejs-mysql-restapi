import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
const root = "/opt/finanzatech/ft-app-backend";
const require = createRequire(`${root}/package.json`);
const fixture = require("dotenv").parse(await readFile("/release/backend/.env.ensayo"));
const { validateEnvironment } = await import("/opt/rehearsal/guard.mjs");
validateEnvironment(fixture);
const temporary = await mkdtemp("/tmp/ft-rehearsal-startup-");
if (!temporary.startsWith("/tmp/ft-rehearsal-startup-")) throw new Error("Ruta temporal rechazada.");
let active;
const results = {};
try {
  await mkdir(`${temporary}/security/ip`, { recursive: true });
  await writeFile(`${temporary}/security/ip/whitelist.txt`, "127.0.0.1\n::1\n");
  await writeFile(`${temporary}/security/ip/blacklist.txt`, "");
  Object.assign(fixture, { NODE_ENV: "development", LOG_LEVEL_FILE: "silent", LOG_LEVEL_CONSOLE: "info" });
  await writeFile(
    `${temporary}/.env.development`,
    Object.entries(fixture)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join("\n"),
  );
  async function trial(invalid = false) {
    const env = { PATH: process.env.PATH, TZ: "UTC", PORT: "5001", ...(invalid ? { WEB_SITE_PORT: "synthetic-invalid-port" } : {}) };
    const child = (active = spawn(process.execPath, [`${root}/dist/index.js`], { cwd: temporary, env, stdio: ["ignore", "pipe", "pipe", "ipc"] }));
    let output = "",
      ready = false;
    child.stdout.on("data", (data) => (output += data));
    child.stderr.on("data", (data) => (output += data));
    child.on("message", (message) => {
      if (message === "ready") ready = true;
    });
    const exited = new Promise((resolve) => child.on("close", (code, signal) => resolve({ code, signal })));
    const limit = setTimeout(() => child.kill("SIGKILL"), 60000);
    try {
      if (invalid) {
        const exit = await exited;
        if (exit.code !== 1 || ready || !output.includes('"etapa":"configuracion","evento":"fallo"') || output.includes("synthetic-invalid-port")) throw new Error("Falló la validación del caso de configuración inválida.");
        return { code: exit.code, noReady: !ready, configurationFailure: true, valueHidden: true };
      }
      for (let attempt = 0; !ready && attempt < 400; attempt++) {
        if (child.exitCode !== null) throw new Error("El ensayo de desarrollo terminó antes de estar listo.");
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (!ready) throw new Error("No llegó la señal ready de desarrollo.");
      const response = await fetch("http://127.0.0.1:5001/ping", { headers: { Origin: "http://localhost:3000", "User-Agent": "Mozilla/5.0 Rehearsal" }, signal: AbortSignal.timeout(3000) });
      if (response.status !== 200 || (await response.json()).result !== "pong") throw new Error("Falló HTTP en desarrollo.");
      child.kill("SIGTERM");
      const exit = await exited;
      if (exit.code !== 0 || !output.includes("No se encontró NODE_ENV") || !output.includes("Por defecto se usa development") || !output.includes("Graceful shutdown complete.")) throw new Error("Falló el fallback o cierre POSIX.");
      return { missingNodeEnvExplained: true, file: ".env.development", ready: true, http: "200/pong", sigtermExit: exit.code };
    } finally {
      clearTimeout(limit);
      if (child.exitCode === null) {
        child.kill("SIGKILL");
        await exited;
      }
      active = undefined;
    }
  }
  results.developmentDefault = await trial();
  results.invalidConfiguration = await trial(true);
  console.log(JSON.stringify(results));
} finally {
  if (active && active.exitCode === null) active.kill("SIGKILL");
  await rm(temporary, { recursive: true, force: true });
}

import { cp, mkdir, readFile, writeFile, access, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { createConnection } from "node:net";
import path from "node:path";
import dotenv from "dotenv";
import { loadBaseline } from "../integration/mariadb-common.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const state = path.join(root, "coverage/ubuntu-arm64-lab");
const frontend = path.resolve(root, "../..", "10_Workspace_react/ft-app-frontend-mantis");
const action = process.argv[2] ?? "help";
const project = "ft-ubuntu-arm64-lab";
const composeFile = path.join(root, "scripts/rehearsal/compose.yml");
const configuration = path.join(state, "compose.env");
const reportPath = path.join(state, "last-check.json");

async function run(program, args, { cwd = root, env = process.env, input, log, capture = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(program, args, { cwd, env, shell: false, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "",
      stderr = "";
    child.on("error", reject);
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      if (!capture && !log) process.stdout.write(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
      if (!capture && !log) process.stderr.write(chunk);
    });
    child.stdin.on("error", () => {});
    child.stdin.end(input);
    child.on("close", async (code) => {
      try {
        if (log) await writeFile(log, stdout + stderr);
        if (code !== 0) return reject(new Error(`${path.basename(program)} terminó con código ${code}${log ? `; consulte ${log}` : ""}.`));
        resolve(stdout.trim());
      } catch (error) {
        reject(error);
      }
    });
  });
}
const compose = (args, options) => {
  const env = { ...process.env };
  for (const key of Object.keys(env)) if (key.startsWith("LAB_") || key.startsWith("COMPOSE_")) delete env[key];
  return run("docker", ["--context", "desktop-linux", "compose", "--project-name", project, "--env-file", configuration, "--file", composeFile, ...args], { ...options, env });
};
const server = (args, options) => compose(["exec", "-T", "server", ...args], options);
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function checkSftpPort() {
  return new Promise((resolve, reject) => {
    const socket = createConnection({ host: "127.0.0.1", port: 2222 });
    socket.setTimeout(5000);
    socket.once("data", (data) => {
      socket.destroy();
      data.toString().startsWith("SSH-2.0-") ? resolve(true) : reject(new Error("El puerto del ensayo no entregó una cabecera SSH válida."));
    });
    socket.once("error", () => {
      socket.destroy();
      reject(new Error("El puerto SFTP del ensayo no es accesible desde Windows."));
    });
    socket.once("timeout", () => {
      socket.destroy();
      reject(new Error("Tiempo agotado al comprobar SFTP local."));
    });
  });
}

async function installDependencies() {
  const inspect = "const f=require('node:fs'),c=require('node:crypto');const h=c.createHash('sha256').update(f.readFileSync('package.json')).update(f.readFileSync('package-lock.json')).update(process.version+process.arch+'omit-dev-ignore-scripts').digest('hex');let saved='';try{saved=f.readFileSync('.lab-dependencies.sha256','utf8')}catch{};console.log(JSON.stringify({hash:h,current:saved===h&&f.existsSync('node_modules/.package-lock.json')&&f.existsSync('node_modules/dotenv/package.json')}))";
  const result = JSON.parse(await server(["node", "-e", inspect], { capture: true }));
  if (result.current) return console.log("Dependencias ARM64 vigentes; se conservan sin reinstalar.");
  await compose(["run", "--rm", "--no-deps", "installer"]);
  if (!/^[a-f0-9]{64}$/.test(result.hash)) throw new Error("Hash de dependencias inválido.");
  await server(["node", "-e", "require('node:fs').writeFileSync('.lab-dependencies.sha256',process.argv[1])", result.hash]);
}

function assertNode() {
  if (process.version !== "v24.21.0") throw new Error("Use el Node portable 24.21.0 indicado en AGENTS.md.");
  console.log(`Node ${process.version}: ${process.execPath}`);
}
async function prepare() {
  assertNode();
  await mkdir(state, { recursive: true });
  const baseline = await loadBaseline();
  let secrets;
  try {
    secrets = JSON.parse(await readFile(path.join(state, "credentials.json"), "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    secrets = { db: randomBytes(24).toString("hex"), dbRoot: randomBytes(24).toString("hex"), sftp: randomBytes(24).toString("hex") };
  }
  await writeFile(path.join(state, "credentials.json"), JSON.stringify(secrets, null, 2));
  await writeFile(configuration, `LAB_STATE=${state.replaceAll("\\", "/")}\nLAB_DB_PASSWORD=${secrets.db}\nLAB_DB_ROOT_PASSWORD=${secrets.dbRoot}\nLAB_SFTP_PASSWORD=${secrets.sftp}\n`);
  // La estructura ya versionada no incluye datos de clientes. No se exporta ninguna base.
  await writeFile(path.join(state, "init.sql"), `SET FOREIGN_KEY_CHECKS=0;\n${baseline.tables.map((table) => `${table.sql};`).join("\n")}\nSET FOREIGN_KEY_CHECKS=1;\nCREATE TABLE IF NOT EXISTS __ft_rehearsal_guard (name VARCHAR(32) PRIMARY KEY);\nINSERT IGNORE INTO __ft_rehearsal_guard VALUES ('ubuntu-arm64');\n`);
  const release = path.join(state, "release/backend");
  await mkdir(release, { recursive: true });
  await run(process.execPath, [path.join(root, "node_modules/@typescript/native/bin/tsc"), "--noEmit"], { log: path.join(state, "typecheck.log") });
  await run(process.execPath, [path.join(root, "node_modules/tsdown/dist/run.mjs"), "--out-dir", path.join(release, "dist")], { log: path.join(state, "backend-build.log") });
  for (const name of ["generated", "assets", "static", "package.json", "package-lock.json", "ecosystem.config.cjs"]) await cp(path.join(root, name), path.join(release, name), { recursive: true, force: true });
  await mkdir(path.join(release, "security/ip"), { recursive: true });
  await writeFile(path.join(release, "security/ip/whitelist.txt"), "127.0.0.1\n::1\n");
  await writeFile(path.join(release, "security/ip/blacklist.txt"), "");
  const values = dotenv.parse(await readFile(path.join(root, "tests/fixtures/ci-quick.env")));
  Object.assign(values, { NODE_ENV: "production", APP_STAGE: "preproduction", PORT: "5000", WEB_SITE: "http://localhost", WEB_SITE_PORT: "18080", LOG_LEVEL_CONSOLE: "info", LOG_LEVEL_FILE: "info", PRISMA_DATABASE_FACTORING_NICKNAME: "ensayo-aislado", PRISMA_DATABASE_FACTORING_URL: `mysql://ft_lab:${secrets.db}@db:3306/ft_rehearsal`, TOKEN_KEY_JWT: randomBytes(32).toString("hex"), TOKEN_KEY_OTP: randomBytes(32).toString("hex"), MAIL_ENCRYPTION_KEY_COFIG: randomBytes(32).toString("hex") });
  await writeFile(
    path.join(release, ".env.ensayo"),
    Object.entries(values)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join("\n") + "\n",
  );
  // Compilación frontend aislada: solo fixture pública, nunca perfiles privados.
  const frontendEnv = { ...process.env };
  for (const key of Object.keys(frontendEnv)) if (key.startsWith("PUBLIC_") || key.startsWith("REACT_APP_") || ["NODE_OPTIONS", "APP_ENV_FILE"].includes(key)) delete frontendEnv[key];
  Object.assign(frontendEnv, dotenv.parse(await readFile(path.join(frontend, ".env.test.example"))), { NODE_ENV: "production", PUBLIC_APP_ENV: "production", PUBLIC_VERSION: "ensayo-arm64", PUBLIC_API_URL: "/backend/", PUBLIC_API_FINANZATECH_URL: "/backend/", BUILD_PATH: path.join(state, "release/frontend"), GENERATE_SOURCEMAP: "false" });
  const frontLogs = path.join(frontend, "docs/registros/compilaciones");
  await mkdir(frontLogs, { recursive: true });
  const frontendOutput = path.resolve(state, "release/frontend");
  if (!frontendOutput.startsWith(path.resolve(root, "coverage") + path.sep)) throw new Error("Salida frontend fuera del área de ensayo.");
  await rm(frontendOutput, { recursive: true, force: true });
  await run(process.execPath, [path.join(frontend, "node_modules/@rsbuild/core/bin/rsbuild.js"), "build", "--no-env"], { cwd: frontend, env: frontendEnv, log: path.join(frontLogs, "build-ensayo-arm64.log") });
  await writeFile(path.join(state, "release.json"), JSON.stringify({ preparedAt: new Date().toISOString(), node: process.version, schemaHash: baseline.sha256, tables: baseline.tables.length, frontendProfile: "public-synthetic", backendProfile: "synthetic-isolated", packaging: "compiled-files-not-archive", rootEnvRead: false }, null, 2));
  console.log(`Entrega de ensayo preparada: ${state}. Credenciales locales en credentials.json; no se imprimieron sus valores.`);
}
async function ready() {
  assertNode();
  const platform = await run("docker", ["--context", "desktop-linux", "info", "--format", "{{.OSType}}"], { capture: true });
  if (platform !== "linux") throw new Error("Docker debe usar contenedores Linux.");
  await access(configuration);
}
async function restart() {
  await server(["node", "/opt/rehearsal/guard.mjs", "check"]);
  await server(["node", "dist/scripts/check_config.js", "production"]);
  await server(["pm2", "startOrRestart", "ecosystem.config.cjs", "--env", "production", "--update-env"]);
  await check();
  await server(["pm2", "save"]);
}
async function check() {
  const versions = await server(["node", "-e", "console.log(JSON.stringify({node:process.version,arch:process.arch,platform:process.platform}))"], { capture: true });
  const os = await server(["cat", "/etc/os-release"], { capture: true });
  const samples = [];
  const select = "const a=JSON.parse(require('node:child_process').execFileSync('pm2',['jlist'],{encoding:'utf8'})).find(a=>a.name==='ft-api-backend');console.log(JSON.stringify(a?{pid:a.pid,status:a.pm2_env.status,restarts:a.pm2_env.restart_time,node:a.pm2_env.node_version}:{}))";
  let ping;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch("http://127.0.0.1:18080/backend/ping", { headers: { "User-Agent": "Mozilla/5.0 FinanzaTechRehearsal" }, signal: AbortSignal.timeout(2000) });
      if (response.status === 200 && (await response.json()).result === "pong") {
        ping = true;
        break;
      }
    } catch {
      /* Solo se consulta el puerto local del ensayo. */
    }
    await sleep(1000);
  }
  if (!ping) throw new Error("La API del ensayo no respondió 200/pong. Consulte logs.");
  for (let index = 0; index < 3; index++) {
    samples.push(JSON.parse(await server(["node", "-e", select], { capture: true })));
    if (index < 2) await sleep(5000);
  }
  const page = await fetch("http://127.0.0.1:18080/", { signal: AbortSignal.timeout(5000) });
  const html = await page.text();
  const stable = samples.every((sample) => sample.pid > 0 && sample.status === "online" && sample.restarts === samples[0].restarts) && new Set(samples.map((sample) => sample.pid)).size === 1;
  const result = { checkedAt: new Date().toISOString(), versions: JSON.parse(versions), ubuntu2204: os.includes('VERSION_ID="22.04"'), http: "200/pong", sftpPortFromWindows: await checkSftpPort(), frontendHTML: page.status === 200 && html.includes('<div id="root">'), stable, samples, limitations: ["ARM64 emulado", "sin systemd ni HTTPS externo", "Origin adaptado por Nginx solo en laboratorio", "sin usuarios/datos reales; navegacion de negocio pendiente"] };
  await writeFile(reportPath, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  if (!result.ubuntu2204 || result.versions.arch !== "arm64" || !result.stable || !result.frontendHTML) throw new Error("Comprobación del ensayo fallida; consulte last-check.json.");
}
async function main() {
  if (action === "prepare") return prepare();
  if (action === "help") return console.log("lab:ubuntu -- prepare | up | check | sftp-check | env-check | startup-check | deploy | restart | logs | stop\nSFTP: 127.0.0.1:2222, usuario ssh_finanzatech, credencial en coverage/ubuntu-arm64-lab/credentials.json.");
  await ready();
  if (action === "up") {
    await compose(["build", "server"]);
    await compose(["up", "--detach", "db", "server", "gateway"]);
    await installDependencies();
    return restart();
  }
  if (action === "check") return check();
  if (action === "sftp-check") return server(["node", "--input-type=module"], { input: await readFile(path.join(root, "scripts/rehearsal/sftp-check.mjs"), "utf8") });
  if (action === "env-check") return server(["node", "--input-type=module", "-", "env"], { input: await readFile(path.join(root, "scripts/rehearsal/sftp-check.mjs"), "utf8") });
  if (action === "startup-check") return server(["node", "--input-type=module"], { input: await readFile(path.join(root, "scripts/rehearsal/startup-check.mjs"), "utf8") });
  if (action === "logs") return server(["pm2", "logs", "ft-api-backend", "--lines", "100", "--nostream"]);
  if (action === "restart") return restart();
  if (action === "deploy") {
    await server(["node", "/opt/rehearsal/entry.mjs", "deploy"]);
    await installDependencies();
    return restart();
  }
  if (action === "stop") return compose(["down"]); // Conserva todos los volúmenes del ensayo.
  throw new Error("Acción desconocida; use help.");
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

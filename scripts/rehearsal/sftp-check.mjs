import { mkdtemp, mkdir, writeFile, readFile, appendFile, rm, chown, chmod } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const execute = promisify(execFile);
const home = "/home/ssh_finanzatech/.ssh";
const authorized = `${home}/authorized_keys`;
const temporary = await mkdtemp("/tmp/ft-rehearsal-sftp-");
if (!temporary.startsWith("/tmp/ft-rehearsal-sftp-")) throw new Error("Ruta temporal rechazada.");
let previous = "";
try {
  await mkdir(home, { recursive: true, mode: 0o700 });
  await chown(home, 1000, 1000);
  try {
    previous = await readFile(authorized, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  await execute("ssh-keygen", ["-q", "-t", "ed25519", "-N", "", "-f", `${temporary}/id`]);
  await appendFile(authorized, `\n${await readFile(`${temporary}/id.pub`, "utf8")}`);
  await chown(authorized, 1000, 1000);
  await chmod(authorized, 0o600);
  await writeFile(`${temporary}/source`, "ensayo-sftp-sintetico\n");
  function sftp(input) {
    return new Promise((resolve, reject) => {
      const child = execute("sftp", ["-i", `${temporary}/id`, "-o", "BatchMode=yes", "-o", "PasswordAuthentication=no", "-o", "StrictHostKeyChecking=no", "-o", `UserKnownHostsFile=${temporary}/known_hosts`, "-b", "-", "ssh_finanzatech@127.0.0.1"]);
      child.child.stdin.end(input);
      child.then(resolve, reject);
    });
  }
  await sftp(`put ${temporary}/source /ft-app-backend/temporal/ensayo-sftp.txt\nget /ft-app-backend/temporal/ensayo-sftp.txt ${temporary}/received\nrm /ft-app-backend/temporal/ensayo-sftp.txt\n`);
  if ((await readFile(`${temporary}/received`, "utf8")) !== "ensayo-sftp-sintetico\n") throw new Error("El archivo descargado difiere del subido.");
  let blocked = false;
  try {
    await sftp("mkdir /fuera-de-las-carpetas\n");
  } catch {
    blocked = true;
  }
  if (!blocked) throw new Error("El usuario pudo escribir fuera de las carpetas permitidas.");
  console.log(JSON.stringify({ sftpUploadDownload: true, outsideWriteBlocked: true, credentialsPrinted: false }));
  if (process.argv[2] === "env") {
    const backend = "/opt/finanzatech/ft-app-backend";
    // Solo el .env sintético del volumen del laboratorio; no se consulta el host.
    const { guard } = await import("/opt/rehearsal/guard.mjs");
    await guard();
    const original = await readFile(`${backend}/.env`, "utf8");
    const updated = original.replace(/^APP_STAGE=.*$/m, 'APP_STAGE="qa"');
    if (updated === original) throw new Error("Use una instancia de ensayo distinta de qa para esta comprobación.");
    await writeFile(`${temporary}/original-env`, original);
    await writeFile(`${temporary}/updated-env`, updated);
    const remoteMarker = `/ft-app-backend/storage/ensayo-env-${temporary.split("-").at(-1)}.txt`;
    const restart = () => execute("pm2", ["restart", "ecosystem.config.cjs", "--env", "production", "--update-env"], { cwd: backend, timeout: 150000, maxBuffer: 2_000_000 });
    try {
      await sftp(`put ${temporary}/source ${remoteMarker}\nput ${temporary}/updated-env /ft-app-backend/.env\n`);
      await restart();
      const list = JSON.parse((await execute("pm2", ["jlist"])).stdout);
      const app = list.find((app) => app.name === "ft-api-backend");
      const logs = await readFile(app.pm2_env.pm_out_log_path, "utf8");
      const records = logs
        .split("\n")
        .filter((line) => line.includes("[arranque] "))
        .map((line) => JSON.parse(line.slice(line.indexOf("[arranque] ") + 11)));
      const loaded = records.find((record) => record.pid === app.pid && record.evento === "configuracion_validada" && record.instancia === "qa" && record.archivo === ".env");
      if (!loaded || (await readFile(`/opt/finanzatech${remoteMarker}`, "utf8")) !== "ensayo-sftp-sintetico\n") throw new Error("No se confirmó la recarga de .env o la persistencia de storage.");
    } finally {
      await sftp(`put ${temporary}/original-env /ft-app-backend/.env\n-rm ${remoteMarker}\n`);
      await restart();
    }
    console.log(JSON.stringify({ envUploadedViaSftp: true, newStageLoaded: "qa", storagePreserved: true, originalEnvRestored: true }));
  }
} finally {
  await writeFile(authorized, previous, { mode: 0o600 });
  await rm(temporary, { recursive: true, force: true });
}

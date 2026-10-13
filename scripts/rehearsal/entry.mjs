import { cp, mkdir, access } from "node:fs/promises";
import { spawn, spawnSync } from "node:child_process";
const base = "/opt/finanzatech";
export const backend = `${base}/ft-app-backend`;
function command(program, args, input) {
  const result = spawnSync(program, args, { input, encoding: "utf8", stdio: input ? ["pipe", "inherit", "inherit"] : "inherit" });
  if (result.error || result.status !== 0) throw new Error(`Falló ${program}`);
}
async function deploy(initial = false) {
  await mkdir(backend, { recursive: true });
  for (const name of ["dist", "generated", "assets", "static", "package.json", "package-lock.json", "ecosystem.config.cjs"]) {
    await cp(`/release/backend/${name}`, `${backend}/${name}`, { recursive: true, force: true });
  }
  // Se copia una configuración sintética únicamente en la preparación inicial.
  if (initial) {
    try {
      await access(`${backend}/.env`);
    } catch {
      await cp("/release/backend/.env.ensayo", `${backend}/.env`);
    }
  }
  await cp("/release/frontend", `${base}/ft-app-frontend-mantis`, { recursive: true, force: true });
  for (const name of ["storage", "temporal", "logs", "security/ip"]) await mkdir(`${backend}/${name}`, { recursive: true });
  if (initial) {
    try {
      await access(`${backend}/security/ip/whitelist.txt`);
    } catch {
      await cp("/release/backend/security", `${backend}/security`, { recursive: true });
    }
  }
  // El usuario SFTP solo recibe permisos sobre las dos carpetas del ensayo.
  command("chown", ["-R", "ssh_finanzatech:ssh_finanzatech", backend, `${base}/ft-app-frontend-mantis`]);
}
if (process.argv[2] === "deploy") {
  command("pm2", ["stop", "ft-api-backend"]);
  await deploy();
  console.log("Archivos desplegados. Se conservaron .env, storage, logs y security. Falta instalar dependencias si cambiaron y reiniciar.");
} else {
  try {
    await access(`${backend}/package.json`);
    console.log("Se conservan los archivos y datos del ensayo existente.");
  } catch {
    await deploy(true);
  }
  command("ssh-keygen", ["-A"]);
  const password = process.env.LAB_SFTP_PASSWORD;
  if (!/^[a-f0-9]{48}$/.test(password ?? "")) throw new Error("Falta la credencial sintética de SFTP.");
  command("chpasswd", [], `ssh_finanzatech:${password}\n`);
  delete process.env.LAB_SFTP_PASSWORD;
  command("nginx", ["-t"]);
  command("nginx", []);
  const ssh = spawn("/usr/sbin/sshd", ["-D", "-e"], { stdio: "inherit" });
  ssh.on("exit", () => process.exit(1));
  for (const signal of ["SIGTERM", "SIGINT"])
    process.on(signal, () => {
      command("pm2", ["kill"]);
      ssh.kill("SIGTERM");
      process.exit(0);
    });
  console.log("Ubuntu ARM64, Nginx y SFTP listos. Instale las dependencias y ejecute restart para iniciar la API.");
}

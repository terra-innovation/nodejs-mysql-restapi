#!/usr/bin/env bash
# Solo lectura de servicios/configuración pública y metadatos; no abre .env.
set -Eeuo pipefail
umask 077
[[ "$EUID" -eq 0 ]] || { printf 'Ejecutar como root.\n'; exit 1; }
work_dir="$(dirname -- "$(readlink -f -- "$0")")"
log="$work_dir/diagnostico-$(date -u +%Y%m%d_%H%M%S).log"
exec > >(tee "$log") 2>&1
backend=/opt/finanzatech/ft-app-backend
frontend=/opt/finanzatech/ft-app-frontend-mantis
optional() { "$@" || printf 'Aviso: comprobación no disponible o con salida distinta de cero.\n'; }
section() { printf '\n=== %s ===\n' "$1"; }

section 'SISTEMA Y CAPACIDAD'
date -u '+Hora UTC: %Y-%m-%d %H:%M:%S'
optional cat /etc/os-release
uname -m
uname -r
optional getconf GNU_LIBC_VERSION
df -h / /opt/finanzatech /root
free -h

section 'NODE Y NPM ACTIVOS EN ESTA SESIÓN'
optional type -a node npm pm2
optional node --version
optional node -p 'process.execPath'
optional npm --version
optional dpkg-query -W '-f=${Package} ${Version} ${Architecture}\n' nodejs nginx mariadb-server
optional apt-mark showhold
optional apt-cache policy nodejs

section 'SERVICIOS Y NODE REAL DEL GESTOR PM2'
for service in mariadb nginx pm2-root; do
  optional systemctl show "$service.service" -p Id -p ActiveState -p SubState -p MainPID -p FragmentPath
done
manager_pid="$(systemctl show pm2-root.service -p MainPID --value 2>/dev/null || true)"
if [[ "$manager_pid" =~ ^[1-9][0-9]*$ && -e "/proc/$manager_pid/exe" ]]; then
  printf 'Ejecutable del gestor: '
  optional readlink "/proc/$manager_pid/exe"
  printf 'Versión real del gestor: '
  optional "/proc/$manager_pid/exe" --version
fi

section 'APLICACIONES PM2: RESUMEN SIN VARIABLES PRIVADAS'
if systemctl is-active --quiet pm2-root.service && command -v pm2 >/dev/null && command -v node >/dev/null; then
  # Nunca imprimir ni guardar el JSON bruto: contiene credenciales del entorno.
  pm2 jlist 2>/dev/null | node -e '
const fs = require("node:fs"), cp = require("node:child_process");
let input = "";
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  try {
    const apps = JSON.parse(input);
    for (const app of apps) {
      const e = app.pm2_env || {};
      let actualNode = "no disponible";
      if (Number.isInteger(app.pid) && app.pid > 0) {
        try { actualNode = cp.execFileSync(`/proc/${app.pid}/exe`, ["--version"], {encoding:"utf8", timeout:5000}).trim(); } catch {}
      }
      const port = e.WEB_SITE_PORT;
      const args = Array.isArray(e.node_args) ? e.node_args.join(" ") : String(e.node_args || "");
      console.log(JSON.stringify({
        name: app.name, pid: app.pid, status: e.status,
        cwd: e.pm_cwd, script: e.pm_exec_path,
        nodeReal: actualNode, nodeRegistrado: e.node_version,
        environment: ["production","development","test"].includes(e.NODE_ENV) ? e.NODE_ENV : "ausente u otro",
        selectorEnv: [".env",".env.development",".env.production",".env.test"].includes(e.APP_ENV_FILE) ? e.APP_ENV_FILE : "ausente u otro",
        usaEnvFileNativo: args.includes("--env-file"),
        estadoPuertoPublicoHeredado: port === undefined ? "ausente" : port === "" ? "vacio" : Number.isFinite(Number(port)) ? "numerico" : "no numerico",
        restarts: e.restart_time,
        uptimeSeconds: e.status === "online" && e.pm_uptime ? Math.floor((Date.now()-e.pm_uptime)/1000) : null
      }, null, 2));
    }
    const binary = fs.realpathSync(process.argv[1]);
    const metadata = JSON.parse(fs.readFileSync(require("node:path").resolve(binary,"../../package.json"),"utf8"));
    console.log("PM2 instalado: " + metadata.version);
  } catch { console.error("No se pudo obtener el resumen PM2. No se imprimieron datos brutos."); process.exitCode=1; }
});
' "$(command -v pm2)" || printf 'Aviso: revisar disponibilidad de PM2.\n'
else
  printf 'No se consulta PM2: el servicio no está activo o faltan herramientas. No se inició ningún daemon.\n'
fi

section 'NGINX, MARIADB Y PUERTOS'
optional nginx -v
optional nginx -t
optional mariadb --version
optional mariadbd --version
if command -v ss >/dev/null; then
  ss -ltnp | awk 'NR==1 || $4 ~ /:(22|80|443|3306|5000)$/'
fi

section 'RUTAS, TAMAÑOS Y PERMISOS; SIN CONTENIDO DE ARCHIVOS PRIVADOS'
for directory in "$backend" "$frontend" "$backend/storage" "$backend/pase-backend-20261013"; do
  if [[ -d "$directory" ]]; then
    optional stat -c '%A %a %U:%G %n' "$directory"
    optional du -sxh -- "$directory"
    optional findmnt -T "$directory" -o TARGET,SOURCE,FSTYPE
  fi
done
for name in assets dist generated logs node_modules security static storage temporal; do
  [[ ! -d "$backend/$name" ]] || optional du -sxh -- "$backend/$name"
done
for file in .env ecosystem.config.cjs package.json package-lock.json; do
  [[ ! -e "$backend/$file" ]] || optional stat -c '%A %U:%G bytes=%s modificado=%y %n' "$backend/$file"
done
printf 'Ruta real de storage: '
optional readlink -f "$backend/storage"
if [[ -d "$backend/storage" ]]; then
  printf 'Cantidad de enlaces en storage: '
  find "$backend/storage" -type l -printf 'enlace\n' | wc -l
fi
optional id ssh_finanzatech
optional id user_finanzatech

section 'VERSIONES PÚBLICAS DEL BACKEND INSTALADO'
if command -v node >/dev/null; then
  node -e '
const fs=require("node:fs"), path=require("node:path"), root=process.argv[1];
try {
  const p=JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));
  console.log(JSON.stringify({name:p.name, version:p.version, engines:p.engines},null,2));
  for (const name of ["@prisma/client","@prisma/adapter-mariadb","prisma","express","mariadb","dotenv"]) {
    try { const m=JSON.parse(fs.readFileSync(path.join(root,"node_modules",name,"package.json"),"utf8")); console.log(name+" instalado: "+m.version); }
    catch { console.log(name+": no instalado en esta ruta"); }
  }
} catch { console.error("No se pudo leer metadata pública del backend."); }
' "$backend"
fi

section 'RESPALDOS EXISTENTES: SOLO UBICACIÓN Y TAMAÑO'
find /root -maxdepth 1 -type d \( -name 'respaldo-*' -o -name 'reversion-*' \) -exec du -sh -- {} +
find /root -maxdepth 2 -type f \( -name 'nodejs*.deb' -o -name 'backend-completo.tar.gz' -o -name 'frontend-completo.tar.gz' \) -printf '%p (%s bytes)\n'

section 'FIN'
printf 'Diagnóstico guardado: %s\n' "$log"
printf 'No se detuvieron servicios, no se abrió .env y no se ejecutó SQL ni instalación.\n'

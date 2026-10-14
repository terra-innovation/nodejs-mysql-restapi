#!/usr/bin/env bash
# Instala dependencias y valida configuración en staging; no inicia la API.
set -Eeuo pipefail
umask 077
[[ "$EUID" -eq 0 ]] || { printf 'Ejecutar como root.\n'; exit 1; }
script="$(readlink -f -- "$0")"
if [[ "${1:-}" != --worker ]]; then
  run_dir="$(mktemp -d /root/validacion-pase-20261013-noche.XXXXXX)"
  printf 'Registro: %s/resultado.log\nSi SSH se cierra, el trabajo continuará.\n' "$run_dir"
  result=0
  systemd-run --unit="ft-pase-validar-${run_dir##*.}" --collect --wait \
    --property=Type=oneshot --property=TimeoutStartSec=1200 \
    /bin/bash "$script" --worker "$run_dir" || result=$?
  [[ ! -f "$run_dir/resultado.log" ]] || cat -- "$run_dir/resultado.log"
  exit "$result"
fi
run_dir="${2:?Falta directorio de registro}"
[[ "$run_dir" =~ ^/root/validacion-pase-20261013-noche\.[[:alnum:]]{6}$ && -d "$run_dir" && ! -L "$run_dir" ]] || exit 1
exec >"$run_dir/resultado.log" 2>&1
phase=recepcion
trap 'code=$?; if [[ "$code" -ne 0 ]]; then printf "ERROR en etapa: %s. Backend detenido; no se activó la nueva versión.\n" "$phase"; fi' EXIT
stage=/opt/finanzatech/ft-app-backend/pase-20261013-noche
backend="$stage/backend"
frontend="$stage/frontend"
backup=/root/respaldo-pase-20261013-noche.NeOM4S
assert_stopped() {
  if systemctl is-active --quiet pm2-root.service; then printf 'PM2 está activo.\n'; exit 1; fi
  [[ "$(systemctl show pm2-root.service -p MainPID --value)" == 0 ]] || exit 1
  if [[ -f /root/.pm2/pm2.pid ]]; then
    daemon_pid="$(cat /root/.pm2/pm2.pid)"
    if [[ "$daemon_pid" =~ ^[1-9][0-9]*$ ]] && kill -0 "$daemon_pid" 2>/dev/null; then
      printf 'Daemon PM2 activo.\n'; exit 1
    fi
  fi
  if ss -H -ltn 'sport = :5000' | grep -q .; then printf 'Puerto 5000 ocupado.\n'; exit 1; fi
}
printf 'Inicio UTC: %s\n' "$(date -u +%FT%TZ)"
[[ "$(/usr/bin/node --version)" == v24.21.0 && "$(/usr/bin/npm --version)" == 11.19.0 && "$(dpkg --print-architecture)" == arm64 ]] || { printf 'Runtime inesperado.\n'; exit 1; }
[[ -f "$backup/RESPALDO_VERIFICADO" ]] || { printf 'Falta el respaldo verificado.\n'; exit 1; }
assert_stopped
for directory in "$stage" "$backend" "$frontend" "$backend/dist" "$backend/generated"; do
  [[ -d "$directory" && "$(readlink -f -- "$directory")" == "$directory" ]] || { printf 'Falta directorio o existe enlace inesperado: %s\n' "$directory"; exit 1; }
done
# Evitar enlaces que salgan de staging o alteren la instalación existente.
if find "$stage" -path "$backend/node_modules" -prune -o -type l -print -quit | grep -q .; then
  printf 'La recepción contiene enlaces simbólicos; revisar antes de instalar.\n'; exit 1
fi
for file in package.json package-lock.json ecosystem.config.cjs .env dist/index.js dist/scripts/check_config.js; do
  [[ -s "$backend/$file" && -f "$backend/$file" ]] || { printf 'Falta archivo requerido o está vacío: %s\n' "$file"; exit 1; }
done
[[ -s "$frontend/index.html" ]] || { printf 'Falta index.html directamente en frontend/.\n'; exit 1; }
for forbidden in .env.development .env.example .npmrc storage logs temporal security; do
  [[ ! -e "$backend/$forbidden" ]] || { printf 'Archivo/carpeta no previsto en recepción: %s. Revisar antes de continuar.\n' "$forbidden"; exit 1; }
done
if [[ -e "$backend/node_modules" || -L "$backend/node_modules" ]]; then
  [[ -d "$backend/node_modules" && ! -L "$backend/node_modules" && "$(stat -c %U "$backend/node_modules")" == root ]] || { printf 'node_modules recibido no corresponde a una instalación previa de este script.\n'; exit 1; }
fi
chmod 600 "$backend/.env"
cd -- "$backend"
clean_node() { env -i PATH=/usr/bin:/bin HOME=/root TZ=UTC /usr/bin/node "$@"; }
clean_node --check dist/index.js
clean_node --check dist/scripts/check_config.js
clean_node --check ecosystem.config.cjs
clean_node --input-type=module <<'NODE'
import fs from 'node:fs';
import { createRequire } from 'node:module';
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
if (p.name !== 'ft-app-backend' || lock.name !== p.name || lock.version !== p.version) throw new Error('Identidad package/lock inesperada');
const require = createRequire(process.cwd() + '/package.json');
const apps = require('./ecosystem.config.cjs').apps;
if (!Array.isArray(apps) || apps.length !== 1) throw new Error('Ecosystem inesperado');
const a = apps[0];
const effective = {...a.env, ...a.env_production};
if (a.name !== 'ft-api-backend' || a.script !== 'dist/index.js' || a.cwd !== process.cwd() || effective.NODE_ENV !== 'production' || effective.APP_ENV_FILE !== '.env' || a.node_args || a.interpreter_args) throw new Error('Ecosystem no corresponde al contrato de producción');
console.log('Package/lock y ecosystem: OK; NODE_ENV=production, APP_ENV_FILE=.env, sin argumentos nativos de carga de env.');
NODE
printf 'Recepción backend/frontend: OK\n'

phase=dependencias
sha256sum package.json package-lock.json >"$run_dir/manifiestos.sha256"
# No se ejecutan scripts de instalación, generación Prisma ni migraciones.
# El detalle npm permanece privado; compartir únicamente resultado.log.
if ! env -i PATH=/usr/bin:/bin HOME=/root TZ=UTC \
  /usr/bin/npm ci --omit=dev --ignore-scripts --no-audit --no-fund \
  >"$run_dir/npm-ci.log" 2>&1 </dev/null; then
  printf 'npm ci falló. El detalle está en el registro privado npm-ci.log; no compartirlo sin revisar posibles credenciales.\n'; exit 1
fi
sha256sum --check "$run_dir/manifiestos.sha256"
printf 'Dependencias de producción instaladas en staging: OK (scripts desactivados).\n'
phase=runtime_prisma
clean_node --input-type=module <<'NODE'
// Importar módulos no crea PrismaClient ni abre conexiones.
for (const name of ['@prisma/client/runtime/client', '@prisma/client/runtime/query_compiler_fast_bg.mysql.mjs', '@prisma/client/runtime/query_compiler_fast_bg.mysql.wasm-base64.mjs', '@prisma/adapter-mariadb']) {
  try { await import(name); console.log(`Carga correcta: ${name}`); }
  catch { console.error(`No se pudo cargar: ${name}`); process.exit(1); }
}
NODE
phase=configuracion
# Entorno limpio: no heredar variables antiguas de SSH, PM2 ni NODE_OPTIONS.
env -i PATH=/usr/bin:/bin HOME=/root TZ=UTC NODE_ENV=production APP_ENV_FILE=.env \
  /usr/bin/node dist/scripts/check_config.js production
assert_stopped
printf 'Verificado UTC: %s\n' "$(date -u +%FT%TZ)" >"$run_dir/VALIDACION_COMPLETA"
printf '\nVALIDACIÓN COMPLETA. No se inició API/PM2 ni se conectó a la BBDD.\n'
printf 'Frontend recibido; su funcionamiento HTTP aún está pendiente.\n'
printf 'Registro para compartir: %s/resultado.log\n' "$run_dir"

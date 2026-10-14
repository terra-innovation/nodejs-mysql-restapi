#!/usr/bin/env bash
# Activa solo el backend. Frontend y datos persistentes permanecen en su lugar.
set -Eeuo pipefail
umask 077
export PM2_HOME=/root/.pm2
[[ "$EUID" -eq 0 ]] || { printf 'Ejecutar como root.\n'; exit 1; }
script="$(readlink -f -- "$0")"
if [[ "${1:-}" != --worker ]]; then
  run_dir="$(mktemp -d /root/activacion-backend-20261013-noche.XXXXXX)"
  printf 'Registro: %s/resultado.log\nTrabajo independiente de SSH; comprobación de estabilidad de unos 3 minutos.\n' "$run_dir"
  result=0
  systemd-run --unit="ft-pase-backend-${run_dir##*.}" --collect --wait \
    --property=Type=oneshot --property=TimeoutStartSec=900 \
    /bin/bash "$script" --worker "$run_dir" || result=$?
  [[ ! -f "$run_dir/resultado.log" ]] || cat -- "$run_dir/resultado.log"
  exit "$result"
fi
run_dir="${2:?Falta registro}"
[[ "$run_dir" =~ ^/root/activacion-backend-20261013-noche\.[[:alnum:]]{6}$ && -d "$run_dir" && ! -L "$run_dir" ]] || exit 1
exec >"$run_dir/resultado.log" 2>&1
backend=/opt/finanzatech/ft-app-backend
incoming="$backend/pase-20261013-noche/backend"
backup=/root/respaldo-pase-20261013-noche.NeOM4S
phase=verificar
start_attempted=0
finish() {
  code=$?
  trap - EXIT
  if [[ "$code" -ne 0 ]]; then
    printf '\nERROR en etapa: %s. No se publica el frontend.\n' "$phase"
    if [[ "$start_attempted" -eq 1 ]]; then
      systemctl stop pm2-root.service >"$run_dir/pm2-stop-tras-fallo.log" 2>&1 || true
      printf 'Se solicitó detener PM2 tras el fallo.\n'
    fi
    printf 'Comparta resultado.log. Registros detallados privados en %s\n' "$run_dir"
    printf 'Reversión disponible, solo si se decide revertir:\n%s/03-revertir-pase.sh %s\n' "$backup" "$backup"
  fi
  exit "$code"
}
trap finish EXIT
trap 'exit 143' TERM
printf 'Inicio UTC: %s\n' "$(date -u +%FT%TZ)"
[[ "$(/usr/bin/node --version)" == v24.21.0 && "$(/usr/bin/npm --version)" == 11.19.0 && "$(dpkg --print-architecture)" == arm64 ]] || exit 1
[[ "$(readlink -f -- "$backend")" == "$backend" && "$(readlink -f -- "$incoming")" == "$incoming" ]] || exit 1
[[ -f "$backup/RESPALDO_VERIFICADO" ]] || exit 1
(cd -- "$backup" && sha256sum --check SHA256SUMS)
if systemctl is-active --quiet pm2-root.service; then printf 'PM2 debe estar detenido.\n'; exit 1; fi
[[ "$(systemctl show pm2-root.service -p MainPID --value)" == 0 ]] || exit 1
if [[ -f /root/.pm2/pm2.pid ]]; then
  daemon_pid="$(cat /root/.pm2/pm2.pid)"
  if [[ "$daemon_pid" =~ ^[1-9][0-9]*$ ]] && kill -0 "$daemon_pid" 2>/dev/null; then printf 'Daemon PM2 todavía activo.\n'; exit 1; fi
fi
if ss -H -ltn 'sport = :5000' | grep -q .; then printf 'Puerto 5000 ocupado.\n'; exit 1; fi
[[ -x /usr/bin/pm2 && -f /etc/systemd/system/pm2-root.service ]] || exit 1
[[ "$(systemctl show pm2-root.service -p Type --value)" == forking && "$(systemctl show pm2-root.service -p PIDFile --value)" == /root/.pm2/pm2.pid ]] || { printf 'Contrato systemd/PM2 inesperado.\n'; exit 1; }
[[ ! -L /etc/systemd/system/pm2-root.service.d && ! -e /etc/systemd/system/pm2-root.service.d/90-ft-pase-produccion.conf && ! -L /etc/systemd/system/pm2-root.service.d/90-ft-pase-produccion.conf ]] || { printf 'Override existente o ruta inesperada.\n'; exit 1; }
[[ "$(/usr/bin/node -p "require('/usr/lib/node_modules/pm2/package.json').version")" == 6.0.8 ]] || { printf 'Versión PM2 diferente de la diagnosticada.\n'; exit 1; }
for directory in storage security logs temporal; do
  [[ -d "$backend/$directory" && ! -L "$backend/$directory" ]] || { printf 'Directorio persistente inesperado: %s\n' "$directory"; exit 1; }
done
items=(dist generated node_modules assets static package.json package-lock.json ecosystem.config.cjs .env)
for name in "${items[@]}"; do
  [[ -e "$incoming/$name" && ! -L "$incoming/$name" && ! -L "$backend/$name" ]] || { printf 'Falta elemento recibido o existe enlace: %s\n' "$name"; exit 1; }
done
clean_node() { env -i PATH=/usr/bin:/bin HOME=/root TZ=UTC /usr/bin/node "$@"; }
phase=preflight_previo
cd -- "$incoming"
env -i PATH=/usr/bin:/bin HOME=/root TZ=UTC NODE_ENV=production APP_ENV_FILE=.env \
  /usr/bin/node dist/scripts/check_config.js production

phase=instalar_archivos
mkdir -m 700 "$run_dir/anterior-backend"
cd -- "$backend"
for name in "${items[@]}"; do
  if [[ -e "$backend/$name" ]]; then mv -- "$backend/$name" "$run_dir/anterior-backend/$name"; fi
  mv -- "$incoming/$name" "$backend/$name"
done
chmod 600 "$backend/.env"
printf 'Nueva versión instalada. Anteriores conservados en %s/anterior-backend\n' "$run_dir"
printf 'storage, security, logs y temporal conservados en sus rutas originales.\n'
phase=preflight_final
env -i PATH=/usr/bin:/bin HOME=/root TZ=UTC NODE_ENV=production APP_ENV_FILE=.env \
  /usr/bin/node dist/scripts/check_config.js production

phase=configurar_servicio
dropin=/etc/systemd/system/pm2-root.service.d
[[ ! -L "$dropin" ]] || exit 1
mkdir -p -- "$dropin"
override="$dropin/90-ft-pase-produccion.conf"
[[ ! -e "$override" && ! -L "$override" ]] || { printf 'Ya existe el override del pase; revisar.\n'; exit 1; }
# El servicio arranca desde ecosystem, no desde el dump antiguo con variables heredadas.
# env -i limpia también el entorno inicial del daemon y sus módulos.
cat >"$override" <<'UNIT'
[Service]
TimeoutStartSec=180
ExecStart=
ExecStart=/usr/bin/env -i HOME=/root USER=root PATH=/usr/local/bin:/usr/bin:/bin PM2_HOME=/root/.pm2 /usr/bin/pm2 start /opt/finanzatech/ft-app-backend/ecosystem.config.cjs --env production
ExecReload=
ExecReload=/usr/bin/env -i HOME=/root USER=root PATH=/usr/local/bin:/usr/bin:/bin PM2_HOME=/root/.pm2 /usr/bin/pm2 restart /opt/finanzatech/ft-app-backend/ecosystem.config.cjs --env production --update-env
UNIT
chmod 644 "$override"
systemctl daemon-reload
printf 'Servicio configurado para iniciar ecosystem en producción con entorno limpio.\n'
phase=iniciar_backend
start_attempted=1
systemctl start pm2-root.service >"$run_dir/pm2-start.log" 2>&1
daemon_pid="$(systemctl show pm2-root.service -p MainPID --value)"
[[ "$daemon_pid" =~ ^[1-9][0-9]*$ && "$(/proc/"$daemon_pid"/exe --version)" == v24.21.0 ]] || { printf 'Daemon PM2 no corresponde a Node 24.21.0.\n'; exit 1; }
printf 'Daemon PM2 iniciado con Node 24.21.0.\n'

phase=comprobar_estabilidad_http
previous=''
for sample in 1 2 3 4 5; do
  sleep 30
  systemctl is-active --quiet pm2-root.service
  state="$(env -i PATH=/usr/bin:/bin HOME=/root PM2_HOME=/root/.pm2 /usr/bin/pm2 jlist 2>"$run_dir/pm2-jlist-error.log" | clean_node -e '
const cp=require("node:child_process");let input="";
process.stdin.on("data",c=>input+=c);process.stdin.on("end",()=>{try{
const list=JSON.parse(input);const apps=list.filter(a=>a.name==="ft-api-backend");
if(apps.length!==1)process.exit(1);const a=apps[0], e=a.pm2_env;
if(e.status!=="online"||!a.pid||e.NODE_ENV!=="production"||e.APP_ENV_FILE!==".env"||e.pm_cwd!=="/opt/finanzatech/ft-app-backend")process.exit(1);
const v=cp.execFileSync(`/proc/${a.pid}/exe`,["--version"],{encoding:"utf8",timeout:5000}).trim();
if(v!=="v24.21.0"||e.restart_time!==0)process.exit(1);
console.log(`${a.pid} ${e.restart_time}`);
}catch{process.exit(1)}});')"
  [[ -z "$previous" || "$previous" == "$state" ]] || { printf 'PID o contador de reinicios cambió.\n'; exit 1; }
  previous="$state"
  status="$(curl --silent --show-error --max-time 15 -A 'Mozilla/5.0 FTDeploymentCheck' \
    -H 'Origin: https://app.finanzatech.com' -o "$run_dir/http.json" -w '%{http_code}' \
    http://127.0.0.1:5000/ping)"
  [[ "$status" == 200 ]] || { printf 'Respuesta HTTP inesperada: %s\n' "$status"; exit 1; }
  clean_node -e 'try{const p=JSON.parse(require("node:fs").readFileSync(process.argv[1],"utf8"));if(p.result!=="pong")process.exit(1)}catch{process.exit(1)}' "$run_dir/http.json"
  printf 'Muestra %s/5: PID/reinicios=%s; Node real=24.21.0; producción/.env; HTTP 200/pong.\n' "$sample" "$state"
done
phase=guardar_estado
env -i PATH=/usr/bin:/bin HOME=/root PM2_HOME=/root/.pm2 /usr/bin/pm2 save >"$run_dir/pm2-save.log" 2>&1
printf 'Verificado UTC: %s\n' "$(date -u +%FT%TZ)" >"$run_dir/BACKEND_ACTIVADO"
printf '\nBACKEND ACTIVADO Y ESTABLE durante las cinco muestras.\n'
printf 'No se ejecutaron migraciones ni SQL de modificación en este script. /ping comprueba la conexión mediante lectura.\n'
printf 'Frontend anterior conservado; publicación del frontend nuevo pendiente.\n'

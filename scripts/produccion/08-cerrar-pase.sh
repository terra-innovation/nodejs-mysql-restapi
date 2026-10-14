#!/usr/bin/env bash
# Cierre operativo: no reinicia servicios ni elimina respaldos.
set -Eeuo pipefail
umask 077
[[ "$EUID" -eq 0 ]] || { printf 'Ejecutar como root.\n'; exit 1; }
script="$(readlink -f -- "$0")"
if [[ "${1:-}" != --worker ]]; then
  run_dir="$(mktemp -d /root/cierre-pase-20261013-noche.XXXXXX)"
  printf 'Registro: %s/resultado.log\n' "$run_dir"
  result=0
  systemd-run --unit="ft-pase-cierre-${run_dir##*.}" --collect --wait \
    --property=Type=oneshot --property=TimeoutStartSec=300 \
    /bin/bash "$script" --worker "$run_dir" || result=$?
  [[ ! -f "$run_dir/resultado.log" ]] || cat -- "$run_dir/resultado.log"
  exit "$result"
fi
run_dir="${2:?Falta registro}"
[[ "$run_dir" =~ ^/root/cierre-pase-20261013-noche\.[[:alnum:]]{6}$ && -d "$run_dir" && ! -L "$run_dir" ]] || exit 1
exec >"$run_dir/resultado.log" 2>&1
phase=verificaciones
trap 'code=$?; if [[ "$code" -ne 0 ]]; then printf "ERROR en etapa: %s. Cierre pendiente; no se detuvo ni revirtió la aplicación.\n" "$phase"; fi' EXIT
backend=/opt/finanzatech/ft-app-backend
frontend=/opt/finanzatech/ft-app-frontend-mantis
stage="$backend/pase-20261013-noche"
backup=/root/respaldo-pase-20261013-noche.NeOM4S
clean_node() { env -i PATH=/usr/bin:/bin HOME=/root TZ=UTC /usr/bin/node "$@"; }
clean_pm2() { env -i PATH=/usr/local/bin:/usr/bin:/bin HOME=/root PM2_HOME=/root/.pm2 /usr/bin/pm2 "$@"; }
printf 'Inicio UTC: %s\n' "$(date -u +%FT%TZ)"
[[ "$(/usr/bin/node --version)" == v24.21.0 && "$(/usr/bin/npm --version)" == 11.19.0 ]] || { printf 'Runtime inesperado.\n'; exit 1; }
[[ "$(dpkg-query -W -f='${Version}' nodejs)" == 24.21.0-1nodesource1 ]] || exit 1
apt-mark showhold | grep -Fx nodejs >/dev/null || { printf 'Falta la fijación de Node para este pase.\n'; exit 1; }
for directory in "$backend" "$frontend" "$backend/storage"; do
  [[ -d "$directory" && "$(readlink -f -- "$directory")" == "$directory" ]] || exit 1
done
[[ -f "$backup/RESPALDO_VERIFICADO" && -x "$backup/03-revertir-pase.sh" ]] || exit 1
[[ "$(stat -c %a "$backend/.env")" == 600 ]] || { printf 'Revisar permisos de .env; se esperaba 600.\n'; exit 1; }
for service in pm2-root nginx mariadb; do
  systemctl is-active --quiet "$service.service" || { printf 'Servicio no activo: %s\n' "$service"; exit 1; }
done
nginx -t
systemctl show pm2-root.service -p ExecStart --value | grep -F 'ecosystem.config.cjs --env production' >/dev/null || { printf 'El servicio no inicia desde ecosystem en producción.\n'; exit 1; }
daemon_pid="$(systemctl show pm2-root.service -p MainPID --value)"
[[ "$daemon_pid" =~ ^[1-9][0-9]*$ && "$(/proc/"$daemon_pid"/exe --version)" == v24.21.0 ]] || exit 1
printf 'Node instalado: 24.21.0; npm: 11.19.0; daemon PM2: Node 24.21.0.\n'
printf 'Node 20 no está instalado como paquete activo; su .deb se conserva para reversión.\n'

phase=estabilidad_http
previous=''
for sample in 1 2 3; do
  sleep 10
  systemctl is-active --quiet pm2-root.service
  state="$(clean_pm2 jlist 2>"$run_dir/pm2-error.log" | clean_node -e '
const cp=require("node:child_process");let input="";
process.stdin.on("data",c=>input+=c);process.stdin.on("end",()=>{try{
const list=JSON.parse(input), apps=list.filter(a=>a.name==="ft-api-backend");
if(apps.length!==1)process.exit(1);const a=apps[0],e=a.pm2_env;
if(e.status!=="online"||!a.pid||e.NODE_ENV!=="production"||e.APP_ENV_FILE!==".env"||e.pm_cwd!=="/opt/finanzatech/ft-app-backend"||e.pm_exec_path!=="/opt/finanzatech/ft-app-backend/dist/index.js"||e.restart_time!==0)process.exit(1);
if(cp.execFileSync(`/proc/${a.pid}/exe`,["--version"],{encoding:"utf8",timeout:5000}).trim()!=="v24.21.0")process.exit(1);
const modules=list.filter(a=>a.name==="pm2-logrotate");
if(modules.length!==1||modules[0].pm2_env.status!=="online")process.exit(1);
console.log(`${a.pid} ${e.restart_time}`);
}catch{process.exit(1)}});')"
  [[ -z "$previous" || "$state" == "$previous" ]] || { printf 'Cambió PID/contador durante el cierre.\n'; exit 1; }
  previous="$state"
  status="$(curl --noproxy '*' --silent --show-error --max-time 15 -A 'Mozilla/5.0 FTDeploymentCheck' \
    -H 'Origin: https://app.finanzatech.com' -o "$run_dir/ping.json" -w '%{http_code}' http://127.0.0.1:5000/ping)"
  [[ "$status" == 200 ]] || { printf 'HTTP backend inesperado: %s\n' "$status"; exit 1; }
  clean_node -e 'try{const p=JSON.parse(require("node:fs").readFileSync(process.argv[1],"utf8"));if(p.result!=="pong")process.exit(1)}catch{process.exit(1)}' "$run_dir/ping.json"
  printf 'Muestra %s/3: PID/reinicios=%s; Node 24; producción/.env; HTTP 200/pong; logrotate activo.\n' "$sample" "$state"
done
status="$(curl --noproxy '*' --resolve app.finanzatech.com:443:127.0.0.1 \
  --silent --show-error --max-time 20 -A 'Mozilla/5.0 FTDeploymentCheck' \
  -o "$run_dir/frontend.html" -w '%{http_code}' 'https://app.finanzatech.com/?ft_cierre=20261013-noche')"
[[ "$status" == 200 ]] || { printf 'HTTP frontend inesperado: %s\n' "$status"; exit 1; }
[[ "$(sha256sum "$frontend/index.html" | cut -d ' ' -f 1)" == "$(sha256sum "$run_dir/frontend.html" | cut -d ' ' -f 1)" ]] || { printf 'Nginx no sirve el index.html publicado.\n'; exit 1; }
printf 'Frontend: HTTPS local validado; index.html coincide con la ruta definitiva.\n'

phase=guardar_arranque
clean_pm2 save >"$run_dir/pm2-save.log" 2>&1
systemctl enable pm2-root.service >"$run_dir/pm2-enable.log" 2>&1
systemctl is-enabled --quiet pm2-root.service
printf 'PM2 guardado; servicio habilitado para iniciar ecosystem en producción al arrancar Ubuntu.\n'
printf 'Arranque automático configurado; no se ha realizado un ensayo de reinicio de la instancia.\n'

phase=retirar_recepcion_vacia
# Solo rmdir: jamás eliminar recursivamente datos ni contenido residual.
for directory in "$stage/backend" "$stage/frontend" "$stage"; do
  if [[ -d "$directory" && ! -L "$directory" && "$(readlink -f -- "$directory")" == "$directory" ]]; then
    if rmdir -- "$directory" 2>/dev/null; then printf 'Recepción vacía retirada: %s\n' "$directory";
    else printf 'Recepción conservada porque contiene archivos: %s\n' "$directory"; fi
  fi
done
printf 'Cierre UTC: %s\n' "$(date -u +%FT%TZ)" >"$run_dir/CIERRE_VERIFICADO"
printf '\nCIERRE TÉCNICO VERIFICADO. Aplicaciones en sus rutas definitivas.\n'
printf 'Respaldos y versiones anteriores conservados. No se reiniciaron servicios ni se ejecutaron migraciones.\n'
printf 'La navegación manual fue confirmada por el usuario antes de la pausa; verificar acceso externo tras retomarla.\n'
printf 'Respaldo completo previo al pase: %s\n' "$backup"
printf 'Atención: una reversión completa devuelve también storage al momento del respaldo; no usarla tras nuevos archivos sin preservarlos.\n'

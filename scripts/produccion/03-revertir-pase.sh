#!/usr/bin/env bash
# Reversión manual del pase: no restaura ni modifica la BBDD.
set -Eeuo pipefail
umask 077
export PM2_HOME=/root/.pm2
[[ "$EUID" -eq 0 ]] || { printf 'Ejecutar como root.\n'; exit 1; }
script="$(readlink -f -- "$0")"

if [[ "${1:-}" != --worker ]]; then
  [[ "$#" -eq 1 ]] || { printf 'Uso: %s /root/respaldo-pase-20261013-noche.XXXXXX\n' "$0"; exit 1; }
  backup_dir="$(readlink -f -- "$1")"
  [[ "$backup_dir" =~ ^/root/respaldo-pase-20261013-noche\.[[:alnum:]]{6}$ && -f "$backup_dir/RESPALDO_VERIFICADO" ]] || { printf 'Se requiere el respaldo verificado de esta ventana.\n'; exit 1; }
  failure_dir="$(mktemp -d /root/reversion-pase-20261013-noche.XXXXXX)"
  printf 'Registro y estado previo a revertir: %s\n' "$failure_dir"
  result=0
  systemd-run --unit="ft-pase-revertir-${failure_dir##*.}" --collect --wait \
    --property=Type=oneshot --property=TimeoutStartSec=1200 \
    /bin/bash "$script" --worker "$backup_dir" "$failure_dir" || result=$?
  [[ ! -f "$failure_dir/resultado.log" ]] || cat -- "$failure_dir/resultado.log"
  exit "$result"
fi

backup_dir="${2:?Falta respaldo}"
failure_dir="${3:?Falta registro}"
[[ "$backup_dir" =~ ^/root/respaldo-pase-20261013-noche\.[[:alnum:]]{6}$ && -f "$backup_dir/RESPALDO_VERIFICADO" && ! -L "$backup_dir" ]] || exit 1
[[ "$failure_dir" =~ ^/root/reversion-pase-20261013-noche\.[[:alnum:]]{6}$ && -d "$failure_dir" && ! -L "$failure_dir" ]] || exit 1
exec >"$failure_dir/resultado.log" 2>&1
phase=validar_respaldo
trap 'code=$?; if [[ "$code" -ne 0 ]]; then printf "ERROR durante %s. Reversión incompleta; revisar este registro.\n" "$phase"; fi' EXIT
cd -- "$backup_dir"
sha256sum --check SHA256SUMS
[[ "$(cat node-original.txt)" == v20.20.2 && "$(dpkg-deb -f nodejs-original.deb Version)" == 20.20.2-1nodesource1 && "$(dpkg-deb -f nodejs-original.deb Architecture)" == arm64 ]] || { printf 'Node de reversión inesperado.\n'; exit 1; }
global_root="$(cat global-root.txt)"
case "$global_root" in /usr/lib/node_modules|/usr/local/lib/node_modules) ;; *) printf 'Prefijo global rechazado.\n'; exit 1 ;; esac
for name in backend frontend pm2-home global-node servicios; do gzip -t "$name.tar.gz"; done

phase=detener_pm2
systemctl stop pm2-root.service >"$failure_dir/pm2-stop.log" 2>&1
if [[ -f "$PM2_HOME/pm2.pid" ]]; then
  daemon_pid="$(cat "$PM2_HOME/pm2.pid")"
  if [[ "$daemon_pid" =~ ^[1-9][0-9]*$ ]] && kill -0 "$daemon_pid" 2>/dev/null; then
    pm2 kill >"$failure_dir/pm2-kill.log" 2>&1
    if kill -0 "$daemon_pid" 2>/dev/null; then printf 'No se pudo detener PM2.\n'; exit 1; fi
  fi
fi

phase=restaurar_node
apt-mark unhold nodejs >"$failure_dir/apt-unhold.log" 2>&1
DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=l apt-get install -y --no-download --no-install-recommends --allow-downgrades \
  "$backup_dir/nodejs-original.deb" >"$failure_dir/restauracion-node.log" 2>&1
hash -r
[[ "$(/usr/bin/node --version)" == v20.20.2 ]] || { printf 'No se restauró Node 20.20.2.\n'; exit 1; }
if grep -Fxq nodejs "$backup_dir/apt-holds.txt"; then apt-mark hold nodejs; fi

phase=preservar_version_retirada
for name in ft-app-backend ft-app-frontend-mantis; do
  target="/opt/finanzatech/$name"
  [[ ! -L "$target" ]] || { printf 'Ruta de aplicación inesperada; no se mueve.\n'; exit 1; }
  if [[ -e "$target" ]]; then mv -- "$target" "$failure_dir/$name"; fi
done
[[ ! -L "$PM2_HOME" && ! -L "$global_root" ]] || { printf 'Rutas de runtime inesperadas; no se continúa.\n'; exit 1; }
if [[ -d "$PM2_HOME" ]]; then mv -- "$PM2_HOME" "$failure_dir/pm2-retirado"; fi
if [[ -d "$global_root" ]]; then mv -- "$global_root" "$failure_dir/global-node-retirado"; fi
if [[ -e /etc/nginx ]]; then mv -- /etc/nginx "$failure_dir/nginx-retirado"; fi
if [[ -d /etc/systemd/system/pm2-root.service.d ]]; then
  mv -- /etc/systemd/system/pm2-root.service.d "$failure_dir/pm2-unit-retirado"
fi

phase=restaurar_archivos
tar --acls --xattrs --numeric-owner -xzpf "$backup_dir/backend.tar.gz" -C /opt/finanzatech >"$failure_dir/backend-extraccion.log" 2>&1
tar --acls --xattrs --numeric-owner -xzpf "$backup_dir/frontend.tar.gz" -C /opt/finanzatech >"$failure_dir/frontend-extraccion.log" 2>&1
tar --acls --xattrs --numeric-owner -xzpf "$backup_dir/global-node.tar.gz" -C / >"$failure_dir/global-node-extraccion.log" 2>&1
tar --acls --xattrs --numeric-owner -xzpf "$backup_dir/pm2-home.tar.gz" -C / >"$failure_dir/pm2-extraccion.log" 2>&1
tar --acls --xattrs --numeric-owner -xzpf "$backup_dir/servicios.tar.gz" -C / >"$failure_dir/servicios-extraccion.log" 2>&1
hash -r
printf 'Backend, frontend, storage, .env, dependencias, runtime y configuración anteriores restaurados.\n'

phase=reiniciar_servicios
systemctl daemon-reload
nginx -t
if systemctl is-active --quiet nginx.service; then systemctl reload nginx.service; else systemctl start nginx.service; fi
systemctl start pm2-root.service >"$failure_dir/pm2-start.log" 2>&1

phase=verificar_estabilidad
previous=''
for sample in 1 2 3; do
  sleep 5
  state="$(pm2 jlist 2>/dev/null | node -e '
const cp=require("node:child_process");let input="";
process.stdin.on("data",c=>input+=c);process.stdin.on("end",()=>{try{
const a=JSON.parse(input).find(a=>a.name==="ft-api-backend");
if(!a||a.pm2_env.status!=="online"||!a.pid)process.exit(1);
const v=cp.execFileSync(`/proc/${a.pid}/exe`,["--version"],{encoding:"utf8",timeout:5000}).trim();
if(v!=="v20.20.2")process.exit(1);
console.log(`${a.pid} ${a.pm2_env.restart_time}`);
}catch{process.exit(1)}});')"
  [[ -z "$previous" || "$previous" == "$state" ]] || { printf 'El proceso no permanece estable.\n'; exit 1; }
  previous="$state"
  printf 'Muestra %s: PID y reinicios=%s; Node real=20.20.2\n' "$sample" "$state"
done
phase=verificar_http
curl --fail --silent --show-error --max-time 15 -A 'Mozilla/5.0 FTDeploymentCheck' \
  -H 'Origin: https://app.finanzatech.com' http://127.0.0.1:5000/ping >"$failure_dir/http.json"
node -e 'try{const p=JSON.parse(require("node:fs").readFileSync(process.argv[1],"utf8"));if(p.result!=="pong")process.exit(1);console.log("HTTP 200/pong: OK")}catch{process.exit(1)}' "$failure_dir/http.json"
pm2 save >"$failure_dir/pm2-save.log" 2>&1
printf 'REVERSIÓN COMPLETADA. La BBDD no se restauró ni se migró.\n'
printf 'Estado retirado conservado en: %s\n' "$failure_dir"

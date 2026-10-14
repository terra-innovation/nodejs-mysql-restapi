#!/usr/bin/env bash
# Preparación de runtime y recepción SFTP. No inicia aplicaciones.
set -Eeuo pipefail
umask 077
[[ "$EUID" -eq 0 ]] || { printf 'Ejecutar como root.\n'; exit 1; }
script="$(readlink -f -- "$0")"
if [[ "${1:-}" != --worker ]]; then
  run_dir="$(mktemp -d /root/preparacion-pase-20261013-noche.XXXXXX)"
  printf 'Registro: %s/resultado.log\nSi SSH se cierra, el trabajo continuará.\n' "$run_dir"
  result=0
  systemd-run --unit="ft-pase-preparar-${run_dir##*.}" --collect --wait \
    --property=Type=oneshot --property=TimeoutStartSec=1200 \
    /bin/bash "$script" --worker "$run_dir" || result=$?
  [[ ! -f "$run_dir/resultado.log" ]] || cat -- "$run_dir/resultado.log"
  exit "$result"
fi
run_dir="${2:?Falta directorio de registro}"
[[ "$run_dir" =~ ^/root/preparacion-pase-20261013-noche\.[[:alnum:]]{6}$ && -d "$run_dir" && ! -L "$run_dir" ]] || exit 1
exec >"$run_dir/resultado.log" 2>&1
backup=/root/respaldo-pase-20261013-noche.NeOM4S
backend=/opt/finanzatech/ft-app-backend
stage="$backend/pase-20261013-noche"
phase=verificaciones
trap 'code=$?; if [[ "$code" -ne 0 ]]; then printf "ERROR en etapa: %s. No se solicitó iniciar el backend. Revisar antes de continuar.\n" "$phase"; fi' EXIT
assert_stopped() {
  if systemctl is-active --quiet pm2-root.service; then
    printf 'PM2 está activo; detener la preparación.\n'; exit 1
  fi
  [[ "$(systemctl show pm2-root.service -p MainPID --value)" == 0 ]] || { printf 'PM2 conserva un proceso principal.\n'; exit 1; }
  if [[ -f /root/.pm2/pm2.pid ]]; then
    daemon_pid="$(cat /root/.pm2/pm2.pid)"
    if [[ "$daemon_pid" =~ ^[1-9][0-9]*$ ]] && kill -0 "$daemon_pid" 2>/dev/null; then
      printf 'Existe un daemon PM2 activo.\n'; exit 1
    fi
  fi
  if ss -H -ltn 'sport = :5000' | grep -q .; then
    printf 'El puerto 5000 está ocupado. Revisar antes de continuar.\n'; exit 1
  fi
}
printf 'Inicio UTC: %s\n' "$(date -u +%FT%TZ)"
[[ -d "$backup" && ! -L "$backup" && -f "$backup/RESPALDO_VERIFICADO" ]] || { printf 'Falta el respaldo nuevo verificado.\n'; exit 1; }
(cd -- "$backup" && sha256sum --check SHA256SUMS)
[[ "$(dpkg --print-architecture)" == arm64 ]] || { printf 'Arquitectura inesperada.\n'; exit 1; }
[[ "$(readlink -f -- "$backend")" == "$backend" && -d "$backend" ]] || { printf 'Ruta backend inesperada.\n'; exit 1; }
assert_stopped
id ssh_finanzatech >/dev/null
getent group ssh_finanzatech >/dev/null
[[ "$(df -Pk /root | awk 'NR==2 {print $4}')" -ge 2097152 ]] || { printf 'Se requieren al menos 2 GiB disponibles.\n'; exit 1; }
case "$(/usr/bin/node --version)" in v20.20.2|v24.21.0) ;; *) printf 'Versión Node inesperada.\n'; exit 1 ;; esac

phase=instalar_node
export DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=l
# Descargar primero; no quitar el hold si el paquete no está disponible.
(cd -- "$run_dir" && apt-get download nodejs=24.21.0-1nodesource1 >descarga-node.log 2>&1 </dev/null)
apt-mark unhold nodejs
apt-get install -y --no-install-recommends "$run_dir/nodejs_24.21.0-1nodesource1_arm64.deb" </dev/null
apt-mark hold nodejs
[[ "$(/usr/bin/node --version)" == v24.21.0 ]] || { printf 'Node no coincide con la versión prevista.\n'; exit 1; }
[[ "$(/usr/bin/npm --version)" == 11.19.0 ]] || { printf 'npm no coincide con 11.19.0; revisar antes de instalar dependencias.\n'; exit 1; }
assert_stopped
printf 'Node: %s\nnpm: %s\nEjecutable: %s\n' "$(/usr/bin/node --version)" "$(/usr/bin/npm --version)" "$(/usr/bin/node -p 'process.execPath')"

phase=preparar_sftp
for directory in "$stage" "$stage/backend" "$stage/frontend"; do
  if [[ -e "$directory" || -L "$directory" ]]; then
    [[ -d "$directory" && ! -L "$directory" && "$(stat -c %U "$directory")" == ssh_finanzatech ]] || { printf 'Directorio existente inesperado: %s\n' "$directory"; exit 1; }
  else
    install -d -m 750 -o ssh_finanzatech -g ssh_finanzatech -- "$directory"
  fi
  [[ "$(readlink -f -- "$directory")" == "$directory" ]] || { printf 'Enlace no previsto en la ruta de recepción.\n'; exit 1; }
done
printf '\nCarpetas listas para SFTP:\n%s/backend\n%s/frontend\n' "$stage" "$stage"
stat -c '%A %U:%G %n' "$stage" "$stage/backend" "$stage/frontend"
printf '\nPREPARACIÓN COMPLETA. PM2 y backend continúan detenidos.\n'
printf 'No se modificaron archivos de la aplicación existente ni se ejecutó SQL.\n'
printf 'Node quedó fijado con apt hold. El respaldo de reversión sigue en %s\n' "$backup"

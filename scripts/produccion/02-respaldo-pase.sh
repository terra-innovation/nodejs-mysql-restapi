#!/usr/bin/env bash
# Respaldo de esta ventana. Archivos privados se archivan sin mostrarlos.
set -Eeuo pipefail
umask 077
export PM2_HOME=/root/.pm2
[[ "$EUID" -eq 0 ]] || { printf 'Ejecutar como root.\n'; exit 1; }
script="$(readlink -f -- "$0")"
work_dir="$(dirname -- "$script")"

if [[ "${1:-}" != --worker ]]; then
  rollback="$work_dir/03-revertir-pase.sh"
  [[ -x "$rollback" ]] || { printf 'Falta preparar y dar permisos a %s\n' "$rollback"; exit 1; }
  backup_dir="$(mktemp -d /root/respaldo-pase-20261013-noche.XXXXXX)"
  cp -- "$rollback" "$backup_dir/03-revertir-pase.sh"
  chmod 700 "$backup_dir/03-revertir-pase.sh"
  printf 'Ruta del nuevo respaldo: %s\n' "$backup_dir"
  printf 'Si se cierra SSH, el trabajo continuará; resultado en %s/resultado.log\n' "$backup_dir"
  result=0
  systemd-run --unit="ft-pase-backup-${backup_dir##*.}" --collect --wait \
    --property=Type=oneshot --property=TimeoutStartSec=1800 \
    /bin/bash "$script" --worker "$backup_dir" || result=$?
  [[ ! -f "$backup_dir/resultado.log" ]] || cat -- "$backup_dir/resultado.log"
  exit "$result"
fi

backup_dir="${2:?Falta directorio de respaldo}"
[[ "$backup_dir" =~ ^/root/respaldo-pase-20261013-noche\.[[:alnum:]]{6}$ && -d "$backup_dir" && ! -L "$backup_dir" ]] || exit 1
exec >"$backup_dir/resultado.log" 2>&1
backend=/opt/finanzatech/ft-app-backend
frontend=/opt/finanzatech/ft-app-frontend-mantis
old_deb=/root/respaldo-node-20261012-154449/nodejs_20.20.2-1nodesource1_arm64.deb
stopped=0
phase=preparacion
finish() {
  code=$?
  trap - EXIT
  if [[ "$code" -ne 0 ]]; then
    printf 'ERROR durante %s. No se marcó el respaldo como verificado.\n' "$phase"
    if [[ "$stopped" -eq 1 ]]; then
      if systemctl start pm2-root.service >"$backup_dir/reinicio-tras-fallo.log" 2>&1; then
        printf 'Se solicitó el inicio del servicio anterior tras fallar el respaldo.\n'
      else
        printf 'No se pudo reiniciar PM2; requiere revisión.\n'
      fi
    fi
  fi
  exit "$code"
}
trap finish EXIT
trap 'exit 143' TERM

printf 'Inicio UTC: %s\n' "$(date -u +%FT%TZ)"
for tool in tar gzip sha256sum node npm pm2 dpkg-deb systemctl curl; do
  command -v "$tool" >/dev/null || { printf 'Falta herramienta: %s\n' "$tool"; exit 1; }
done
[[ -d "$backend" && ! -L "$backend" && -d "$frontend" && ! -L "$frontend" ]] || { printf 'Rutas de aplicación inesperadas.\n'; exit 1; }
[[ "$(node --version)" == v20.20.2 && "$(dpkg --print-architecture)" == arm64 ]] || { printf 'Node/arquitectura cambiaron desde el diagnóstico.\n'; exit 1; }
systemctl is-active --quiet pm2-root.service || { printf 'PM2 no está activo; revisar el estado antes del respaldo.\n'; exit 1; }
available="$(df -Pk /root | awk 'NR==2 {print $4}')"
[[ "$available" -ge 4194304 ]] || { printf 'Se requieren al menos 4 GiB libres para esta operación.\n'; exit 1; }
[[ -f "$old_deb" ]] || { printf 'No se encuentra el paquete de reversión Node 20.\n'; exit 1; }
[[ "$(dpkg-deb -f "$old_deb" Package)" == nodejs && "$(dpkg-deb -f "$old_deb" Version)" == 20.20.2-1nodesource1 && "$(dpkg-deb -f "$old_deb" Architecture)" == arm64 ]] || { printf 'Paquete de reversión inesperado.\n'; exit 1; }
cp -- "$old_deb" "$backup_dir/nodejs-original.deb"
dpkg-deb --fsys-tarfile "$backup_dir/nodejs-original.deb" >/dev/null
node --version >"$backup_dir/node-original.txt"
apt-mark showhold >"$backup_dir/apt-holds.txt"
pm2_entry="$(readlink -f -- "$(command -v pm2)")"
global_root="$(dirname -- "$(dirname -- "$(dirname -- "$pm2_entry")")")"
case "$global_root" in /usr/lib/node_modules|/usr/local/lib/node_modules) ;; *) printf 'Prefijo global PM2 no previsto; revisar antes de continuar.\n'; exit 1 ;; esac
printf '%s\n' "$global_root" >"$backup_dir/global-root.txt"
systemctl is-enabled pm2-root.service >"$backup_dir/pm2-enabled.txt" 2>/dev/null || true
[[ -f /etc/systemd/system/pm2-root.service && ! -L /etc/systemd/system/pm2-root.service && -d /etc/nginx && ! -L /etc/nginx && -d "$PM2_HOME" && ! -L "$PM2_HOME" ]] || { printf 'Falta configuración de servicios o existen enlaces no previstos.\n'; exit 1; }

phase=detener_pm2
pm2 save >"$backup_dir/pm2-save.log" 2>&1
printf 'Estado actual de PM2 guardado.\n'
# Incluir el daemon y logrotate evita cambios en sus archivos durante el tar.
stopped=1
systemctl stop pm2-root.service >"$backup_dir/pm2-stop.log" 2>&1
[[ "$(systemctl show pm2-root.service -p MainPID --value)" == 0 ]] || { printf 'PM2 sigue teniendo proceso principal.\n'; exit 1; }
if [[ -f "$PM2_HOME/pm2.pid" ]]; then
  daemon_pid="$(cat "$PM2_HOME/pm2.pid")"
  if [[ "$daemon_pid" =~ ^[1-9][0-9]*$ ]] && kill -0 "$daemon_pid" 2>/dev/null; then
    printf 'Se detectó un daemon PM2 todavía activo; no se continúa.\n'; exit 1
  fi
fi
printf 'Backend, gestor PM2 y logrotate detenidos. MariaDB y Nginx permanecen activos.\n'

archive() {
  local name="$1" base="$2"
  shift 2
  phase="archivar_$name"
  tar --acls --xattrs --numeric-owner -czpf "$backup_dir/$name.tar.gz" -C "$base" -- "$@" 2>"$backup_dir/$name-creacion.log"
  phase="verificar_$name"
  gzip -t "$backup_dir/$name.tar.gz"
  tar --acls --xattrs --numeric-owner --compare --gzip --file="$backup_dir/$name.tar.gz" --directory="$base" >"$backup_dir/$name-comparacion.log" 2>&1
  printf 'Respaldo %s completo y comparado con el origen: OK\n' "$name"
}

archive backend /opt/finanzatech ft-app-backend
archive frontend /opt/finanzatech ft-app-frontend-mantis
archive pm2-home / root/.pm2
global_entries=("${global_root#/}")
while IFS= read -r -d '' link; do
  resolved="$(readlink -f -- "$link" || true)"
  if [[ "$resolved" == "$global_root/"* ]]; then global_entries+=("${link#/}"); fi
done < <(find /usr/bin /usr/local/bin -maxdepth 1 -type l -print0)
archive global-node / "${global_entries[@]}"
service_entries=(etc/nginx etc/systemd/system/pm2-root.service)
if [[ -d /etc/systemd/system/pm2-root.service.d ]]; then service_entries+=(etc/systemd/system/pm2-root.service.d); fi
archive servicios / "${service_entries[@]}"

phase=verificar_integridad
cd -- "$backup_dir"
sha256sum backend.tar.gz frontend.tar.gz pm2-home.tar.gz global-node.tar.gz servicios.tar.gz \
  nodejs-original.deb node-original.txt global-root.txt apt-holds.txt pm2-enabled.txt 03-revertir-pase.sh >SHA256SUMS
sha256sum --check SHA256SUMS
printf 'Verificado UTC: %s\n' "$(date -u +%FT%TZ)" >RESPALDO_VERIFICADO
printf '%s\n' "$backup_dir" >"$work_dir/ultimo-respaldo-verificado.txt"
du -sh -- "$backup_dir"
printf '\nRESPALDO NUEVO VERIFICADO: %s\n' "$backup_dir"
printf 'El backend queda DETENIDO para continuar el pase. No se ejecutó SQL ni se instaló software.\n'
printf 'Reversión preparada, ejecutar solamente si se decide revertir:\n%s/03-revertir-pase.sh %s\n' "$backup_dir" "$backup_dir"

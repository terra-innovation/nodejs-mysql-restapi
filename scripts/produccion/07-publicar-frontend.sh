#!/usr/bin/env bash
# Publica archivos estáticos y comprueba HTTPS por el Nginx local.
set -Eeuo pipefail
umask 077
[[ "$EUID" -eq 0 ]] || { printf 'Ejecutar como root.\n'; exit 1; }
script="$(readlink -f -- "$0")"
if [[ "${1:-}" != --worker ]]; then
  run_dir="$(mktemp -d /root/activacion-frontend-20261013-noche.XXXXXX)"
  printf 'Registro: %s/resultado.log\n' "$run_dir"
  result=0
  systemd-run --unit="ft-pase-frontend-${run_dir##*.}" --collect --wait \
    --property=Type=oneshot --property=TimeoutStartSec=600 \
    /bin/bash "$script" --worker "$run_dir" || result=$?
  [[ ! -f "$run_dir/resultado.log" ]] || cat -- "$run_dir/resultado.log"
  exit "$result"
fi
run_dir="${2:?Falta registro}"
[[ "$run_dir" =~ ^/root/activacion-frontend-20261013-noche\.[[:alnum:]]{6}$ && -d "$run_dir" && ! -L "$run_dir" ]] || exit 1
exec >"$run_dir/resultado.log" 2>&1
incoming=/opt/finanzatech/ft-app-backend/pase-20261013-noche/frontend
frontend=/opt/finanzatech/ft-app-frontend-mantis
backup=/root/respaldo-pase-20261013-noche.NeOM4S
phase=verificar
old_names=()
new_names=()
finish() {
  code=$?
  trap - EXIT
  if [[ "$code" -ne 0 ]]; then
    printf '\nERROR en etapa: %s.\n' "$phase"
    if [[ ${#old_names[@]} -gt 0 || ${#new_names[@]} -gt 0 ]]; then
      recovery=0
      mkdir -p -- "$run_dir/frontend-fallido" || recovery=1
      for name in "${new_names[@]}"; do
        mv -- "$frontend/$name" "$run_dir/frontend-fallido/$name" || recovery=1
      done
      for name in "${old_names[@]}"; do
        mv -- "$run_dir/anterior-frontend/$name" "$frontend/$name" || recovery=1
      done
      if [[ "$recovery" -eq 0 ]]; then printf 'Archivos del frontend anterior repuestos. Backend nuevo permanece activo.\n';
      else printf 'Reposición de frontend incompleta; revisar antes de continuar.\n'; fi
    fi
    printf 'Comparta resultado.log. Respaldo completo de reversión: %s\n' "$backup"
  fi
  exit "$code"
}
trap finish EXIT
trap 'exit 143' TERM
printf 'Inicio UTC: %s\n' "$(date -u +%FT%TZ)"
[[ "$(/usr/bin/node --version)" == v24.21.0 ]] || exit 1
[[ -f "$backup/RESPALDO_VERIFICADO" ]] || exit 1
for directory in "$incoming" "$frontend"; do
  [[ -d "$directory" && "$(readlink -f -- "$directory")" == "$directory" ]] || exit 1
done
[[ -s "$incoming/index.html" ]] || { printf 'Falta index.html.\n'; exit 1; }
if find "$incoming" -type l -print -quit | grep -q .; then printf 'Enlaces simbólicos en recepción; revisar.\n'; exit 1; fi
if find "$incoming" \( -name '.env*' -o -name '.npmrc' -o -name 'package.json' -o -name 'ecosystem.config.cjs' \) -print -quit | grep -q .; then
  printf 'La recepción frontend contiene archivos de configuración no publicables.\n'; exit 1
fi
systemctl is-active --quiet pm2-root.service
systemctl is-active --quiet nginx.service
nginx -t
clean_node() { env -i PATH=/usr/bin:/bin HOME=/root TZ=UTC /usr/bin/node "$@"; }
check_ping() {
  local status
  status="$(curl --silent --show-error --max-time 15 -A 'Mozilla/5.0 FTDeploymentCheck' \
    -H 'Origin: https://app.finanzatech.com' -o "$run_dir/ping.json" -w '%{http_code}' http://127.0.0.1:5000/ping)"
  [[ "$status" == 200 ]] || return 1
  clean_node -e 'try{const p=JSON.parse(require("node:fs").readFileSync(process.argv[1],"utf8"));if(p.result!=="pong")process.exit(1)}catch{process.exit(1)}' "$run_dir/ping.json"
}
check_ping
printf 'Backend: HTTP 200/pong antes de publicar.\n'
phase=validar_referencias
clean_node --input-type=module - "$incoming" "$run_dir/referencias.tsv" <<'NODE'
import fs from 'node:fs';
import path from 'node:path';
const root=process.argv[2], output=process.argv[3];
const base='https://app.finanzatech.com/';
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const refs=new Map();
for(const tag of html.matchAll(/<(?:script|link)\b[^>]*>/gi)) {
  const value=tag[0].match(/\b(?:src|href)\s*=\s*["']([^"']+)["']/i)?.[1];
  if(!value)continue;
  const url=new URL(value.replaceAll('&amp;','&'),base);
  if(url.origin!==new URL(base).origin)continue;
  const rel=decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const file=path.resolve(root,rel);
  if(!file.startsWith(root+path.sep)||/[\t\r\n]/.test(rel+url.href)||!fs.statSync(file).isFile())throw new Error('Referencia estática local inválida o ausente');
  refs.set(rel,url.href);
}
if(![...refs.keys()].some(name=>name.endsWith('.js')))throw new Error('index.html no referencia JavaScript local');
fs.writeFileSync(output,[...refs].map(([name,url])=>`${name}\t${url}`).join('\n')+'\n');
console.log(`Referencias locales de index.html verificadas: ${refs.size}`);
NODE
# Permisos solo sobre el contenido público recibido; no sobre backend/datos.
find "$incoming" -type d -exec chmod 755 {} +
find "$incoming" -type f -exec chmod 644 {} +
mkdir -m 700 "$run_dir/anterior-frontend"
phase=publicar
shopt -s nullglob dotglob
for entry in "$frontend"/*; do
  name="${entry##*/}"
  mv -- "$entry" "$run_dir/anterior-frontend/$name"
  old_names+=("$name")
done
for entry in "$incoming"/*; do
  name="${entry##*/}"
  mv -- "$entry" "$frontend/$name"
  new_names+=("$name")
done
printf 'Frontend publicado; directorio raíz y sus permisos originales conservados.\n'
printf 'Frontend anterior: %s/anterior-frontend\n' "$run_dir"

phase=verificar_https
check_file() {
  local relative="$1" url="$2" status actual expected
  status="$(curl --noproxy '*' --resolve app.finanzatech.com:443:127.0.0.1 \
    --silent --show-error --max-time 20 -A 'Mozilla/5.0 FTDeploymentCheck' \
    -o "$run_dir/respuesta-http" -w '%{http_code}' "$url")"
  [[ "$status" == 200 ]] || { printf 'HTTP inesperado: %s\n' "$status"; return 1; }
  actual="$(sha256sum "$run_dir/respuesta-http" | cut -d ' ' -f 1)"
  expected="$(sha256sum "$frontend/$relative" | cut -d ' ' -f 1)"
  [[ "$actual" == "$expected" ]] || { printf 'El contenido servido no coincide con el archivo publicado.\n'; return 1; }
}
check_file index.html 'https://app.finanzatech.com/?ft_pase=20261013-noche'
printf 'HTTPS local: certificado validado, index.html HTTP 200 y contenido idéntico al publicado.\n'
count=0
while IFS=$'\t' read -r relative url; do
  check_file "$relative" "$url"
  count=$((count+1))
done <"$run_dir/referencias.tsv"
printf 'Recursos directos de index.html: %s comprobados por HTTPS y SHA256.\n' "$count"
check_ping
printf 'Backend: HTTP 200/pong después de publicar.\n'
printf 'Verificado UTC: %s\n' "$(date -u +%FT%TZ)" >"$run_dir/FRONTEND_PUBLICADO"
printf '\nFRONTEND PUBLICADO Y VERIFICADO MEDIANTE NGINX LOCAL CON HTTPS.\n'
printf 'No fue necesario reiniciar Nginx: su configuración no cambió.\n'
printf 'Pendiente navegación manual externa: acceso, rutas, carga de pantallas y operaciones habituales.\n'

#!/bin/sh
set -eu
: "${PORT:=8080}"

SRC="/etc/nginx/templates/default.conf.template"
[ -f /etc/nginx/default.conf.template ] && SRC="/etc/nginx/default.conf.template"

DST="/etc/nginx/conf.d/default.conf"

echo "[gen-conf] Generando $DST con PORT=${PORT}"
envsubst '${PORT}' < "$SRC" > "$DST"
echo "[gen-conf] Primeras líneas de $DST:"
head -n 15 "$DST" || true

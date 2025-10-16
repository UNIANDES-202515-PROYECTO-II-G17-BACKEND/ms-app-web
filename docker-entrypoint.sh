#!/bin/sh
set -e

# Asegura carpeta de assets dentro de 'browser'
mkdir -p /usr/share/nginx/html/browser/assets

# Genera env.js desde el template con la variable de entorno
GATEWAY_BASE_URL_ESCAPED=$(printf '%s' "${GATEWAY_BASE_URL}" | sed 's/[&/\]/\\&/g')

sed "s|__GATEWAY_BASE_URL__|${GATEWAY_BASE_URL_ESCAPED}|g" \
  /usr/share/nginx/html/browser/assets/env.template.js \
  > /usr/share/nginx/html/browser/assets/env.js

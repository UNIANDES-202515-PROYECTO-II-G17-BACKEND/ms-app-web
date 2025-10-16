#!/bin/sh
set -e

# Asegura carpeta de assets
mkdir -p /usr/share/nginx/html/assets

# Escapa caracteres especiales y genera env.js
GATEWAY_BASE_URL_ESCAPED=$(printf '%s' "${GATEWAY_BASE_URL}" | sed 's/[&/\]/\\&/g')
sed "s|__GATEWAY_BASE_URL__|${GATEWAY_BASE_URL_ESCAPED}|g" \
  /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js

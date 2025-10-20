#!/bin/sh
set -eu

# Detecta root real
if [ -d /usr/share/nginx/html/browser ]; then
  WEB_ROOT="/usr/share/nginx/html/browser"
else
  WEB_ROOT="/usr/share/nginx/html"
fi

ASSETS_DIR="$WEB_ROOT/assets"
TEMPLATE="$ASSETS_DIR/env.template.js"
TARGET="$ASSETS_DIR/env.js"

mkdir -p "$ASSETS_DIR"

: "${GATEWAY_BASE_URL:=https://example.com}"
: "${ENVIRONMENT:=production}"
: "${BUILD_VERSION:=unknown}"

# Crea template mínimo si no existe
if [ ! -f "$TEMPLATE" ]; then
  cat > "$TEMPLATE" <<'EOF'
window.__env = {
  GATEWAY_BASE_URL: "__GATEWAY_BASE_URL__",
  ENVIRONMENT: "__ENVIRONMENT__",
  BUILD_VERSION: "__BUILD_VERSION__"
};
EOF
fi

escape() { printf '%s' "$1" | sed 's/[&\\]/\\&/g'; }

GBU_ESC="$(escape "$GATEWAY_BASE_URL")"
ENV_ESC="$(escape "$ENVIRONMENT")"
VER_ESC="$(escape "$BUILD_VERSION")"

sed -e "s|__GATEWAY_BASE_URL__|$GBU_ESC|g" \
    -e "s|__ENVIRONMENT__|$ENV_ESC|g" \
    -e "s|__BUILD_VERSION__|$VER_ESC|g" \
    "$TEMPLATE" > "$TARGET"

echo "[entrypoint] env.js -> $TARGET"

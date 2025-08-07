#!/bin/sh

set -e

CONFIG_PATH=/usr/share/nginx/html/config.json

mkdir -p "$(dirname "$CONFIG_PATH")"

cat <<EOF > "$CONFIG_PATH"
{
  "API_URL": "${API_URL:-http://localhost:8000}",
  "APP_NAME": "${APP_NAME:-ChuanitosLab}",
  "version": "1.0.0",
  "features": {
    "enableLogging": true
  }
}
EOF

echo "Generated config:"
cat "$CONFIG_PATH"

# Now run NGINX in the foreground
exec nginx -g 'daemon off;'

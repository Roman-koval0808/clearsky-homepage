#!/usr/bin/env bash
# Setup SSL for ClearSky Homepage using certbot.
# Usage: sudo ./scripts/setup-ssl.sh [domain] [www.domain]
# Default: clearskysoftware.net www.clearskysoftware.net

set -e

DOMAIN="${1:-clearskysoftware.net}"
DOMAIN_WWW="${2:-www.clearskysoftware.net}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_NAME="clearsky-homepage"

echo "Domain: $DOMAIN (and $DOMAIN_WWW)"
echo "Project dir: $PROJECT_DIR"

# Copy nginx config (already uses clearskysoftware.net; script supports override via args)
TMP_CONF="/tmp/nginx-${CONFIG_NAME}.conf"
cp "$PROJECT_DIR/nginx-clearsky-homepage.conf" "$TMP_CONF"

# Install nginx config
if [ -d /etc/nginx/sites-available ]; then
  sudo cp "$TMP_CONF" /etc/nginx/sites-available/"$CONFIG_NAME"
  sudo ln -sf /etc/nginx/sites-available/"$CONFIG_NAME" /etc/nginx/sites-enabled/
else
  sudo cp "$TMP_CONF" /etc/nginx/conf.d/"$CONFIG_NAME".conf
fi
rm -f "$TMP_CONF"

# Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx

# Obtain certificate (certbot will modify nginx config for HTTPS)
echo "Running certbot for $DOMAIN and $DOMAIN_WWW ..."
sudo certbot --nginx -d "$DOMAIN" -d "$DOMAIN_WWW" --non-interactive --agree-tos --redirect \
  --register-unsafely-without-email 2>/dev/null || \
  sudo certbot --nginx -d "$DOMAIN" -d "$DOMAIN_WWW"

echo "Done. Visit https://$DOMAIN to verify."

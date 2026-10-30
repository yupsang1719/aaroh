#!/usr/bin/env bash
# One-time setup of the Aaroh website on an Ubuntu server that already has Node.js, nginx and
# certbot. Run as root. Safe to re-run: it skips what already exists. It does not reload nginx
# or request certificates; those steps are printed at the end.
set -euo pipefail

REPO=https://github.com/yupsang1719/aaroh.git
APP_DIR=/var/www/aaroh

echo "→ App user"
if ! id aaroh >/dev/null 2>&1; then
  # System user: no password and no login shell; owns only the app's files.
  useradd --system --create-home --home-dir /home/aaroh --shell /usr/sbin/nologin aaroh
fi

echo "→ Code"
if [ ! -d "$APP_DIR/.git" ]; then
  install -d -o aaroh -g aaroh "$APP_DIR"
  sudo -u aaroh -H git clone --quiet "$REPO" "$APP_DIR"
fi

echo "→ Settings (/etc/aaroh/aaroh.env)"
install -d -m 750 -o root -g aaroh /etc/aaroh
if [ ! -f /etc/aaroh/aaroh.env ]; then
  install -m 640 -o root -g aaroh "$APP_DIR/deploy/aaroh.env.example" /etc/aaroh/aaroh.env
fi

echo "→ systemd service"
install -m 644 "$APP_DIR/deploy/aaroh.service" /etc/systemd/system/aaroh.service
systemctl daemon-reload
systemctl enable aaroh >/dev/null

echo "→ nginx site (not enabled yet)"
if [ ! -f /etc/nginx/sites-available/aaroh ]; then
  install -m 644 "$APP_DIR/deploy/nginx-aaroh.conf" /etc/nginx/sites-available/aaroh
fi

echo "→ First build and start"
"$APP_DIR/deploy/deploy.sh"

cat <<'NEXT'

Done. Next steps:
  1. Enable the site:   ln -s /etc/nginx/sites-available/aaroh /etc/nginx/sites-enabled/aaroh
                        nginx -t && systemctl reload nginx
  2. Point DNS (GoDaddy): A records for @ and www → this server's IP.
  3. HTTPS, once DNS resolves here:
                        certbot --nginx -d aaroh.co.uk -d www.aaroh.co.uk --redirect
NEXT

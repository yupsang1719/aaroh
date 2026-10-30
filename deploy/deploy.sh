#!/usr/bin/env bash
# Deploys the latest main branch. Run on the server as root:
#   /var/www/aaroh/deploy/deploy.sh
# or from your computer:
#   ssh root@161.97.166.20 /var/www/aaroh/deploy/deploy.sh
set -euo pipefail

APP_DIR=/var/www/aaroh
PORT=$(grep -E '^PORT=' /etc/aaroh/aaroh.env | cut -d= -f2)
as_app() { sudo -u aaroh -H "$@"; }

cd "$APP_DIR"
echo "→ Fetching latest code"
as_app git pull --ff-only --quiet origin main
echo "  $(as_app git log -1 --format='%h %s')"

echo "→ Installing dependencies"
as_app npm ci --include=dev --no-audit --no-fund --loglevel=error

echo "→ Checking content"
as_app npm run --silent check:content

echo "→ Building"
as_app npm run --silent build >/dev/null

echo "→ Restarting"
systemctl restart aaroh
for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${PORT}/api/health" >/dev/null 2>&1; then
    echo "✓ Live: $(as_app git log -1 --format='%h %s')"
    exit 0
  fi
  sleep 1
done
echo "✗ The site did not come back. Recent logs:"
journalctl -u aaroh -n 30 --no-pager
exit 1

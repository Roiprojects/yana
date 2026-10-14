#!/usr/bin/env bash
set -e

echo "====================================================="
echo "   Yana Travels — Production Server Deployment"
echo "====================================================="

# 1. Ensure directory is current
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

# 2. Configure .env if missing or incomplete
if [ ! -f .env ]; then
  echo "--> Creating .env configuration file..."
  cat << 'EOF' > .env
PORT=4000
NODE_ENV=production
ADMIN_EMAIL=admin@yanatravels.com
ADMIN_PASSWORD=admin123
AUTH_SECRET=yana_admin_production_auth_secret_stable_key_2026_yana_travels_min_32_chars
DATABASE_URL=postgres://yanat710:5UwsNVK0RI0DGVsC4BOmR9cLP@168.119.64.101:5432/yanat710
EOF
fi

# 3. Free port 4000 from any stuck / zombie node processes
echo "--> Checking and releasing port 4000..."
fuser -k 4000/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true

# 4. Install dependencies
echo "--> Installing dependencies..."
npm install --production=false

# 5. Build production frontend (dist/) & backend bundle (server-dist/index.js)
echo "--> Building production assets..."
npm run build

# 6. Start or restart with PM2
echo "--> Starting production server with PM2..."
if command -v pm2 &> /dev/null; then
  pm2 delete yana-travels 2>/dev/null || true
  pm2 start server-dist/index.js --name "yana-travels"
  pm2 save
  echo "--> PM2 process started successfully!"
else
  echo "--> PM2 not installed globally. Starting with nohup in background..."
  nohup node server-dist/index.js > server.log 2>&1 &
fi

sleep 2

# 7. Health check test
echo "--> Verifying server health on port 4000..."
curl -s http://127.0.0.1:4000/api/health || true
echo ""
echo "====================================================="
echo "   Deployment Complete!"
echo "   Admin Login: admin@yanatravels.com / admin123"
echo "====================================================="

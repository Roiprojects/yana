#!/usr/bin/env bash
set -e

echo "====================================================="
echo "   Yana Travels — Production Server Deployment"
echo "====================================================="

# 1. Ensure directory is current
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

# 2. Verify required system tools
for cmd in node npm; do
  if ! command -v "$cmd" &> /dev/null; then
    echo "--> ERROR: Required tool '$cmd' is not installed or not in PATH."
    exit 1
  fi
done
echo "--> Node version: $(node -v), NPM version: $(npm -v)"

# 3. Environment configuration validation (Never overwrite existing .env)
if [ ! -f .env ]; then
  if [ -f .env.hosting ]; then
    echo "--> Notice: Initializing .env from existing .env.hosting..."
    cp .env.hosting .env
  elif [ -f .env.example ]; then
    echo "--> Notice: Creating initial .env from .env.example..."
    cp .env.example .env
    echo "--> WARNING: Created .env template. Please configure your production DATABASE_URL before proceeding."
  else
    echo "--> ERROR: .env configuration file not found."
    echo "--> Please create a .env file with DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, and AUTH_SECRET."
    exit 1
  fi
fi

# Verify required variables are defined in .env without printing values
if ! grep -q "^DATABASE_URL=" .env && ! grep -q "^DB_HOST=" .env; then
  echo "--> ERROR: DATABASE_URL is not configured in .env."
  exit 1
else
  echo "--> Database configuration verified in .env."
fi

if ! grep -q "^AUTH_SECRET=" .env; then
  echo "--> ERROR: AUTH_SECRET is not configured in .env."
  exit 1
fi

# 4. Stop only verified Yana Travels application processes
echo "--> Checking for existing Yana Travels processes..."
if command -v pm2 &> /dev/null; then
  pm2 stop yana-travels 2>/dev/null || true
fi

# Check if port 4000 is still occupied by an orphaned node process
PORT_4000_PID=$(lsof -ti :4000 2>/dev/null || fuser 4000/tcp 2>/dev/null || true)
if [ -n "$PORT_4000_PID" ]; then
  for pid in $PORT_4000_PID; do
    COMM=$(ps -p "$pid" -o comm= 2>/dev/null || true)
    if [[ "$COMM" == *"node"* ]] || [[ "$COMM" == *"tsx"* ]]; then
      echo "--> Stopping orphaned Node process on port 4000 (PID: $pid)..."
      kill "$pid" 2>/dev/null || true
    fi
  done
  sleep 1
fi

# Stop any orphaned development Vite server on port 5173
PORT_5173_PID=$(lsof -ti :5173 2>/dev/null || fuser 5173/tcp 2>/dev/null || true)
if [ -n "$PORT_5173_PID" ]; then
  for pid in $PORT_5173_PID; do
    COMM=$(ps -p "$pid" -o comm= 2>/dev/null || true)
    if [[ "$COMM" == *"node"* ]] || [[ "$COMM" == *"vite"* ]]; then
      echo "--> Stopping legacy development Vite process on port 5173 (PID: $pid)..."
      kill "$pid" 2>/dev/null || true
    fi
  done
  sleep 1
fi

# 5. Install dependencies and compile production build
echo "--> Installing dependencies..."
npm install --production=false

echo "--> Building production assets (Vite client & server bundle)..."
npm run build

# 6. Start production process with PM2
echo "--> Starting production server with PM2..."
if command -v pm2 &> /dev/null; then
  if [ -f ecosystem.config.cjs ]; then
    pm2 startOrRestart ecosystem.config.cjs --env production
  else
    pm2 delete yana-travels 2>/dev/null || true
    pm2 start server-dist/index.js --name "yana-travels"
  fi
  pm2 save
  echo "--> PM2 process active."
else
  echo "--> PM2 not installed globally. Starting server with node in background..."
  nohup node server-dist/index.js > server.log 2>&1 &
fi

sleep 2

# 7. Verification health checks
echo "--> Running health checks against local backend..."
HEALTH_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4000/api/health || echo "000")
READY_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4000/api/ready || echo "000")

if [ "$HEALTH_HTTP" = "200" ]; then
  echo "--> [OK] Backend Liveness: HTTP 200 (server process is responding)"
else
  echo "--> [WARNING] Backend Liveness: returned HTTP $HEALTH_HTTP"
fi

if [ "$READY_HTTP" = "200" ]; then
  echo "--> [OK] Database Connectivity: HTTP 200 (database connected & operational)"
else
  echo "--> [INFO] Database Readiness: returned HTTP $READY_HTTP (inspect /api/ready for details)"
fi

echo "====================================================="
echo "   Deployment Complete!"
echo "====================================================="

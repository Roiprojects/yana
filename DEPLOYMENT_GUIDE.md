# YANA TRAVELS — PRODUCTION DEPLOYMENT & APACHE SETUP GUIDE

## 1. Summary of What Was Happening & The Root Cause

1. **Development vs. Production Mode**:
   - The production server was running `npm run dev` / `vite` on port 5173.
   - Vite dev server was serving `/@vite/client` and uncompiled `/src/main.tsx` directly to production visitors.
   - Vite dev server attempts to proxy `/api` calls to `http://localhost:4000`.
   - The Express backend server (`server/index.ts`) was either not running on port 4000, or the reverse proxy was only connected to the frontend dev server, causing all `/api/*` endpoints to return `404 Not Found` (`{"error":"Not found","code":"NOT_FOUND"}`).

2. **Frontend vs. Backend In Production**:
   - In production, **you do not run Vite**.
   - The React frontend is compiled into static production assets inside the `dist/` directory via `npm run build`.
   - The Express backend (`server/index.ts`) **serves both**:
     - The static frontend (`dist/index.html` + `/dist/assets/*`)
     - All API endpoints (`/api/auth/login`, `/api/auth/me`, `/api/packages`, etc.)
     - The SPA client-side fallback routes (`/admin`, `/admin/login`, `/packages`, etc.)
   - Running the Express server on port 4000 (or your configured `PORT`) provides both frontend and backend from a single unified Node process.

---

## 2. Server Deployment Steps (Ubuntu / Apache)

### Step 1: Upload the Updated Code
Upload `YANA_TRAVELS_PRODUCTION_READY.zip` from your Desktop to your server:
```bash
# On your server (e.g., in /var/www/yana-travels or your chosen folder):
cd /var/www/yana-travels
unzip -o YANA_TRAVELS_PRODUCTION_READY.zip
npm install
```

### Step 2: Ensure Environment Variables (.env)
Make sure you have a `.env` file in the project root with the following:
```env
PORT=4000
ADMIN_EMAIL=admin@yanatravels.com
ADMIN_PASSWORD=admin123
AUTH_SECRET=a_very_long_secure_random_auth_secret_2026_yana_travels
DATABASE_URL=postgres://yanat710:5UwsNVK0RI0DGVsC4BOmR9cLP@168.119.64.101:5432/yanat710
NODE_ENV=production
```

### Step 3: Build the Frontend
```bash
npm run build
```
*(This produces the optimized production output in `dist/`)*

### Step 4: Start the Production Server with PM2
Stop any previous Vite dev processes or old node instances:
```bash
# Stop old processes if running
pm2 delete yana-travels || true

# Start the unified production server
pm2 start "npm start" --name "yana-travels"

# Save the PM2 process list so it restarts on system reboot
pm2 save
```

---

## 3. Apache VirtualHost Configuration

In your Apache configuration for `yanat.roiclients.co.in` (e.g., `/etc/apache2/sites-available/yanat.roiclients.co.in.conf` or `/etc/apache2/sites-available/yanat.roiclients.co.in-le-ssl.conf`):

Ensure the proxy modules are enabled:
```bash
sudo a2enmod proxy proxy_http rewrite headers
```

Then configure your VirtualHost block as follows:

```apache
<VirtualHost *:443>
    ServerName yanat.roiclients.co.in

    # SSL Certificate configuration
    SSLEngine on
    # SSLCertificateFile ...
    # SSLCertificateKeyFile ...

    # Preserve host and pass client headers
    ProxyPreserveHost On
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port "443"

    # Forward all traffic (both frontend and /api/*) to the Express production server
    ProxyPass / http://127.0.0.1:4000/
    ProxyPassReverse / http://127.0.0.1:4000/

    ErrorLog ${APACHE_LOG_DIR}/yana_error.log
    CustomLog ${APACHE_LOG_DIR}/yana_access.log combined
</VirtualHost>
```

Reload Apache:
```bash
sudo systemctl reload apache2
```

---

## 4. Admin Credentials & Verification

- **Admin Login URL:** `https://yanat.roiclients.co.in/admin/login`
- **Email:** `admin@yanatravels.com`
- **Password:** `admin123`

### What happens now:
1. Navigating to `https://yanat.roiclients.co.in/api/auth/login` in the browser automatically redirects to `https://yanat.roiclients.co.in/admin/login`.
2. Logging in with valid credentials issues a secure HTTP-only signed session cookie and immediately navigates to `/admin`.
3. If invalid credentials are entered, a clear error message is shown on the login form without navigating away.

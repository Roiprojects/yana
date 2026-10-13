// cPanel "Setup Node.js App" (Phusion Passenger) entry point.
// Application startup file: app.cjs   — loads the compiled ESM server.
const fs = require("node:fs");
const path = require("node:path");
const dotenv = require("dotenv");

for (const p of [
  path.join(__dirname, ".env"),
  path.join(__dirname, ".env.hosting"),
  path.join(__dirname, ".env.production"),
]) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}
dotenv.config();

import("./server-dist/index.js").catch((err) => {
  console.error(JSON.stringify({ level: "error", event: "server.boot_failed", message: err.message, stack: err.stack }));
  process.exit(1);
});

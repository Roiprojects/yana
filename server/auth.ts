import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";

/**
 * Minimal admin auth: an HMAC-signed session token stored in an httpOnly cookie.
 * Credentials live in env (ADMIN_EMAIL/ADMIN_PASSWORD); the cookie is signed with
 * AUTH_SECRET and cannot be forged without it.
 */

export const SESSION_COOKIE = "yana_admin";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function hmac(data: string): string {
  const secret = (process.env.AUTH_SECRET || "yana_default_secure_auth_secret_2026")
    .trim()
    .replace(/^["']|["']$/g, "");
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

/** Constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/** Verify email/password against env credentials or default admin. */
export function verifyCredentials(email: string, password: string): boolean {
  const e = (process.env.ADMIN_EMAIL || "admin@yanatravels.com")
    .trim()
    .replace(/^["']|["']$/g, "");
  const p = (process.env.ADMIN_PASSWORD || "admin123")
    .trim()
    .replace(/^["']|["']$/g, "");
  if (!email || !password) return false;
  return (
    safeEqual(email.trim().toLowerCase(), e.trim().toLowerCase()) &&
    safeEqual(password, p)
  );
}

/** Create a signed session token: `<payloadB64>.<sig>`. */
export async function createSessionToken(email: string): Promise<string> {
  const payload = Buffer.from(
    JSON.stringify({ sub: email.trim().toLowerCase(), exp: Date.now() + MAX_AGE_SECONDS * 1000 }),
  ).toString("base64url");
  const sig = hmac(payload);
  return `${payload}.${sig}`;
}

/** Validate a session token; returns the subject email or null. */
export async function verifySessionToken(
  token: string | undefined,
): Promise<string | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = hmac(payload);
  if (!safeEqual(sig, expected)) return null;
  try {
    const json = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { sub?: string; exp?: number };
    if (!json.exp || json.exp < Date.now()) return null;
    return json.sub ?? null;
  } catch {
    return null;
  }
}

/** Read a single cookie by name from the raw Cookie header. */
export function readCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.cookie;
  if (!raw) return undefined;
  for (const part of raw.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key === name) return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return undefined;
}

/** Set the signed session cookie on a response. */
export function setSessionCookie(
  req: Request,
  res: Response,
  token: string,
): void {
  const isHttps =
    req.secure ||
    req.headers["x-forwarded-proto"] === "https" ||
    process.env.NODE_ENV === "production";
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/",
    maxAge: MAX_AGE_SECONDS * 1000,
  });
}

/** Clear the session cookie. */
export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

/**
 * Express middleware guarding /admin/* API routes. Reads the session cookie,
 * verifies it, and attaches the authenticated email to res.locals.adminEmail.
 * Responds 401 when unauthenticated.
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = readCookie(req, SESSION_COOKIE);
  const email = await verifySessionToken(token);
  if (!email) {
    res.status(401).json({ ok: false, error: "Not authorised." });
    return;
  }
  res.locals.adminEmail = email;
  next();
}

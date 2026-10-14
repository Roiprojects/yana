import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";

/**
 * Minimal admin auth: an HMAC-signed session token stored in an httpOnly cookie.
 * Credentials live in env (ADMIN_EMAIL/ADMIN_PASSWORD); the cookie is signed with
 * AUTH_SECRET and cannot be forged without it.
 */

export const SESSION_COOKIE = "yana_admin";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

const IS_PROD = () => process.env.NODE_ENV === "production";
const clean = (v: string | undefined) => (v ?? "").trim().replace(/^["']|["']$/g, "");

export class AuthConfigError extends Error {
  constructor(missing: string) {
    super(`Auth configuration missing: ${missing}`);
    this.name = "AuthConfigError";
  }
}

/** Read an auth env var; requires configuration in production. */
function getAuthSecret(): string {
  const secret = clean(process.env.AUTH_SECRET);
  if (secret) return secret;
  if (IS_PROD()) {
    throw new AuthConfigError("AUTH_SECRET environment variable is required in production");
  }
  return "dev_fallback_secret_key_minimum_32_characters_yana_travels";
}

function hmac(data: string): string {
  const secret = getAuthSecret();
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

/** Constant-time string comparison that never throws on length mismatch. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Verify email/password against env credentials. */
export function verifyCredentials(email: string, password: string): boolean {
  if (!email || !password) return false;
  const configuredEmail = clean(process.env.ADMIN_EMAIL) || (IS_PROD() ? "" : "admin@yanatravels.com");
  const configuredPassword = clean(process.env.ADMIN_PASSWORD) || (IS_PROD() ? "" : "admin123");

  if (!configuredEmail || !configuredPassword) {
    throw new AuthConfigError("ADMIN_EMAIL and ADMIN_PASSWORD must be configured in environment");
  }

  try {
    return (
      safeEqual(email.trim().toLowerCase(), configuredEmail.trim().toLowerCase()) &&
      safeEqual(password, configuredPassword)
    );
  } catch {
    return false;
  }
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
  let expected: string;
  try {
    expected = hmac(payload);
  } catch {
    return null;
  }
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
    sameSite: isHttps ? "none" : "lax",
    secure: isHttps,
    path: "/",
    maxAge: MAX_AGE_SECONDS * 1000,
  });
}

/** Clear the session cookie. */
export function clearSessionCookie(res: Response): void {
  const isHttps = process.env.NODE_ENV === "production";
  res.clearCookie(SESSION_COOKIE, {
    path: "/",
    sameSite: isHttps ? "none" : "lax",
    secure: isHttps,
  });
}

/**
 * Express middleware guarding /admin/* API routes. Reads the session cookie or
 * Bearer token (for cross-subdomain/browser storage resilience), verifies it,
 * and attaches the authenticated email to res.locals.adminEmail.
 * Responds 401 when unauthenticated.
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const cookieToken = readCookie(req, SESSION_COOKIE);
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : undefined;
  const token = cookieToken || bearerToken;
  const email = await verifySessionToken(token);
  if (!email) {
    res.status(401).json({ ok: false, error: "Not authorised." });
    return;
  }
  res.locals.adminEmail = email;
  next();
}


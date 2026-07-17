// Password hashing, single-use tokens, and signed session cookies (Node runtime).
import crypto from 'node:crypto';

/* ---------- Password hashing (PBKDF2, no external deps) ---------- */
export function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(pw, salt, 120000, 32, 'sha256').toString('hex');
  return `pbkdf2$120000$${salt}$${hash}`;
}
export function verifyPassword(pw, stored) {
  if (!stored) return false;
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iter = parseInt(parts[1], 10);
  const test = crypto.pbkdf2Sync(pw, parts[2], iter, 32, 'sha256').toString('hex');
  const a = Buffer.from(test, 'hex');
  const b = Buffer.from(parts[3], 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* ---------- Single-use tokens (invite / reset) ---------- */
export function randomToken() { return crypto.randomBytes(32).toString('hex'); }
export function sha256(s) { return crypto.createHash('sha256').update(String(s)).digest('hex'); }

/* ---------- Signed session cookie (HMAC) — matches middleware.js ---------- */
function b64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function createSession(secret, ttlSeconds, extra) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = b64url(Buffer.from(JSON.stringify(Object.assign({ exp }, extra || {}))));
  const sig = b64url(crypto.createHmac('sha256', secret).update(payload).digest());
  return payload + '.' + sig;
}
export function verifySession(token, secret) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const expected = b64url(crypto.createHmac('sha256', secret).update(parts[0]).digest());
  if (parts[1] !== expected) return null;
  try {
    const json = Buffer.from(parts[0].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
    const data = JSON.parse(json);
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch (e) { return null; }
}

/* Reads and validates the admin session from a Node request. */
export function getSession(req, secret) {
  const raw = (req.headers && req.headers.cookie) || '';
  const m = raw.match(/(?:^|; )lume_session=([^;]*)/);
  if (!m) return null;
  return verifySession(decodeURIComponent(m[1]), secret);
}

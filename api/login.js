// Admin login. Uses the admin_users table when a database is connected,
// and always allows the owner's env-var credentials as a fallback (so the
// admin is never locked out before/while the database is being set up).
import { sql } from '../lib/db.js';
import { verifyPassword, createSession } from '../lib/crypto.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.AUTH_SECRET;
  if (!secret) return res.status(503).json({ error: 'Login is not configured yet.' });

  const body = req.body || {};
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  let ok = false, role = 'admin', resolvedEmail = email;

  // 1) Try the database (if one is connected)
  if (process.env.POSTGRES_URL) {
    try {
      const { rows } = await sql`
        SELECT email, password_hash, role FROM admin_users
        WHERE email = ${email} AND status = 'active' LIMIT 1`;
      const user = rows[0];
      if (user && verifyPassword(password, user.password_hash)) {
        ok = true; role = user.role; resolvedEmail = user.email;
      }
    } catch (e) { /* DB not ready — fall through to env fallback */ }
  }

  // 2) Owner fallback via env vars (always available)
  if (!ok) {
    const ownerEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const ownerPass = String(process.env.ADMIN_PASSWORD || '');
    if (ownerEmail && ownerPass && email === ownerEmail && password === ownerPass) {
      ok = true; role = 'owner'; resolvedEmail = ownerEmail;
    }
  }

  if (!ok) return res.status(401).json({ error: 'Incorrect email or password.' });

  const ttl = 60 * 60 * 8; // 8 hours
  const token = createSession(secret, ttl, { email: resolvedEmail, role: role });
  res.setHeader('Set-Cookie',
    `lume_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${ttl}`);
  return res.status(200).json({ ok: true });
}

// Admin login — verifies against the admin_users table and issues a session cookie.
import { sql } from '../lib/db.js';
import { verifyPassword, createSession } from '../lib/crypto.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.AUTH_SECRET;
  if (!secret) return res.status(503).json({ error: 'Login is not configured yet.' });

  const body = req.body || {};
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  try {
    const { rows } = await sql`
      SELECT email, password_hash, role FROM admin_users
      WHERE email = ${email} AND status = 'active' LIMIT 1`;
    const user = rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    const ttl = 60 * 60 * 8; // 8 hours
    const token = createSession(secret, ttl, { email: user.email, role: user.role });
    res.setHeader('Set-Cookie',
      `lume_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${ttl}`);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Login is temporarily unavailable. Please try again.' });
  }
}

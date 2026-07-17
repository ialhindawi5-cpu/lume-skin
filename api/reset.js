// Complete a password reset: validate token and set a new password (public + token).
import { sql, ensureSchema } from '../lib/db.js';
import { hashPassword, sha256 } from '../lib/crypto.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const email = String(body.email || '').trim().toLowerCase();
  const token = String(body.token || '');
  const password = String(body.password || '');

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT id, reset_token_hash, reset_expires FROM admin_users
      WHERE email = ${email} LIMIT 1`;
    const user = rows[0];
    if (!user || !user.reset_token_hash || user.reset_token_hash !== sha256(token)) {
      return res.status(400).json({ error: 'This reset link is invalid.' });
    }
    if (new Date(user.reset_expires).getTime() < Date.now()) {
      return res.status(400).json({ error: 'This reset link has expired. Ask for a new one.' });
    }

    await sql`
      UPDATE admin_users
      SET password_hash = ${hashPassword(password)}, status = 'active',
          reset_token_hash = NULL, reset_expires = NULL
      WHERE id = ${user.id}`;

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

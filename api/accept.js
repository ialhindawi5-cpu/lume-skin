// Accept an invite: validate the token and set the user's password (public + token).
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
      SELECT id, invite_token_hash, invite_expires FROM admin_users
      WHERE email = ${email} LIMIT 1`;
    const user = rows[0];
    if (!user || !user.invite_token_hash || user.invite_token_hash !== sha256(token)) {
      return res.status(400).json({ error: 'This invitation link is invalid.' });
    }
    if (new Date(user.invite_expires).getTime() < Date.now()) {
      return res.status(400).json({ error: 'This invitation link has expired. Ask for a new invite.' });
    }

    await sql`
      UPDATE admin_users
      SET password_hash = ${hashPassword(password)}, status = 'active',
          invite_token_hash = NULL, invite_expires = NULL
      WHERE id = ${user.id}`;

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

// Admin triggers a password reset for a user (admin-only). Emails a reset link.
import { sql, ensureSchema } from '../lib/db.js';
import { randomToken, sha256, getSession } from '../lib/crypto.js';
import { sendMail, resetHtml } from '../lib/mail.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.AUTH_SECRET;
  const session = getSession(req, secret);
  if (!session) return res.status(401).json({ error: 'Not authorized.' });

  const body = req.body || {};
  const email = String(body.email || '').trim().toLowerCase();

  try {
    await ensureSchema();
    const { rows } = await sql`SELECT id FROM admin_users WHERE email = ${email} LIMIT 1`;
    if (!rows[0]) return res.status(404).json({ error: 'No admin with that email.' });

    const token = randomToken();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(); // 2h
    await sql`
      UPDATE admin_users
      SET reset_token_hash = ${sha256(token)}, reset_expires = ${expires}
      WHERE id = ${rows[0].id}`;

    const base = `https://${req.headers.host}`;
    const link = `${base}/admin/reset.html?token=${token}&email=${encodeURIComponent(email)}`;
    await sendMail(email, 'Reset your LUME Skin admin password', resetHtml(link));

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Could not send the reset email.' });
  }
}

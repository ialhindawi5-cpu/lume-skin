// Invite a new admin by email (admin-only). Emails a set-password link.
import { sql, ensureSchema } from '../lib/db.js';
import { randomToken, sha256, getSession } from '../lib/crypto.js';
import { sendMail, inviteHtml } from '../lib/mail.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.AUTH_SECRET;
  const session = getSession(req, secret);
  if (!session) return res.status(401).json({ error: 'Not authorized.' });

  const body = req.body || {};
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim().slice(0, 120);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    await ensureSchema();
    const existing = await sql`SELECT status FROM admin_users WHERE email = ${email} LIMIT 1`;
    if (existing.rows[0] && existing.rows[0].status === 'active') {
      return res.status(409).json({ error: 'That person is already an active admin.' });
    }

    const token = randomToken();
    const tokenHash = sha256(token);
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(); // 48h

    await sql`
      INSERT INTO admin_users (email, name, status, invite_token_hash, invite_expires)
      VALUES (${email}, ${name}, 'invited', ${tokenHash}, ${expires})
      ON CONFLICT (email) DO UPDATE
        SET name = ${name}, status = 'invited',
            invite_token_hash = ${tokenHash}, invite_expires = ${expires}`;

    const base = `https://${req.headers.host}`;
    const link = `${base}/admin/accept.html?token=${token}&email=${encodeURIComponent(email)}`;
    await sendMail(email, 'You are invited to the LUME Skin admin', inviteHtml(link, session.email));

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Could not send the invitation.' });
  }
}

// List admin users, and remove / disable / enable them (admin-only).
import { sql, ensureSchema } from '../lib/db.js';
import { getSession } from '../lib/crypto.js';

export default async function handler(req, res) {
  const secret = process.env.AUTH_SECRET;
  const session = getSession(req, secret);
  if (!session) return res.status(401).json({ error: 'Not authorized.' });

  try {
    await ensureSchema();

    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT email, name, role, status, created_at
        FROM admin_users ORDER BY created_at ASC`;
      return res.status(200).json({ users: rows, me: session.email });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const action = String(body.action || '');
      const email = String(body.email || '').trim().toLowerCase();
      if (!email) return res.status(400).json({ error: 'Missing email.' });

      const { rows } = await sql`SELECT role FROM admin_users WHERE email = ${email} LIMIT 1`;
      if (!rows[0]) return res.status(404).json({ error: 'User not found.' });
      if (rows[0].role === 'owner') return res.status(403).json({ error: 'The owner account cannot be changed here.' });
      if (email === session.email) return res.status(403).json({ error: 'You cannot change your own account here.' });

      if (action === 'remove') {
        await sql`DELETE FROM admin_users WHERE email = ${email}`;
      } else if (action === 'disable') {
        await sql`UPDATE admin_users SET status = 'disabled' WHERE email = ${email}`;
      } else if (action === 'enable') {
        await sql`UPDATE admin_users SET status = 'active' WHERE email = ${email}`;
      } else {
        return res.status(400).json({ error: 'Unknown action.' });
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: 'Could not complete the request.' });
  }
}

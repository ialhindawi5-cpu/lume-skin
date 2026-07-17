// One-time setup: create the table and seed the owner account.
// Protected by a setup key (must equal AUTH_SECRET) passed as x-setup-key header.
import { sql, ensureSchema } from '../lib/db.js';
import { hashPassword } from '../lib/crypto.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.AUTH_SECRET || '';
  const key = req.headers['x-setup-key'] || '';
  if (!secret || key !== secret) return res.status(401).json({ error: 'Not authorized.' });

  const ownerEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const ownerPass = String(process.env.ADMIN_PASSWORD || '');

  try {
    await ensureSchema();

    let seeded = false;
    if (ownerEmail && ownerPass) {
      const existing = await sql`SELECT id FROM admin_users WHERE email = ${ownerEmail} LIMIT 1`;
      if (!existing.rows[0]) {
        await sql`
          INSERT INTO admin_users (email, name, password_hash, role, status)
          VALUES (${ownerEmail}, 'Amani Al Hindawi', ${hashPassword(ownerPass)}, 'owner', 'active')`;
        seeded = true;
      }
    }

    const count = await sql`SELECT COUNT(*)::int AS n FROM admin_users`;
    return res.status(200).json({ ok: true, ownerSeeded: seeded, totalUsers: count.rows[0].n });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Init failed.' });
  }
}

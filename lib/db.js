// Postgres access via Vercel Postgres (Neon). Reads POSTGRES_URL from env.
import { sql } from '@vercel/postgres';

export { sql };

// Creates the admin_users table if it doesn't exist yet.
export async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id                SERIAL PRIMARY KEY,
      email             TEXT UNIQUE NOT NULL,
      name              TEXT,
      password_hash     TEXT,
      role              TEXT NOT NULL DEFAULT 'admin',
      status            TEXT NOT NULL DEFAULT 'invited',
      invite_token_hash TEXT,
      invite_expires    TIMESTAMPTZ,
      reset_token_hash  TEXT,
      reset_expires     TIMESTAMPTZ,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

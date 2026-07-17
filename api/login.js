// Secure admin login — verifies credentials server-side and issues a signed,
// HttpOnly session cookie. Credentials live in Vercel environment variables.
export const config = { runtime: 'edge' };

const enc = new TextEncoder();

function b64url(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlStr(str) { return b64url(enc.encode(str)); }

async function sign(data, secret) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
  return b64url(sig);
}
async function createToken(secret, ttl) {
  const exp = Math.floor(Date.now() / 1000) + ttl;
  const payload = b64urlStr(JSON.stringify({ exp }));
  const sig = await sign(payload, secret);
  return payload + '.' + sig;
}
function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status, headers: { 'content-type': 'application/json' }
  });
}

export default async function handler(req) {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const secret = process.env.AUTH_SECRET;
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD || '';

  if (!secret || !adminEmail || !adminPass) {
    return json({ error: 'Login is not configured yet. Ask the site owner to set the admin credentials.' }, 503);
  }

  let body = {};
  try { body = await req.json(); } catch (e) { /* empty body */ }
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';

  if (email !== adminEmail || password !== adminPass) {
    return json({ error: 'Incorrect email or password.' }, 401);
  }

  const ttl = 60 * 60 * 8; // 8 hours
  const token = await createToken(secret, ttl);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'set-cookie': `lume_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${ttl}`
    }
  });
}

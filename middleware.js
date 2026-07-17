// Edge Middleware — gates the entire /admin area behind a valid session cookie.
// The login page and its stylesheet stay public so the sign-in screen can render.
import { next } from '@vercel/edge';

export const config = { matcher: ['/admin', '/admin/:path*'] };

const enc = new TextEncoder();

function b64url(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function sign(data, secret) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
  return b64url(sig);
}
function b64urlDecode(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return atob(s);
}
async function verify(token, secret) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const expected = await sign(parts[0], secret);
  if (parts[1] !== expected) return false;
  try {
    const data = JSON.parse(b64urlDecode(parts[0]));
    return !!data.exp && data.exp >= Math.floor(Date.now() / 1000);
  } catch (e) { return false; }
}
function getCookie(req, name) {
  const raw = req.headers.get('cookie') || '';
  const m = raw.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

export default async function middleware(req) {
  const { pathname } = new URL(req.url);

  // Public: login, invite-accept, reset pages, and the shared stylesheet.
  if (pathname === '/admin/login.html' ||
      pathname === '/admin/accept.html' ||
      pathname === '/admin/reset.html' ||
      pathname === '/admin/admin.css') {
    return next();
  }

  const secret = process.env.AUTH_SECRET || '';
  const token = getCookie(req, 'lume_session');
  const ok = secret && await verify(token, secret);

  if (!ok) {
    return Response.redirect(new URL('/admin/login.html', req.url), 302);
  }
  return next();
}

// Clears the admin session cookie.
export const config = { runtime: 'edge' };

export default async function handler() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'set-cookie': 'lume_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
    }
  });
}

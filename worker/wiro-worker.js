/* Saga Studio · puente a Wiro (Cloudflare Worker)
   Reenvía las llamadas de la app a api.wiro.ai firmándolas con TU clave, que vive solo aquí como secreto.
   No guarda nada. Solo contesta a Saga Studio (origen permitido + contraseña propia).

   Secretos a crear en el Worker (Settings → Variables and Secrets → tipo «Secret»):
     WIRO_KEY      la API key del proyecto de Wiro
     WIRO_SECRET   el API secret (solo si el proyecto es «Signature-Based»; si es «API Key Only», no lo crees)
     APP_TOKEN     una contraseña larga inventada por ti (la misma que pondrás en Saga Studio)
*/
const ORIGINS = ['https://yancha10.github.io'];
const API = 'https://api.wiro.ai/v1';
const PATH = /^\/(Tool\/(List|Detail)|Task\/(Detail|Cancel|Kill)|Run\/[\w.-]+\/[\w.-]+)$/;
const j = (o, s, h) => new Response(JSON.stringify(o), { status: s, headers: Object.assign({ 'Content-Type': 'application/json' }, h) });
const same = (a, b) => { a = String(a || ''); b = String(b || ''); let d = a.length ^ b.length; for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0); return d === 0; };
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');

async function head(env) {
  const key = String(env.WIRO_KEY || '').trim(); const sec = String(env.WIRO_SECRET || '').trim();
  const h = { 'x-api-key': key };
  if (sec) {
    const nonce = String(Date.now()) + String(Math.floor(Math.random() * 1e6)).padStart(6, '0'); const te = new TextEncoder();
    const k = await crypto.subtle.importKey('raw', te.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    h['x-nonce'] = nonce; h['x-signature'] = hex(await crypto.subtle.sign('HMAC', k, te.encode(sec + nonce)));
  }
  return h;
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || ''; const okOrigin = ORIGINS.includes(origin);
    const cors = { 'Access-Control-Allow-Origin': okOrigin ? origin : 'null', 'Vary': 'Origin', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,X-Saga-Token', 'Access-Control-Max-Age': '86400' };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (!okOrigin) return j({ error: 'origen no permitido' }, 403, cors);
    if (!env.APP_TOKEN || !same(req.headers.get('X-Saga-Token'), String(env.APP_TOKEN).trim())) return j({ error: 'token', detail: 'La contraseña del puente no coincide' }, 401, cors);
    if (!env.WIRO_KEY) return j({ error: 'config', detail: 'Falta WIRO_KEY en el Worker' }, 500, cors);
    const p = new URL(req.url).pathname;
    if (p === '/__ping') {
      const r = await fetch(API + '/Tool/List', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, await head(env)), body: JSON.stringify({ start: '0', limit: '1', summary: true }) });
      const d = await r.json().catch(() => null);
      return j({ ok: r.ok && !!d && d.result !== false, wiro: r.status, detail: d && d.errors && d.errors[0] && d.errors[0].message }, 200, cors);
    }
    if (req.method !== 'POST' || p.includes('..') || !PATH.test(p)) return j({ error: 'ruta no permitida' }, 404, cors);
    const h = await head(env); const ct = req.headers.get('Content-Type'); if (ct) h['Content-Type'] = ct;
    const body = await req.arrayBuffer();
    if (body.byteLength > 90 * 1024 * 1024) return j({ error: 'tamaño' }, 413, cors);
    const r = await fetch(API + p, { method: 'POST', headers: h, body });
    return new Response(await r.text(), { status: r.status, headers: Object.assign({ 'Content-Type': r.headers.get('Content-Type') || 'application/json' }, cors) });
  },
};

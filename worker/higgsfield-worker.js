/* Saga Studio · puente a Higgsfield (Cloudflare Worker)
   Reenvía las llamadas de la app a api.higgsfield.ai poniendo TU clave, que vive solo aquí como secreto del Worker.
   No guarda nada: ni fotos, ni prompts, ni resultados. Solo contesta a Saga Studio (origen permitido + contraseña propia).

   Secretos a crear en el Worker (Settings → Variables and Secrets → tipo «Secret»):
     HF_KEY_ID      la clave de console.higgsfield.ai entera (con los dos puntos), o solo el «Key ID»
     HF_KEY_SECRET  solo si la consola te dio el secreto aparte
     APP_TOKEN      una contraseña larga inventada por ti (la misma que pondrás en Saga Studio)
*/
const ORIGINS = ['https://yancha10.github.io'];
const HF = 'https://api.higgsfield.ai';
const TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'audio/wav', 'audio/x-wav', 'video/mp4'];
// solo rutas de la API de Higgsfield: estado/cancelar, subida y modelos (fabricante/modelo/…)
const PATH = /^\/(requests\/[\w-]{8,64}\/(status|cancel)|files\/generate-upload-url|[\w.-]+(\/[\w.-]+){1,4})$/;

const j = (o, s, h) => new Response(JSON.stringify(o), { status: s, headers: Object.assign({ 'Content-Type': 'application/json' }, h) });
const same = (a, b) => { a = String(a || ''); b = String(b || ''); let d = a.length ^ b.length; for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0); return d === 0; };

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const okOrigin = ORIGINS.includes(origin);
    const cors = { 'Access-Control-Allow-Origin': okOrigin ? origin : 'null', 'Vary': 'Origin', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,X-Saga-Token,Idempotency-Key', 'Access-Control-Max-Age': '86400' };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (!okOrigin) return j({ error: 'origen no permitido' }, 403, cors);
    if (!env.APP_TOKEN || !same(req.headers.get('X-Saga-Token'), String(env.APP_TOKEN).trim())) return j({ error: 'token', detail: 'La contraseña del puente no coincide' }, 401, cors);
    // la clave de Higgsfield puede estar entera en HF_KEY_ID («id:secreto») o repartida en HF_KEY_ID y HF_KEY_SECRET
    const hk = (env.HF_KEY_SECRET ? String(env.HF_KEY_ID || '').trim() + ':' + String(env.HF_KEY_SECRET).trim() : String(env.HF_KEY_ID || '').trim());
    if (hk.indexOf(':') < 1) return j({ error: 'config', detail: 'Falta la clave de Higgsfield (HF_KEY_ID con id:secreto)' }, 500, cors);
    const auth = { Authorization: 'Key ' + hk };
    const url = new URL(req.url); const p = url.pathname;

    // comprobar la clave sin gastar nada: pide el estado de una petición que no existe (404 = clave válida, 401/403 = clave mala)
    if (p === '/__ping') {
      const r = await fetch(HF + '/requests/00000000-0000-0000-0000-000000000000/status', { headers: auth });
      return j({ ok: r.status !== 401 && r.status !== 403 && r.status < 500, hf: r.status }, 200, cors);
    }
    // subir una foto: el Worker pide la URL de subida, sube el archivo y devuelve la URL pública
    if (p === '/__upload' && req.method === 'POST') {
      const ct = (req.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
      if (!TYPES.includes(ct)) return j({ error: 'tipo', detail: 'Tipo de archivo no admitido: ' + ct }, 415, cors);
      const body = await req.arrayBuffer();
      if (!body.byteLength || body.byteLength > 80 * 1024 * 1024) return j({ error: 'tamaño' }, 413, cors);
      const a = await fetch(HF + '/files/generate-upload-url', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, auth), body: JSON.stringify({ content_type: ct }) });
      const d = await a.json().catch(() => null);
      if (!a.ok || !d || !d.upload_url || !d.public_url) return j(d || { error: 'subida' }, a.status || 502, cors);
      const up = await fetch(d.upload_url, { method: 'PUT', headers: d.upload_headers || { 'Content-Type': ct }, body }); // sin clave: es una URL firmada
      if (!up.ok) return j({ error: 'subida', detail: 'Almacenamiento: HTTP ' + up.status }, 502, cors);
      return j({ public_url: d.public_url }, 200, cors);
    }
    // todo lo demás: reenviar tal cual a la API
    if (p.includes('..') || !PATH.test(p) || p.startsWith('/__')) return j({ error: 'ruta no permitida' }, 404, cors);
    const h = Object.assign({}, auth); const idem = req.headers.get('Idempotency-Key'); if (idem) h['Idempotency-Key'] = idem;
    let body; if (req.method === 'POST') { h['Content-Type'] = 'application/json'; body = await req.text(); }
    const r = await fetch(HF + p, { method: req.method, headers: h, body });
    return new Response(await r.text(), { status: r.status, headers: Object.assign({ 'Content-Type': r.headers.get('Content-Type') || 'application/json' }, cors) });
  },
};

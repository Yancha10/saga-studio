// Saga Studio · siempre la última versión si hay conexión; sin conexión (o si la red tarda demasiado), la copia guardada.
const C = 'saga-v32';
const KEEP = ['saga-auth', 'saga-media']; // permiso de Drive de la cuenta activa y fotos ya vistas de tu Drive
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './catalog/families.v1.json', './catalog/pollo.v1.json', './catalog/fal.v1.json', './catalog/higgsfield.v1.json'];
const SLOW = 3500; // ms que se espera a la red antes de abrir con la copia guardada
const MEDIA_MAX = 600; // fotos de Drive que se guardan para verlas al instante
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C && !KEEP.includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; const u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== location.origin) return;
  const dm = u.pathname.match(/\/_drive\/([\w-]{10,200})$/);
  if (dm) return e.respondWith(drive(e, dm[1], u));
  const nav = req.mode === 'navigate';
  const fresh = nav || /\.(html|js|json|webmanifest)$/.test(u.pathname) || u.pathname.endsWith('/');
  e.respondWith(answer(e, req, nav, fresh));
});
/* tus archivos de Drive: se piden con tu permiso y por trozos (Range), así un vídeo empieza a verse sin bajarlo entero */
async function drive(e, id, u) {
  const range = e.request.headers.get('range');
  const mc = await caches.open('saga-media'); const key = u.origin + u.pathname;
  if (!range) { const hit = await mc.match(key); if (hit) return hit; }
  const tr = await (await caches.open('saga-auth')).match(new URL('_drive-token', self.registration.scope).href);
  const t = tr ? await tr.json().catch(() => null) : null;
  if (!t || !t.token || t.exp < Date.now()) return new Response('Reconecta tu Drive', { status: 401 });
  const h = { Authorization: 'Bearer ' + t.token }; if (range) h.Range = range;
  let r; try { r = await fetch('https://www.googleapis.com/drive/v3/files/' + id + '?alt=media', { headers: h }); } catch (x) { return Response.error(); }
  if (!range && r.ok && /^image\//.test(r.headers.get('content-type') || '')) e.waitUntil(mc.put(key, r.clone()).then(() => mc.keys()).then(ks => Promise.all(ks.slice(0, Math.max(0, ks.length - MEDIA_MAX)).map(k => mc.delete(k)))).catch(() => {}));
  return r;
}
async function answer(e, req, nav, fresh) {
  const net = fetch(req, fresh ? { cache: 'no-cache' } : {}).then(r => { if (r.ok && r.type === 'basic') { const cp = r.clone(); e.waitUntil(caches.open(C).then(c => c.put(req, cp)).catch(() => {})); } return r; });
  const saved = () => caches.match(req, nav ? { ignoreSearch: true } : undefined).then(r => r || (nav ? caches.match('./index.html').then(x => x || caches.match('./')) : undefined));
  if (!nav) { try { return await net; } catch (x) { return (await saved()) || Response.error(); } }
  // la página: si la red responde pronto, la versión nueva; si tarda o falla, la guardada (y la nueva queda para la próxima vez)
  let timer; const slow = new Promise(res => { timer = setTimeout(() => res('slow'), SLOW); });
  const first = await Promise.race([net.catch(() => 'down'), slow]); clearTimeout(timer);
  if (first !== 'slow' && first !== 'down') return first;
  const c = await saved();
  if (c) { if (first === 'slow') e.waitUntil(net.catch(() => {})); return c; }
  return first === 'slow' ? net.catch(() => Response.error()) : Response.error();
}

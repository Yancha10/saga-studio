// Saga Studio · siempre la última versión si hay conexión; sin conexión (o si la red tarda demasiado), la copia guardada.
const C = 'saga-v11';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './catalog/families.v1.json', './catalog/pollo.v1.json'];
const SLOW = 3500; // ms que se espera a la red antes de abrir con la copia guardada
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; const u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== location.origin) return;
  const nav = req.mode === 'navigate';
  const fresh = nav || /\.(html|js|json|webmanifest)$/.test(u.pathname) || u.pathname.endsWith('/');
  e.respondWith(answer(e, req, nav, fresh));
});
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

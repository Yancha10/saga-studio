// Saga Studio · siempre la última versión si hay conexión; sin conexión, la copia guardada.
const C = 'saga-v8';
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(['./manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png']))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  const fresh = e.request.mode === 'navigate' || /\.(html|js|json|webmanifest)$/.test(u.pathname) || u.pathname.endsWith('/');
  e.respondWith(fetch(e.request, fresh ? { cache: 'no-cache' } : {}).then(r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html') || caches.match('./'))));
});

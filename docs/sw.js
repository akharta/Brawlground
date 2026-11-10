// Brawlground: primero la red (siempre la última versión) y, sin conexión, lo guardado.
const CACHE = 'brawlground-v2';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // la página se pide siempre al servidor, sin pasar por la caché del navegador (que la guardaba 10 minutos)
  const req = e.request.mode === 'navigate' || /\.html?$|\/$/.test(new URL(e.request.url).pathname) ? new Request(e.request.url, { cache: 'no-cache' }) : e.request;
  e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('./'))));
});

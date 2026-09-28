const CACHE = 'ingresos-carne-v1';
const ARCHIVOS = [
  './index.html',
  './manifest.json',
  './logo.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', evt => {
  self.skipWaiting();
  evt.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ARCHIVOS)).catch(() => {})
  );
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(nombres =>
      Promise.all(nombres.filter(n => n !== CACHE).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Red primero (para tener siempre la última versión); si no hay conexión, usa la copia guardada.
self.addEventListener('fetch', evt => {
  if(evt.request.method !== 'GET') return;

  evt.respondWith(
    fetch(evt.request)
      .then(resp => {
        const copia = resp.clone();
        caches.open(CACHE).then(cache => cache.put(evt.request, copia)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(evt.request).then(r => r || caches.match('./index.html')))
  );
});

const CACHE_NAME = 'healid-static-v1';
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/icons/healid-192.png',
  '/icons/healid-512.png',
  '/icons/healid-1024.png',
  '/icons/healid-opengraph.png',
  '/icons/healid-apple-touch.png',
  '/icons/healid-favicon.ico',
  '/js/main.js',
  '/css/style.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map(k => {
        if (k !== CACHE_NAME) return caches.delete(k);
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // For navigation requests, try network first then cache, fallback to offline page
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // For other requests, respond with cache-first, then network fallback
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((resp) => {
      // Optionally cache the new resource
      if (resp && resp.status === 200 && req.method === 'GET') {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
      }
      return resp;
    }).catch(() => {
      // If it's an image request, return a generic placeholder (if present)
      if (req.destination === 'image') return caches.match('/icons/healid-192.png');
    }))
  );
});

// Message support for clients - including sync trigger
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'SYNC_OFFLINE_DATA') {
    // Client requests sync - handled by client-side sync logic
    event.ports[0].postMessage({ status: 'sync_initiated' });
  }
});

// Periodic background sync for offline data (optional, requires PWA setup)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(
      // Notify clients to sync pending data
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SYNC_OFFLINE_DATA' });
        });
      })
    );
  }
});


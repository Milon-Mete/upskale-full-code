// UPSKALE BiteSize PWA Service Worker (Offline Readiness & Asset Caching)
const CACHE_NAME = 'upskale-bitesize-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/main.jsx',
    '/src/index.css'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Pre-caching static app shell');
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.log('[SW] Static asset pre-cache partial warning:', err);
            });
        })
    );
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch Event - Network First with Cache Fallback for API, Cache First for Static Assets
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET requests or browser extension requests
    if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) return;

    // For API calls: Network first
    if (url.pathname.includes('/api/') || url.pathname.includes('/bitesize-courses/') || url.pathname.includes('/engagement/')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(event.request);
            })
        );
        return;
    }

    // For static assets: Cache first with network update
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                fetch(event.request).then((networkResponse) => {
                    if (networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
                    }
                }).catch(() => {/* Offline fallback */});
                return cachedResponse;
            }
            return fetch(event.request).then((response) => {
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                }
                return response;
            });
        })
    );
});

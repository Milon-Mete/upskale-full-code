// UPSKALE BiteSize PWA Service Worker (Offline Readiness & Asset Caching)
const CACHE_NAME = 'upskale-bitesize-v2';
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

// Fetch Event
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

    // For the HTML shell (navigations + index.html itself): Network first.
    // This is a content-hashed Vite build, so the JS/CSS filenames referenced
    // inside index.html change every deploy. If index.html is served stale
    // from cache, the page can keep running an old bundle indefinitely even
    // after a new version is live. Always try the network first here, and
    // only fall back to the cached shell when fully offline.
    const isHtmlShell = event.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('/index.html');
    if (isHtmlShell) {
        event.respondWith(
            fetch(event.request).then((networkResponse) => {
                if (networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                }
                return networkResponse;
            }).catch(() => caches.match(event.request))
        );
        return;
    }

    // For hashed static assets (js/css with a content hash in the filename):
    // Cache first is safe here because the filename itself changes whenever
    // the content changes, so a "stale" cache entry can never mask an update.
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

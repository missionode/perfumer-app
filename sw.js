// Service Worker for Perfumer's Organ PWA
const CACHE_NAME = 'perfumer-organ-v1.0.0';
const RUNTIME_CACHE = 'perfumer-runtime-v1';

// Assets to cache on install
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/css/variables.css',
    '/css/layout.css',
    '/css/components.css',
    '/css/wheel.css',
    '/css/toast.css',
    '/js/toast.js',
    '/js/db.js',
    '/js/wheel.js',
    '/js/organ.js',
    '/js/composer.js',
    '/js/lucky.js',
    '/js/theme.js',
    '/js/export.js',
    '/js/settings.js',
    '/js/tutorial.js',
    '/js/app.js',
    '/data/default-wheel.json',
    '/data/sample-ingredients.json',
    '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Install');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Precaching static assets');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activate');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('[ServiceWorker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Handle API requests differently (network-first)
    if (event.request.url.includes('/api/')) {
        event.respondWith(networkFirst(event.request));
        return;
    }

    // For navigation requests, use network-first strategy
    if (event.request.mode === 'navigate') {
        event.respondWith(networkFirst(event.request));
        return;
    }

    // For all other requests, use cache-first strategy
    event.respondWith(cacheFirst(event.request));
});

// Cache-first strategy
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
        console.log('[ServiceWorker] Serving from cache:', request.url);
        return cached;
    }

    try {
        const response = await fetch(request);

        // Cache successful responses
        if (response.status === 200) {
            const runtimeCache = await caches.open(RUNTIME_CACHE);
            runtimeCache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.error('[ServiceWorker] Fetch failed:', error);

        // Return offline page if available
        const offlinePage = await cache.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }

        // Return a basic offline response
        return new Response('Offline - Please check your connection', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain'
            })
        });
    }
}

// Network-first strategy
async function networkFirst(request) {
    const cache = await caches.open(RUNTIME_CACHE);

    try {
        const response = await fetch(request);

        // Cache successful responses
        if (response.status === 200) {
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.log('[ServiceWorker] Network failed, trying cache:', request.url);

        const cached = await cache.match(request);
        if (cached) {
            return cached;
        }

        // Check static cache as fallback
        const staticCache = await caches.open(CACHE_NAME);
        const staticCached = await staticCache.match(request);
        if (staticCached) {
            return staticCached;
        }

        throw error;
    }
}

// Handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }

    if (event.data.action === 'clearCache') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            }).then(() => {
                event.ports[0].postMessage({ success: true });
            })
        );
    }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
    console.log('[ServiceWorker] Background sync:', event.tag);

    if (event.tag === 'sync-compositions') {
        event.waitUntil(syncCompositions());
    }
});

async function syncCompositions() {
    // This would sync offline changes when connection is restored
    console.log('[ServiceWorker] Syncing compositions...');
    // Implementation would depend on backend API
}

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();

        const options = {
            body: data.body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            vibrate: [200, 100, 200],
            data: data.data,
            actions: data.actions
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});

console.log('[ServiceWorker] Loaded successfully');

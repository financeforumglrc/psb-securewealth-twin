/**
 * Service Worker for DS Financial Solutions
 * Enables offline functionality and caching
 */

const CACHE_NAME = 'ds-financial-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/design-system.css',
    '/futuristic-fintech.css',
    '/script.js',
    '/tax-portal.html',
    '/gst-tools.html',
    '/gst-black-mirror.html',
    '/investment-tools.html',
    '/pdf-tools.html',
    '/resume-builder.html',
    '/invoice-generator.html',
    '/smart-tax-optimizer.html',
    '/blog.html',
    '/privacy.html',
    '/404.html',
    '/admin.html',
    '/design-system-showcase.html',
    '/manifest.json',
    '/sw.js',
    '/ai-engine.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@500;600;700;800;900&display=swap'
];

// Install - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching app assets');
            return cache.addAll(ASSETS_TO_CACHE).catch(err => {
                console.warn('Some assets failed to cache:', err);
            });
        })
    );
    self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip chrome-extension and other non-http requests
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then((networkResponse) => {
                // Cache successful responses
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Return offline page if available
                if (event.request.destination === 'document') {
                    return caches.match('/404.html') || caches.match('/index.html');
                }
            });
        })
    );
});

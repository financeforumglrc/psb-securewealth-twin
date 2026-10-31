/**
 * DS Financial — Service Worker
 * Advanced PWA with offline support, caching strategies, and background sync
 */
const CACHE_VERSION = 'v3-tools-20261030';
const STATIC_CACHE = `ds-financial-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `ds-financial-dynamic-${CACHE_VERSION}`;
const API_CACHE = `ds-financial-api-${CACHE_VERSION}`;
const FONT_CACHE = `ds-financial-fonts-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index-new.html',
  '/styles.css',
  '/modern-layout.css',
  '/fixed-layout.css',
  '/futuristic-fintech.css',
  '/design-system.css',
  '/new_styles.css',
  '/script.js',
  '/js/config.js',
  '/js/api-client.js',
  '/global-features.js',
  '/global-features.css',
  '/enhanced-features.js',
  '/enhanced-features.css',
  '/offline.html',
  '/manifest.json'
];

const API_CACHE_PATHS = ['/api/v1/health', '/api/v1/patents'];

const FONT_URLS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome'
];

// Install event: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Some static assets failed to cache, proceeding anyway:', err);
      });
    }).catch((err) => {
      console.error('Failed to open static cache:', err);
    })
  );
  event.waitUntil(self.skipWaiting());
});

// Activate event: clean old caches
self.addEventListener('activate', (event) => {
  const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE, FONT_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('ds-financial-') && !validCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Helper: check if request is a navigation
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Helper: check if request is an API call
function isApiRequest(url) {
  return url.pathname.startsWith('/api/v1/');
}

// Helper: check if request is for fonts
function isFontRequest(url) {
  return FONT_URLS.some((fontUrl) => url.origin.startsWith(fontUrl));
}

// Helper: check if request is static asset
function isStaticAsset(url) {
  const extensions = ['.js', '.css', '.html', '.json', '.png', '.jpg', '.svg', '.ico', '.webp'];
  return extensions.some((ext) => url.pathname.endsWith(ext));
}

// Network-first strategy for API calls
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return offline fallback for navigations
    if (isNavigationRequest(request)) {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// Cache-first strategy for static assets
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    if (isNavigationRequest(request)) {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// Stale-while-revalidate for frequently accessed content
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Fetch event: apply caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return;

  // API calls: network first
  if (isApiRequest(url)) {
    // Never persist authenticated financial responses in a shared cache.
    if (API_CACHE_PATHS.includes(url.pathname) && !request.headers.has('Authorization')) event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Fonts: cache first (long-lived)
  if (isFontRequest(url)) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  // Refresh executable code and pages; stale cache-first scripts kept broken
  // tools running even after a deployment had fixed them.
  if (isStaticAsset(url)) {
    event.respondWith(networkFirst(request, STATIC_CACHE));
    return;
  }

  // Navigations: network first with offline fallback
  if (isNavigationRequest(request)) {
    event.respondWith(
      networkFirst(request, DYNAMIC_CACHE).catch(() => {
        return caches.match('/offline.html');
      })
    );
    return;
  }

  // Everything else: stale while revalidate
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
  if (event.tag === 'sync-models') {
    event.waitUntil(syncModels());
  }
});

async function syncTransactions() {
  if (typeof openDB === 'undefined') {
    console.warn('openDB (idb) not available, skipping transaction sync');
    return;
  }
  try {
    const db = await openDB('ds-financial-offline', 1);
    const pending = await db.getAll('pending-transactions');
    for (const transaction of pending) {
      try {
        await fetch('/api/v1/banking/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction)
        });
        await db.delete('pending-transactions', transaction.id);
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    }
  } catch (err) {
    console.error('Failed to open IndexedDB for sync:', err);
  }
}

async function syncModels() {
  if (typeof openDB === 'undefined') {
    console.warn('openDB (idb) not available, skipping model sync');
    return;
  }
  try {
    const db = await openDB('ds-financial-offline', 1);
    const pending = await db.getAll('pending-models');
    for (const model of pending) {
      try {
        await fetch('/api/v1/financial-model', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(model)
        });
        await db.delete('pending-models', model.id);
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    }
  } catch (err) {
    console.error('Failed to open IndexedDB for sync:', err);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const options = {
    title: data.title || 'DS Financial',
    body: data.body || 'New update available',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };
  event.waitUntil(self.registration.showNotification(options.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.openWindow(url)
  );
});

// Message handling
self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') {
    self.skipWaiting();
  }
});

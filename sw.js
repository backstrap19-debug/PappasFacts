// Define a cache name and the files to cache
const CACHE_NAME = 'pappas-facts-cache-v3';
const FILES_TO_CACHE = [
    './', // This caches the index.html file at the root
    './index.html', // Explicitly cache index.html
    './manifest.json' // Cache the manifest file
];

// --- INSTALL Event ---
// This runs when the service worker is first installed.
self.addEventListener('install', (e) => {
    // console.log('[ServiceWorker] Install');
    
    // Wait until the cache is opened and all files are added.
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // console.log('[ServiceWorker] Pre-caching offline page');
            // addAll() fetches and caches all the files in the array.
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    
    // Force the waiting service worker to become the active service worker.
    self.skipWaiting();
});

// --- ACTIVATE Event ---
// This runs when the service worker is activated (after installation).
self.addEventListener('activate', (e) => {
    // console.log('[ServiceWorker] Activate');
    
    // This removes old, unused caches to save space.
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                // If the cache key isn't our current cache, delete it.
                if (key !== CACHE_NAME) {
                    // console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    
    // Take control of all open clients (browser tabs) immediately.
    self.clients.claim();
});

// --- FETCH Event ---
// This runs every time the app makes a network request (e.g., for a file or image).
self.addEventListener('fetch', (e) => {
    // console.log('[ServiceWorker] Fetch', e.request.url);
    
    // We'll use a "cache-first" strategy.
    e.respondWith(
        // 1. Try to find the request in the cache.
        caches.match(e.request).then((response) => {
            // 2. If it's in the cache, return it.
            //    If not, (response is null), then try to fetch it from the network.
            return response || fetch(e.request);
        })
    );
});

const CACHE_NAME = 'noor-al-huda-v1.0.0';

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './quran.html',
    './hadith.html',
    './learn.html',
    './qa.html',
    './videos.html',
    './media.html',
    './css/style.css',
    './js/main.js',
    './js/quran.js',
    './js/data-loader.js',
    './data/quran_meta.js',
    './data/hadith.json',
    './data/learn.json',
    './data/qa.json',
    './data/videos.json',
    './data/media.json',
    './images/favicon.svg'
];

// Install Event - Cache Static Assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching App Shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate Event - Clean Up Old Caches (App Versioning)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event - Serve from Cache, Fallback to Network
self.addEventListener('fetch', event => {
    // Skip external API and Audio requests to ensure they always fetch fresh or use browser's own media cache
    if (event.request.url.includes('api.alquran.cloud') || 
        event.request.url.includes('everyayah.com') || 
        event.request.url.includes('translate.google.com')) {
        
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    // Standard Cache-First Strategy for internal assets
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // If not in cache, fetch from network
                return fetch(event.request).then(
                    function(response) {
                        // Check if we received a valid response
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response because it's a stream and can only be consumed once
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});
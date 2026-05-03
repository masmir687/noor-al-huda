const CACHE_VERSION = 'v1.4.0';
const CACHE_NAME = `noor-al-huda-${CACHE_VERSION}`;

// Assets to pre-cache immediately
const CORE_ASSETS = [
    './',
    './index.html',
    './quran/1/index.html',
    './hadith.html',
    './bookmarks.html',
    './learn.html',
    './qa.html',
    './videos.html',
    './media.html',
    './css/style.css',
    './js/main.js',
    './js/quran.js',
    './js/hadith-reader.js',
    './js/data-loader.js',
    './js/bookmarks.js',
    './js/bookmarks-page.js',
    './js/i18n.js',
    './images/favicon.svg',
    './images/icon-192.png',
    './images/icon-512.png',
    './manifest.json'
];
// Install Event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.allSettled(
                CORE_ASSETS.map(url => {
                    return fetch(url).then(response => {
                        if (response.ok) return cache.put(url, response);
                    }).catch(() => {});
                })
            );
        }).then(() => self.skipWaiting())
    );
});

// Activate Event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        )).then(() => self.clients.claim())
    );
});

// Fetch Event
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Bypass for external media
    if (url.hostname.includes('everyayah.com') || 
        url.hostname.includes('translate.google.com') ||
        event.request.destination === 'audio') {
        return; 
    }

    // 1. Network-First for HTML, CSS, and JS (Ensure UI is always fresh)
    if (event.request.mode === 'navigate' || 
        event.request.destination === 'style' || 
        event.request.destination === 'script') {
        
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        const clonedResponse = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonedResponse));
                    }
                    return networkResponse;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // 2. Cache-First for Images and JSON data
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;

            return fetch(event.request).then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                    const clonedResponse = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonedResponse));
                }
                return networkResponse;
            });
        })
    );
});

// Update Listener
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
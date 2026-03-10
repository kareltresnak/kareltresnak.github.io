const CACHE_NAME = 'SPS_Selekce_MAT_CETBY_v4.3.6'; 
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './style-spspb.css',
    './app.js',
    './spspb-logo-2000px.png',
    './manifest.json',
    // Musíme nacachovat externí knihovnu pro QR kódy, abychom neztratili offline-first status
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

// Fáze 1: Instalace a nabití Cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Přednačítání offline dat');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Fáze 2: Aktivace a úklid starých verzí
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Mazání staré cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fáze 3: Intercepce sítě (Stale-while-revalidate strategie)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request);
            })
    );
});

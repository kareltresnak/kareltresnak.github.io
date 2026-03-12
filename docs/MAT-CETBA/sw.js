const CACHE_NAME = 'SPS_Selekce_MAT_CETBY_v5.1.8'; 
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './style-spspb.css',
    './style-gympb.css',
    './data-spspb.js',
    './data-gympb.js',
    './app.js',
    './spspb-logo-2000px.png',
    './gympb-logo.png',
    './manifest.json',
    './manifest-gympb.json',
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
        // MAGIE ZDE: ignoreSearch zajistí, že /?theme=gympb i /?theme=spspb načtou offline index.html
        caches.match(event.request, { ignoreSearch: true }) 
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request);
            })
    );
});

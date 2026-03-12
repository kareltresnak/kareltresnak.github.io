const CACHE_NAME = 'SPS_Selekce_MAT_CETBY_v6.0.0';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './style-spspb.css',
    './data-spspb.js',
    './app.js',
    './spspb-logo-2000px.png',
    './manifest.json',
    // Nativní offline generátor QR kódů
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

// Fáze 1: Instalace a nabití Cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Přednačítání offline dat (Monolit)');
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
        // ignoreSearch zajistí, že i odkaz s ?theme=spspb nebo ?p=... vždy načte offline index.html
        caches.match(event.request, { ignoreSearch: true }) 
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request);
            })
    );
});

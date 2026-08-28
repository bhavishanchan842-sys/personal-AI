// Aegis PWA Service Worker
const CACHE_NAME = 'aegis-v1';
const ASSETS = [
    '/',
    '/static/css/style.css',
    '/static/js/app.js',
    '/static/manifest.json',
    '/static/images/cartoon_avatar.jpg',
    '/static/images/cartoon_bg.jpg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS).catch((err) => console.log('PWA cache prefetch note:', err));
        })
    );
    self.skipWaiting();
});

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

self.addEventListener('fetch', (event) => {
    // API calls always go to network
    if (event.request.url.includes('/api/')) {
        return;
    }
    
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});

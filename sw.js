const CACHE = 'mubina-portfolio-v1';
const ASSETS = ['/', '/css/styles.css', '/js/main.js', '/assets/cv.pdf'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
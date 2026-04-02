// Bumped to v5 to force the browser to cache the new files
const CACHE_NAME = 'swing4fun-v5';

// List of all files to save on the phone for offline mode
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/image_0.png',
  '/loup-fr.html',
  '/loup-en.html',
  '/loup-es.html',
  '/match-fr.html',
  '/match-en.html',
  '/match-es.html'
  // Add other images or CSS/JS files here if needed
];

// 1. INSTALLATION: Cache all files in the list
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching files for offline mode');
        return cache.addAll(urlsToCache);
      })
  );
  // Force the new Service Worker to activate immediately
  self.skipWaiting();
});

// 2. ACTIVATION: Clean up the old cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If the cache name doesn't match our current version (v5), delete it
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Tell the Service Worker to take control of the page immediately
  self.clients.claim();
});

// 3. FETCH INTERCEPTION: Offline Mode
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If the file is in the cache, return it directly (offline support)
        if (response) {
          return response;
        }
        
        // Otherwise, fetch it from the network
        return fetch(event.request).then(
          function(response) {
            // If the request fails or isn't valid, do nothing
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Optional: Dynamically add newly visited files to the cache
            var responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
            console.log('You are offline and the file is not in the cache.');
        });
      })
  );
});

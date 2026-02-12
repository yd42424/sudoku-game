const CACHE_NAME = 'sudoku-v2';
const urlsToCache = [
  '/sudoku.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// 설치 이벤트
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// 활성화 이벤트
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) return response;

        return fetch(event.request).then(function(response) {
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          var responseToCache = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch(function() {
        return caches.match('/sudoku.html');
      })
  );
});

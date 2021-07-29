var CACHE_NAME = 'martinbean-cache-v4';
var urlsToCache = [
  '/',
  '/about/',
  '/blog/2013/11/22/getting-to-grips-with-cakephps-events-system/',
  '/blog/2014/07/04/re-using-controllers-for-admin-and-non-admin-routes-in-laravel/',
  '/blog/2018/11/06/authentication-and-authorisation-tips-for-laravel-applications/',
  '/blog/2019/03/21/command-bus-in-laravel/',
  '/blog/2019/11/07/using-value-objects-in-projects/',
  '/blog/2020/05/28/introducing-amp-server-side-rendering-netlify-plugin/',
  '/blog/2021/07/29/simple-role-based-authentication-laravel/',
  '/contact/',
  '/css/app.css',
  '/favicon.ico',
  '/fonts/maison-neue-extended/book.woff2',
  '/fonts/maison-neue-extended/demi.woff2',
  '/fonts/maison-neue-mono/regular.woff2',
  '/fonts/maison-neue/bold.woff2',
  '/fonts/maison-neue/book-italic.woff2',
  '/fonts/maison-neue/book.woff2',
  '/fonts/maison-neue/demi.woff2',
  '/img/martin-bean@1x.jpg',
  '/img/martin-bean@2x.jpg',
  '/js/app.js',
  '/offline/'
];

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        return response;
      }

      return fetch(event.request).then(function (response) {
        if (response && response.status === 200 && response.type === 'basic') {
          var responseToCache = response.clone();

          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      });
    }).catch(function () {
      return caches.match('/offline/');
    })
  );
});

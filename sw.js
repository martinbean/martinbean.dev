importScripts('/js/serviceworker-cache-polyfill.js');

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open('martinbean').then(function (cache) {
      return cache.addAll([
        '/',
        '/about/',
        '/blog/2013/11/22/getting-to-grips-with-cakephps-events-system/',
        '/blog/2014/07/04/re-using-controllers-for-admin-and-non-admin-routes-in-laravel/',
        '/blog/2018/11/06/authentication-and-authorisation-tips-for-laravel-applications/',
        '/blog/2019/03/21/command-bus-in-laravel/',
        '/blog/2019/11/07/using-value-objects-in-projects/',
        '/contact/',
        '/favicon.ico',
        '/fonts/maison-neue-extended/book.woff2',
        '/fonts/maison-neue-extended/demi.woff2',
        '/fonts/maison-neue/bold.woff2',
        '/fonts/maison-neue/book.woff2',
        '/fonts/maison-neue/book-italic.woff2',
        '/fonts/maison-neue/demi.woff2',
        '/fonts/maison-neue-mono/regular.woff2',
        '/img/martin-bean@1x.jpg',
        '/img/martin-bean@2x.jpg',
        '/offline/',
      ]);
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    }).catch(function () {
      return caches.match('/offline/');
    })
  );
});

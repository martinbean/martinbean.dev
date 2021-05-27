(function () {
  var hireMeButton = document.getElementById('hire-me-button');
  if (hireMeButton) {
    hireMeButton.addEventListener('click', function () {
      gtag('event', 'generate_lead');
    });
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').then(function (registration) {
        console.log('ServiceWorker registration was successful', registration.scope);
      }, function (error) {
        console.error('ServiceWorker registration failed', error);
      });
    });
  }
})();

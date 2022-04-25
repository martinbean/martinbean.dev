(function () {
  var hireMeButton = document.getElementById('hire-me-button');
  if (hireMeButton) {
    hireMeButton.addEventListener('click', function () {
      gtag('event', 'generate_lead');
    });
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(function (registration) {
      console.log('Service worker registered.', registration);
    }).catch(function (error) {
      console.error('Service worker registration failed.', error);
    });
  }
})();

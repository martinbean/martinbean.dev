(function () {
  (function () {
    var hireMeButton = document.getElementById('hire-me-button');

    if (hireMeButton) {
      hireMeButton.addEventListener('click', function () {
        gtag('event', 'generate_lead');
      });
    }
  })();

  (function () {
    var courseLink = document.getElementById('course-link');

    courseLink.addEventListener('click', function () {
      gtag('event', 'select_promotion', {
        creative_slot: 'header',
        promotion_name: 'Video Streaming with Laravel course'
      });
    });
  })();
})();

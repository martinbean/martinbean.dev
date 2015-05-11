(function ($) {
  // Open external links in a new window
  $('a[rel="external"]').on('click', function (e) {
    e.preventDefault();
    window.open(this.href);
  });

  // Google Analytics event tracking
  $('[data-track="event"]').on('click', function (e) {
    if (_gaq) {
      var category = $(this).data('category');
      var label = $(this).data('label');
      _gaq.push(['_trackEvent', category, 'Click', label]);
    }
  });
})(jQuery);

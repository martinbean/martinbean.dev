(function ($) {
  // Open external links in a new window
  $('a[rel="external"]').on('click', function (e) {
    e.preventDefault();
    window.open(this.href);
  });
})(jQuery);

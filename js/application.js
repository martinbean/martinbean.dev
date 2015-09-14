(function ($) {
  // Enable tooltips
  // $('[data-toggle="tooltip"]').tooltip();
  $('.list-clients').find('li').tooltip();

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

  // Pretty-print code
  $('pre').addClass('prettyprint');
  $.getScript('http://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js');
})(jQuery);

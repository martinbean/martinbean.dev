var gulp = require('gulp');
var notify = require('gulp-notify');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('sass', function () {
  gulp.src('./_sass/**/*.scss')
      .pipe(sourcemaps.init())
      .pipe(sass({
        outputStyle: 'compressed'
      }).on('error', sass.logError))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./css'))
      .pipe(notify('Sass compiled.'));
});

gulp.task('default', function () {
  gulp.watch('./_sass/**/*.scss', ['sass']);
});

const gulp = require('gulp');
const notify = require('gulp-notify');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const config = {
  sass: {
    outputStyle: 'compressed'
  }
};

gulp.task('sass', () => {
  return gulp
      .src('./_sass/**/*.scss')
      .pipe(sourcemaps.init())
      .pipe(sass(config.sass).on('error', sass.logError))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./css'))
      .pipe(notify('Sass compiled.'));
});

gulp.task('build', gulp.series('sass'));

gulp.task('watch', () => {
  return gulp.watch('./_sass/**/*.scss', gulp.series('sass'));
});

gulp.task('default', gulp.series('build', 'watch'));

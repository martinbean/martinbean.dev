var gulp = require('gulp'),
    sass = require('gulp-sass');

gulp.task('sass', function () {
  gulp.src('_sass/**/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest('css'));
});

gulp.task('default', function () {
  gulp.watch('_sass/**/*.scss', ['sass']);
});

'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));

function build() {
  return gulp
    .src('_sass/app.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('css'));
}

exports.build = build;

exports.default = function () {
  return gulp.watch('sass/**/*.scss', ['build']);
};

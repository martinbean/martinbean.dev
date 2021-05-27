const { dest, src, watch } = require('gulp');
const sass = require('gulp-sass');

function build() {
  return src('_sass/app.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(dest('css/'));
}

exports.build = build;
exports.default = function () {
  watch('_sass/**/*.scss', build);
};

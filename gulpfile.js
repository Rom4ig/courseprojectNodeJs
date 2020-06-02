/* eslint-disable node/no-unpublished-require */
const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const plumber = require('gulp-plumber');
const concat = require('gulp-concat');
const uglify = require('gulp-uglifyjs');
/* eslint-enable node/no-unpublished-require */

gulp.task('scss', () => {
  return gulp
    .src('dev/scss/**/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(
      autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
        cascade: true
      })
    )
    .pipe(cssnano())
    .pipe(gulp.dest('public/stylesheets'));
});

gulp.task('scripts', () =>
  gulp
    .src([
      'dev/js/*.js',
      //
    ])
    .pipe(concat('scripts.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public/javascripts'))
);

gulp.task('watch', () => {
  gulp.watch('dev/scss/**/*.scss', gulp.series('scss'));
  gulp.watch('dev/js/**/*.js', gulp.series('scripts'));
});

gulp.task('default', gulp.parallel('scss', 'scripts', 'watch'), () => {

});

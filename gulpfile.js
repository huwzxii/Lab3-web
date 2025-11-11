const { src, dest, series, parallel, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();

// Шляхи
const paths = {
  html: { src: 'app/*.html', dest: 'dist/' },
  scss: { src: 'app/*.scss', dest: 'dist/css/' },
  js: { src: 'app/*.js', dest: 'dist/js/' },
  img: { src: 'app/img/*', dest: 'dist/img/' }
};

// HTML
const htmlTask = () => src(paths.html.src).pipe(dest(paths.html.dest)).pipe(browserSync.stream());
  
// SCSS
const scssTask = () =>
  src(paths.scss.src)
    .pipe(sass())
    .pipe(cssnano())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(paths.scss.dest))
    .pipe(browserSync.stream());

// JS
const jsTask = () =>
  src(paths.js.src)
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest(paths.js.dest))
    .pipe(browserSync.stream());

// Images
const imgTask = () => src(paths.img.src).pipe(imagemin()).pipe(dest(paths.img.dest));

// BrowserSync
const serve = () => {
  browserSync.init({ server: { baseDir: 'dist/' } });
  watch(paths.html.src, htmlTask);
  watch(paths.scss.src, scssTask);
  watch(paths.js.src, jsTask);
  watch(paths.img.src, imgTask);
};

exports.build = series(parallel(htmlTask, scssTask, jsTask, imgTask));
exports.default = series(exports.build, serve);

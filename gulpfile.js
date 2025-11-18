const { src, dest, series, parallel, watch } = require("gulp");
const sass = require("gulp-dart-sass");
const cleanCSS = require("gulp-clean-css");
const uglify = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");
const del = require("del");
const rename = require("gulp-rename");
const browserSync = require("browser-sync").create();

const paths = {
  html: "app/*.html",
  styles: "app/scss/main.scss",  // головний SCSS
  scripts: "app/script.js",      // якщо нема script.js — можеш потім прибрати
  images: "app/img/**/*.*",
  dist: "dist",
};

// 1) Очистка dist
function clean() {
  return del.deleteAsync([paths.dist]);
}

// 2) Копіюємо HTML у dist
function html() {
  return src(paths.html).pipe(dest(paths.dist));
}

// 3) SCSS -> dist/css/index.min.css
function styles() {
  return src(paths.styles)
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(cleanCSS())
    .pipe(rename("index.min.css"))
    .pipe(sourcemaps.write("."))
    .pipe(dest(paths.dist + "/css"))
    .pipe(browserSync.stream());
}

// 4) JS
function scripts() {
  return src(paths.scripts)
    .pipe(uglify())
    .pipe(dest(paths.dist + "/js"));
}

// 5) Картинки
function images() {
  return src(paths.images).pipe(dest(paths.dist + "/img"));
}

// 6) Dev-сервер + вотчери
function serve() {
  browserSync.init({
    server: {
      baseDir: paths.dist,
    },
    open: false, // можеш змінити на true, якщо хочеш авто-відкриття браузера
  });

  watch("app/scss/**/*.scss", styles);
  watch(paths.html, series(html)).on("change", browserSync.reload);
  watch(paths.scripts, series(scripts)).on("change", browserSync.reload);
}

// 7) Build
const build = series(clean, parallel(html, styles, scripts, images));

exports.clean = clean;
exports.build = build;
exports.serve = series(build, serve);

// Коли просто пишеш "gulp" або "npm run dev" → build + serve
exports.default = exports.serve;

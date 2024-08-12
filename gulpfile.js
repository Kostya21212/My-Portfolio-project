const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const sass = require("gulp-sass")(require("sass"));
const cleanCSS = require("gulp-clean-css");
const rename = require("gulp-rename");
const { minify } = require("html-minifier-terser");

gulp.task("server", function () {
  browserSync.init({
    server: {
      baseDir: "dist",
    },
  });

  gulp.watch("src/*.html").on("change", browserSync.reload);
});

gulp.task("styles", function () {
  return gulp
    .src("src/sass/**/*.+(scss|sass)")
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(rename({ suffix: ".min", prefix: "" }))
    .pipe(cleanCSS({ compatibility: "ie8" }))
    .pipe(gulp.dest("dist/css"))
    .pipe(browserSync.stream());
});

gulp.task("watch", function () {
  gulp.watch("src/sass/**/*.+(scss|sass|css)", gulp.parallel("styles"));
  gulp.watch("src/*.html").on("change", gulp.parallel("html"));
  gulp.watch("src/js/**/*.js").on("change", gulp.parallel("scripts"));
  gulp.watch("src/fonts/**/*").on("all", gulp.parallel("fonts"));
  gulp.watch("src/icons/**/*").on("all", gulp.parallel("icons"));
  gulp.watch("src/img/**/*").on("all", gulp.parallel("images"));
});

gulp.task("html", function () {
  return gulp
    .src("src/*.html")
    .pipe(gulp.dest("dist/"))
    .on("end", async function () {
      const fs = require("fs");
      const files = fs.readdirSync("dist/").filter(file => file.endsWith(".html"));
      for (const file of files) {
        const filePath = `dist/${file}`;
        const content = fs.readFileSync(filePath, "utf8");
        const minifiedContent = await minify(content, {
          collapseWhitespace: true,
        });
        fs.writeFileSync(filePath, minifiedContent);
      }
    });
});

gulp.task("scripts", function () {
  return gulp
    .src("src/js/**/*.js")
    .pipe(gulp.dest("dist/js"))
    .pipe(browserSync.stream());
});

gulp.task("fonts", function () {
  return gulp
    .src("src/fonts/**/*")
    .pipe(gulp.dest("dist/fonts"))
    .pipe(browserSync.stream());
});

gulp.task("icons", function () {
  return gulp
    .src("src/images/icons/*")
    .pipe(gulp.dest("dist/icons"))
    .pipe(browserSync.stream());
});

gulp.task("images", function () {
  return gulp
    .src("src/images/**/*")
    .pipe(gulp.dest("dist/img"))
    .pipe(browserSync.stream());
});

gulp.task(
  "default",
  gulp.parallel(
    "watch",
    "server",
    "styles",
    "scripts",
    "fonts",
    "icons",
    "html",
    "images"
  )
);

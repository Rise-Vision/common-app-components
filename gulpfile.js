(function () {
  "use strict";

  var es = require('event-stream');
  var fs = require("fs");
  var html2js = require("gulp-html2js");
  var merge = require('merge-stream');
  var gulp = require('gulp');
  var connect = require('gulp-connect');
  var watch = require('gulp-watch');
  var gutil = require("gulp-util");
  var rename = require('gulp-rename');
  //var clean = require('gulp-clean');
  var prettify = require('gulp-jsbeautifier');
  var jshint = require('gulp-jshint');
  var runSequence = require('run-sequence');
  var factory = require("widget-tester").gulpTaskFactory;
  var path = require("path");
  //var rimraf = require("gulp-rimraf");
  var uglify = require("gulp-uglify");
  //var usemin = require("gulp-usemin");
  var minifyCSS = require("gulp-minify-css");
  var concat = require("gulp-concat");
  var e2ePort = process.env.E2E_PORT || 8099;

  var scriptsPath = "./src/";

  function getFolders(dir){
    return fs.readdirSync(dir)
      .filter(function(file){
        return fs.statSync(path.join(dir, file)).isDirectory();
      })
  }

  var folders = fs.readdirSync(scriptsPath)
    .filter(function(file) {
      return fs.statSync(path.join(scriptsPath, file)).isDirectory();
    });

  /*---- tooling ---*/
  gulp.task('pretty', function() {
    return gulp.src('./js/**/*.js')
      .pipe(prettify({config: '.jsbeautifyrc', mode: 'VERIFY_AND_WRITE'}))
      .pipe(gulp.dest('./js'))
      .on('error', function (error) {
        console.error(String(error));
      });
  });
  gulp.task("config", function() {
    var env = process.env.NODE_ENV || "dev";
    gutil.log("Environment is", env);

    return gulp.src(["config/" + env + ".js"])
      .pipe(rename("config.js"))
      .pipe(gulp.dest("config/"));
  });
  //var appJSFiles = [
  //  "./js/**/*.js"
  //];


  var localeFiles = [
    "bower_components/rv-common-i18n/dist/locales/**/*"
  ];

  var unitTestFiles = [
    "bower_components/angular/angular.js",
    "bower_components/q/q.js",
    "bower_components/angular-mocks/angular-mocks.js",
    "bower_components/angular-spinner/angular-spinner.js",
    "bower_components/rv-loading/loading.js",
    "bower_components/angular-bootstrap/ui-bootstrap-tpls.js",
    "bower_components/angular-ui-router/release/angular-ui-router.js",
    "src/**/app-*.js",
    "src/**/ctr-*.js",
    "src/**/svc-*.js",
    "src/**/flt-*.js",
    "test/unit/**/*.tests.js"
  ];
  gulp.task("test:unit", factory.testUnitAngular({testFiles: unitTestFiles, configFile : 'test/unit/karma.conf.js'}));

  gulp.task("test",  function (cb) {
    runSequence("config", ["test:unit", "test:e2e"], cb);
  });
  gulp.task("server", factory.testServer({https: false}));
  gulp.task("server-close", factory.testServerClose());
  gulp.task("test:webdrive_update", factory.webdriveUpdate());
  gulp.task("test:e2e:core", ["test:webdrive_update"], factory.testE2EAngular({
    src: ["test/e2e/*test.js"],
    browser: "chrome"
  }));
  gulp.task("test:e2e", function (cb) {
    runSequence("server", "test:e2e:core", "server-close", cb);
  });

  gulp.task("build", function() {
    var folders = getFolders(scriptsPath);

    var tasks = folders.map(function(folder){
      var appJSFiles = gulp.src(path.join(scriptsPath, folder, "/app-*.js")),
        svcJSFiles = gulp.src(path.join(scriptsPath, folder, "/svc-*.js")),
        ctrlJSFiles = gulp.src(path.join(scriptsPath, folder, "/ctr-*.js")),
        fltJSFiles = gulp.src(path.join(scriptsPath, folder, "/flt-*.js")),
        dtvJSFiles = gulp.src(path.join(scriptsPath, folder, "/dtv-*.js")),
      htmlTemplates = gulp.src(path.join(scriptsPath, folder, "/*.html"));
      htmlTemplates.pipe(html2js({
        outputModuleName: "risevision.app.common.components." + folder,
        useStrict: true,
        base: "src"
        }))
        .pipe(rename({extname: ".js"}));
      return es.merge(appJSFiles, svcJSFiles, ctrlJSFiles, fltJSFiles, dtvJSFiles, htmlTemplates)
        .pipe(concat(folder + ".js"))
        .pipe(gulp.dest("dist/js"))
        .pipe(uglify())
        .pipe(rename(folder + ".min.js"))
        .pipe(gulp.dest("dist/js"));
    });

    return es.concat.apply(null, tasks);
  });

})();
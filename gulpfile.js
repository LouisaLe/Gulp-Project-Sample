// include gulp

var mainPath = {
  dev : 'app/',
  public : 'public/',
  deploy : 'deploy/'
}
var path = {
  dev : {
    sass : mainPath.dev + 'sass/',
    css : mainPath.dev + 'css/',
    view : mainPath.dev + 'views/',
    image : mainPath.dev + 'images/',
    sprites : mainPath.dev + 'images/sprites/',
    font : mainPath.dev + 'css/fonts/',
    js : mainPath.dev + 'js/',
    data : mainPath.dev + 'data/'
  },
  public : {
    css : mainPath.public + 'css/',
    page : mainPath.public ,
    image : mainPath.public + 'images/',
    images_compressed: mainPath.public + 'images_compressed',
    font : mainPath.public + 'css/fonts/',
    js : mainPath.public + 'js/',
    data : mainPath.public + 'data/'
  },
  deploy : {
    css : mainPath.deploy + 'css/',
    page : mainPath.deploy ,
    image : mainPath.deploy + 'images/',
    images_compressed: mainPath.deploy + 'images_compressed',
    font : mainPath.deploy + 'css/fonts/',
    js : mainPath.deploy + 'js/',
    data : mainPath.deploy + 'data/'
  }
}
////////////////////

var gulp = require('gulp');
var pug = require('gulp-pug');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var concatMulti = require('gulp-concat-multi');
var uglify = require('gulp-uglify');
var strip = require('gulp-strip-comments');
var autoprefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var del = require('del');
var runSequence = require('run-sequence');
var watch = require('gulp-watch');
var tinypng = require('gulp-tinypng-nokey');

var gulpif = require('gulp-if');
var sprity = require('sprity');

// generate sprite.png and _sprite.scss
gulp.task('sprites', function () {
  return sprity.src({
    src: path.dev.image + 'icons/*.{png,jpg}',
    cssPath: '../images/sprites',
    style: './sprite.scss'
  }).pipe(gulpif('*.png', gulp.dest('./app/images/sprites'), gulp.dest(path.dev.sass)))
});

gulp.task('sprites-hover', function () {
  return sprity.src({
    src: path.dev.image + 'icons-h/*.{png,jpg}',
    cssPath: '../images/sprites',
    style: './sprite-hover.scss',
    name: 'sprite-hover'
  }).pipe(gulpif('*.png', gulp.dest('./app/images/sprites'), gulp.dest(path.dev.sass)))
});

// Task build css from scss with minimize
gulp.task('sass', function(){
  var files = [
    [
      path.dev.sass + "**/style.scss", path.dev.css + "bootstrap.min.css", path.deploy.css
    ]
  ];
  for (var key in files){
    gulp.src([files[key][1], files[key][0]])
      .pipe(sass().on('error', sass.logError))
      .pipe(cleanCSS({
        level: {
          1: {
            specialComments: false
          }
        }
      }))
      .pipe(autoprefix({
        // browsers: ['last 2 versions', 'iOS > 6', 'ie >= 8', 'Safari >= 7'],
        cascade: false
      }))
      .pipe(concat('style.css'))
      .pipe(gulp.dest(files[key][2]))
  }
});

// Task build css from scss without minimize
gulp.task('sass-dev', function(){
  var files = [
    [
      path.dev.sass + "**/style.scss", path.public.css
    ]
  ];
  for (var key in files){
    gulp.src(files[key][0])
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(autoprefix({
        browsers: ['last 2 versions', 'iOS > 6', 'ie >= 8', 'Safari >= 7'],
        cascade: false
      }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(files[key][1]));
  }
});

// Task pug
gulp.task('pug-dev', function(){
  gulp.src( path.dev.view + '*.pug')
      .pipe(pug({
        pretty: true
      })) // pip to pug plugin
      .pipe(gulp.dest(mainPath.public))  // tell gulp our output folder
      // .pipe(browserSync.stream());
});

// Task pug for deploy
gulp.task('pug', function(){
  gulp.src( path.dev.view + '*.pug')
      .pipe(pug({
        pretty: true
      })) // pip to pug plugin
      .pipe(gulp.dest(mainPath.deploy))  // tell gulp our output folder
      .pipe(browserSync.stream());
});

// Task js for deploy
gulp.task('js', function(){ 
  return concatMulti({
    'app.js': [ path.dev.js+'libs/jquery.min.js',path.dev.js+'libs/bootstrap.min.js',path.dev.js+'libs/plugins/*.js',path.dev.js+'main.js']
  })
    .pipe(strip())
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(path.deploy.js));
});

// Task js for dev
gulp.task('js-dev', function(){
  return concatMulti({
    'app.js': [ path.dev.js+'libs/jquery.min.js',path.dev.js+'libs/bootstrap.min.js',path.dev.js+'libs/plugins/*.js',path.dev.js+'main.js']
  })
  //.pipe(jshint('.jshintrc'))
  .pipe(jshint.reporter('default'))
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest(path.public.js));
});

gulp.task('jshint', function(){
  return gulp.src(path.dev.js+'main.js')
  .pipe(jshint('.jshintrc'))
  .pipe(jshint.reporter('default')) 
});

// Task imagemin
gulp.task('tinypng', function () {
  gulp.src( path.dev.image + '/**/*.{png,jpg}')
    .pipe(tinypng())
    .pipe(gulp.dest(path.deploy.images_compressed));
});


// Task copy
gulp.task('copy', function(){
  gulp.src(path.dev.css + 'bootstrap.min.css').pipe(gulp.dest(path.deploy.css));

  // gulp.src([
  //           path.dev.js + 'libs/jquery.min.js',
  //           path.dev.js + 'libs/bootstrap.min.js'
  //         ])
  //         .pipe(gulp.dest(path.deploy.js+'libs/'));
  gulp.src([
            path.dev.js + '*.js', !path.dev + 'main.js'
          ])
          .pipe(uglify())
          .pipe(rename({suffix: '.min'}))
          .pipe(gulp.dest(path.deploy.js));

  gulp.src( path.dev.font + '*')
      .pipe(gulp.dest(path.deploy.font));

  gulp.src( path.dev.image +'**/*')
      .pipe(gulp.dest(path.deploy.image));

  gulp.src( path.dev.data +'**/*')
      .pipe(gulp.dest(path.deploy.data));
});

// Task copy for dev
gulp.task('copy-dev', function(){
  //gulp.src(path.dev.sass).pipe(gulp.dest(path.public.css));
  gulp.src(path.dev.css + 'bootstrap.min.css').pipe(gulp.dest(path.public.css));

  /*gulp.src([
            path.dev.js + 'libs/jquery.min.js',
            path.dev.js + 'libs/bootstrap.min.js'
          ])
          .pipe(gulp.dest(path.public.js+'libs/'));*/
  gulp.src([
            path.dev.js + '*.js', !path.dev + 'main.js'
          ])
          .pipe(rename({suffix: '.min'}))
          .pipe(gulp.dest(path.public.js));
  gulp.src( path.dev.font + '*')
      .pipe(gulp.dest(path.public.font));

  gulp.src( path.dev.image +'**/*')
      .pipe(gulp.dest(path.public.image));

  gulp.src( path.dev.data +'**/*')
      .pipe(gulp.dest(path.public.data));
});


gulp.task('image-watch', function(){
  gulp.src( path.dev.image +'**/*')
      .pipe(gulp.dest(path.deploy.image));
});

gulp.task('image-watch-dev', function(){
  gulp.src( path.dev.image +'**/*')
      .pipe(gulp.dest(path.public.image));
});

gulp.task('js-dev-old', function(){
  return concatMulti({
    'plugin.js': [ path.dev.js+'libs/plugins/*.js']
  })
  //.pipe(jshint('.jshintrc'))
  .pipe(jshint.reporter('default'))
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest(path.public.js+'/libs'));
});

// Task browser-sync
gulp.task('browserSync', function(){
  browserSync.init({
    server: {
      baseDir: 'public',
      https: true
    },
    port: 3010,
  })
});

// Task watch
gulp.task('watch', function(){
  gulp.watch( path.dev.sass + '**/*.scss', ['sass-dev']);
  gulp.watch( path.dev.js + '**/*.js', ['js-dev']);
  gulp.watch( path.dev.js + '*.js', ['copy-dev']);
  gulp.watch( path.dev.view + '*.pug', ['pug-dev']);
  gulp.watch( path.dev.view + '**/*.pug', ['pug-dev']);
  gulp.watch( path.dev.image + '**/*', ['image-watch-dev']);
});

// Task clean deploy
gulp.task('clean:deploy', function(){
  return del.sync('deploy');
});

// Task clean public
gulp.task('clean:public', function(){
  return del.sync('public');
});

gulp.task('default', function(callback){
  return runSequence('clean:public',
    ['sass-dev', 'pug-dev', 'js-dev', 'copy-dev', 'watch', 'browserSync'],
    callback)
});

gulp.task('deploy', function(callback){
  return runSequence('clean:deploy',
    ['sass', 'pug', 'js', 'copy'],
    callback)
});


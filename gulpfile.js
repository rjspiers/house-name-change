var gulp = require('gulp');
var cleanCSs = require('gulp-clean-css');
var inject = require('gulp-inject');
var uglify = require('gulp-uglify');
var pump = require('pump');

// var jsFiles = ['*.js', 'src/**/*.js'];
var iisnodeRoute = '/node/snn-viewer';

gulp.task('default', function() {
  // place code for your default task here
});

// create CSS files from /public/src/css and ./bower_components
gulp.task('minify-css', function () {
    return gulp.src([
        './public/src/css/*.css', // minify from /public/src
        './bower_components/**/dist/*.css', // minify from default bower_components folder
        './bower_components/bootstrap/dist/css/bootstrap.min.css' // minify from /bootstrap/dist/css
    ])
    .pipe(cleanCSs())
    .pipe(gulp.dest('./public/dist/css')) // destination in /public/dist
});

// minify js
gulp.task('compress', function (cb) {
    pump([
        gulp.src([
            './public/src/js/*.js',
            './bower_components/**/dist/*.js',
            './bower_components/bootstrap/dist/js/bootstrap.min.js',
            './bower_components/Proj4Leaflet/src/proj4leaflet.js',
        ]),
        uglify(),
        gulp.dest('./public/dist/js')
    ],
    cb
    );
});

// inject css, js into ejs files where a placeholder exists
gulp.task('inject', function () {
    var target = gulp.src('./views/src/**/*.ejs');
    // It's not necessary to read the files (will speed up things), we're only after their paths:  
    var sources = gulp.src([
        // css
        './public/dist/**/*.css', // all css under dist
        // js
        //'./public/dist/**/*.js', // all js under dist
        './public/dist/js/jquery/dist/jquery.min.js', // jquery
        './public/dist/js/leaflet/dist/leaflet.js', //leaflet.js
        './public/dist/js/proj4/dist/proj4.js', //leaflet.js
        './public/dist/js/proj4leaflet.js', //leaflet.js
    ], {read: false});
    var options = {
        addPrefix: iisnodeRoute,
    };
    return target.pipe(inject(sources, options))
    .pipe(gulp.dest('./views/dist'));
    // 
});

// inject leaflet.js to head-leaflet-map.ejs
gulp.task('inject-leaflet', function () {
    var target = gulp.src('./views/src/partials/head-leaflet-map.ejs'); 
    var sources = gulp.src([
        './public/dist/js/leaflet/dist/leaflet.js',
    ], {read: false});
    var options = {
        addPrefix: iisnodeRoute,
        starttag: '<!-- inject:leaflet:{{ext}} -->',
    };
    return target.pipe(inject(sources, options))
    .pipe(gulp.dest('./views/dist/partials'));
});

// copy all in folder to dist
// used for leaflet marker pngs
gulp.task('copy-bower-dist-folders', function () {
    gulp.src(['./bower_components/leaflet/dist/images/*'])
        .pipe(gulp.dest('./public/dist/css/leaflet/dist/images'));
    //var target = gulp.src([
        //'./bower_components/leaflet/dist/images/*',
    //]);
    //target.pipe(gulp.dest('./public/dist/js/leaflet/dist/images'));
});
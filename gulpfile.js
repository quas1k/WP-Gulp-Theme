'use stick';

// Connection of all necessary plug-ins
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    autoprefixer = require('gulp-autoprefixer'),
    gcqm = require('gulp-group-css-media-queries'),
    cleanCSS = require('gulp-clean-css'),
    uglify = require('gulp-uglify-es').default,
    imagemin = require('gulp-imagemin'),
    imageminJpegRecompress = require('imagemin-jpeg-recompress'),
    pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),
    del = require('del'),
    smartgrid = require('smart-grid'),
    notify = require('gulp-notify');


// Configuring Directories
var path = {
    build: {
        css: './',
        js: 'js/',
        img: 'img/',
        fonts: 'fonts/'
    },
    src: {
        sass: 'src/sass/main.sass',
        js: 'src/js/**/*.js',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        smartgrid: 'src/sass/core/'
    },
    watch: {
        sass: 'src/sass/**/*.*',
        js: 'src/js/**/*.js',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: ['build/**/*']
};

// Configuring grid layout
var gridConfig = {
    outputStyle: 'sass', /* less || scss || sass || styl */
    columns: 12, /* number of grid columns */
    offset: '30px', /* gutter width px || % */
    mobileFirst: false, /* mobileFirst ? 'min-width' : 'max-width' */
    container: {
        maxWidth: '1170px', /* max-width оn very large screen */
        fields: '30px' /* side fields */
    },
    breakPoints: {
        lg: {
            width: '1100px' /* -> @media (max-width: 1100px) */
        },
        md: {
            width: '960px'
        },
        sm: {
            width: '780px',
            fields: '15px' /* set fields only if you want to change container.fields */
        },
        xs: {
            width: '560px'
        }
        /*
        We can create any quantity of break points.

        some_name: {
            width: 'Npx',
            fields: 'N(px|%|rem)',
            offset: 'N(px|%|rem)'
        }
        */
    }
};

// Sass
gulp.task('sass', function () {
    return gulp.src(path.src.sass)
        .pipe(sass({outputStyle: 'expand'}))
        .on('error', notify.onError(function (err) {
            return {
                title: 'Sass',
                message: err.message
            }
        }))
        .pipe(concat('style.css'))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(gcqm())
        .pipe(cleanCSS({level: {1: {specialComments: 0}}}))
        .pipe(gulp.dest(path.build.css));
});

// JS
gulp.task('js', function () {
   return gulp.src([
       'bower_components/jQuery/dist/jquery.min.js',
       path.src.js
   ])
       .pipe(concat('main.min.js'))
       .pipe(uglify())
       .on('error', notify.onError(function (err) {
           return {
               title: 'JS',
               message: err.message
           }
       }))
       .pipe(gulp.dest(path.build.js));
});

// Image minification
gulp.task('img', function () {
   return gulp.src(path.src.img)
       .pipe(cache(imagemin([
           imagemin.gifsicle({interlaced: true}),
           imagemin.jpegtran({progressive: true}),
           imageminJpegRecompress({
               loops: 5,
               min: 65,
               max: 70,
               quality:'medium'
           }),
           imagemin.svgo(),
           imagemin.optipng({optimizationLevel: 3}),
           pngquant({quality: '65-70', speed: 5})
       ],{
           verbose: true
       })))
       .pipe(gulp.dest(path.build.img));
});

// Fonts
gulp.task('fonts', function () {
   return gulp.src(path.src.fonts)
       .pipe(gulp.dest(path.build.fonts));
});

gulp.task('smartgrid', function (cb) {
    smartgrid(path.src.smartgrid, gridConfig);
    cb();
});

// Clean Build-folder
gulp.task('clean', function () {
    return del(path.clean);
});

// Build
gulp.task('build', gulp.parallel('sass', 'img', 'js', 'fonts'));

// Watch
gulp.task('watch', function () {
    gulp.watch(path.watch.sass, gulp.series('sass'));
    gulp.watch(path.watch.img, gulp.series('img'));
    gulp.watch(path.watch.js, gulp.series('js'));
    gulp.watch(path.watch.fonts, gulp.series('fonts'));
});

// Default
gulp.task('default', gulp.series('build', gulp.parallel('watch')));


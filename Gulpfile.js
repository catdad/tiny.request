/* jshint node: true */

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var connect = require('gulp-connect');

gulp.task('minify', function(){
    return gulp.src('request.js')
        .pipe(uglify())
        .pipe(rename('request.min.js'))
        .pipe(gulp.dest('./'));
});

gulp.task('watch', ['minify'], function(){
    gulp.watch('request.js', ['minify']);
});

gulp.task('default', ['watch']);

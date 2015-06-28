/* jshint node: true */

var child = require('child_process');
var path = require('path');
var noop = function(){};

var pathEvn = process.env.Path || process.env.PATH || process.env.path;
pathEvn += path.delimiter + path.resolve('./node_modules/.bin');

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var runContinuous = false;

gulp.task('minify', function(){
    return gulp.src('request.js')
        .pipe(uglify())
        .pipe(rename('request.min.js'))
        .pipe(gulp.dest('./'))
        .pipe(gulp.dest('./test'));
});

gulp.task('watch', ['minify'], function() {
    runContinuous = true;
    gulp.watch('request.js', ['minify']);
});

gulp.task('test', ['boot'], function(done) {
    var package = require('./package.json');
    
    child.exec(package.scripts.test, {
        env: { 'PATH': pathEvn }
    }, function(err, stdout, stderr){
        console.log(stdout);
        done();
        
        if (!runContinuous) {
            if (err) { process.exit(err.code); }
            else { process.exit(0); }
        }
    });
});

gulp.task('boot', function(done) {
    function debounce(fn, delay) {
        var timer = null;
        return function () {
            var context = this,
                args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        };
    }
    
    var thread = child.exec('npm run boot', {
        cwd: './test'
    }, function(err){
        console.log('done');
        console.log(err);
    });
    
    thread.stdout.on('data', debounce(function(){
        done();
        done = noop;
    }, 100));
    
//    thread.stdout.pipe(process.stdout);
});

gulp.task('default', ['boot', 'watch']);

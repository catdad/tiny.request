/* jshint node: true */

var child = require('child_process');
var path = require('path');
var noop = function(){};

var pathEvn = process.env.Path || process.env.PATH || process.env.path;
pathEvn += path.delimiter + path.resolve('./node_modules/.bin');

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var runSequence = require('gulp-run-sequence');
var chalk = require('chalk');

var thread;
function boot(done) {
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
    
    thread = child.exec('npm run boot', {
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
    
    process.on('exit', function() {
        console.log('shutting down test server');
        thread.kill();
    });
}

function test(done) {
    var package = require('./package.json');
    
    child.exec(package.scripts.phantom, {
        env: { 'PATH': pathEvn }
    }, function(err, stdout, stderr){
        
        var testFailure;
        
        if (err) {
            console.log(chalk.yellow(stdout));
            console.log(chalk.red(stderr));
            
            testFailure = new Error(stderr);
        } else {
            console.log(chalk.green(stdout));
        }
        
        done(testFailure);
    });
}

gulp.task('minify', function(){
    return gulp.src('request.js')
        .pipe(uglify())
        .pipe(rename('request.min.js'))
        .pipe(gulp.dest('./'));
});

gulp.task('watch:test', function(done) {
    test(done);
});

gulp.task('watch', ['minify'], function(done) {
    gulp.watch('request.js', ['minify', 'watch:test']);

    runSequence('boot', 'watch:test');
});

gulp.task('test', ['boot'], function(done) {
    test(function(err) {
        done();
        
        if (err) { process.exit(err.message); }
        else { process.exit(0); }
    });
});

gulp.task('boot', function(done) {
    boot(done);
});

gulp.task('default', ['watch']);

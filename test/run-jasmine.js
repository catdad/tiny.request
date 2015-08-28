// Run Jasmine
// Code adapted from the following sources:
// https://github.com/ariya/phantomjs/blob/master/examples/run-jasmine.js
// http://wasbazi.com/blog/running-jasmine-tests-with-phantomjs-ci-setup-part-two/

/* jshint node: true, browser: true, evil: true, expr: true */
/* global phantom */

var system = require('system');
var fs = require('fs');

console.error = function () {
    require('system').stderr.write(Array.prototype.join.call(arguments, ' ') + '\n');
};

/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3001, //< Default Max Timeout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 100); //< repeat check every 100ms
}

if (system.args.length !== 2) {
    console.log('Usage: run-jasmine.js URL');
    phantom.exit(1);
}

var page = require('webpage').create();

// Route "console.log()" calls from within the Page context to the main Phantom context 
// (i.e. current "this")
page.onConsoleMessage = function(msg) {
    //console.log(msg);
};

page.open(system.args[1], function(status){
    if (status !== "success") {
        console.error("Unable to open " + system.args[1]);
        phantom.exit(1);
    } else {
        waitFor(function() {
            return page.evaluate(function(){
                return document.body.querySelector('.symbolSummary .pending') === null;
            });
        }, function() {
            // get stuff from the resulting web page
            var testStatus = page.evaluate(function() {
                return document.body.querySelector('.alert > .bar').innerText;
            });
            var errorList = page.evaluate(function() {
                return document.body.querySelectorAll('.symbol-summary .failed');
            });
            
            if (errorList && errorList.length > 0) {
                // we have test failures, report them
                console.error(testStatus);
                console.error(errorList.length + ' test(s) FAILED:');

                [].forEach.call(errorList, function(err) {
                    var status = err.className;
                    var msg = err.title;
                    
                    console.error(status + ': ' + msg);
                });
                
                phantom.exit(1);
            } else {
                // all test are successful
                console.log(testStatus);
                pullReport();
                phantom.exit(0);
            }
        });
    }
});

function pullReport() {
    var report = page.evaluate(function(){
        return window.__coverage__;
    });
    
    var dir = fs.workingDirectory;
    var sep = fs.separator;
    
    var path = dir + sep + 'coverage' + sep + 'coverage.json';
    console.log(path);
    
    fs.write(path, JSON.stringify(report), 'w');
}

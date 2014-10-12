/* jshint browser: true, -W030 */
/* global ActiveXObject */

!function (window) {
	//util
	var each = function(arr, func){
		var native = [].forEach;
        
        if (!arr) return [];

		if (arr instanceof Array || 'length' in arr){
			//array-style forEach
			(native) ? native.call(arr, func) : (function(){
				for (var i = 0; i < arr.length; i++){
					func(arr[i], i, arr);
				}
			})();
		}
		else (function(){
			//object-style forEach
			//TODO error check
			for (var i in arr){
				if (arr.hasOwnProperty(i)) func(arr[i], i, arr);
			}
		})();
	};
    var map = function(arr, func){
        var newArr = [];
        each(arr, function(el, i, arr){
            newArr.push( func(el, i, arr) );
        });
        return newArr;
    };

    var request = window.request = function (obj, done) {
        //make sure obj exists and is valid
        if (typeof obj === 'string') {
            obj = { url: obj };
        } else if (!(obj && typeof obj === 'object')) {
            done(new Error(obj + ' is not a valid request object.'));
            return;
        } else if (typeof obj.url !== 'string') {
            done(new Error(obj.url + ' is not a valid string url.'));
            return;
        }
        
        obj = obj || {};
        //check settings and create defaults
        obj.url = obj.url || '#';
        obj.method = (obj.method || 'GET').toUpperCase();
        obj.async = obj.async || true;
        obj.body = obj.body || obj.data || null;

       	//get correct XHR object
       	//create new request
        var ajax = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        
        //handle all errors for this function
        function returnError(message, originalError){
            var err = new Error(message);
            err.original = originalError;
            done(err, undefined, ajax);
        }
        
        //state change listener
        ajax.onreadystatechange = function () {
            if (ajax.readyState === 4 && ajax.status === 200)
                //return (err, body, xhr)
                done(null, ajax.responseText, ajax);
            else if (ajax.readyState === 4 && ajax.status !== 0){
            	//handle IE timeouts and special cases
                if (ajax.status === 12152) returnError('unknown ajax error', ajax);
                else if (ajax.status > 10000) returnError('unknown IE error', ajax);
                else {
                    //return HTTP error
                    returnError('HTTP error ' + ajax.status, ajax);   
                }
            }
        };

        //open request
        ajax.open(obj.method, obj.url, obj.async);

        //must be done after .open
        //ajax.timeout = 4000;
        //ajax.ontimeout = function(){
        //	done('err: timeout');
        //}

        ajax.onerror = function(xhrErr){
        	returnError('unknown ajax error', xhrErr);
        };
		
		//add any headers (must be done after .open but before .send)
		var contentTypeSet = false;
        if (obj.headers)
			each(obj.headers, function(value, name){
				ajax.setRequestHeader(name, value);
                
                if (name.toLowerCase() === 'content-type') contentTypeSet = true;
			});
		
        if (obj.method === 'POST') {
            // set content type if it was not specifically set
            if (!contentTypeSet) ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            
            var content = '';
            
            switch (typeof obj.body) {
                case 'object':
                    content = map(obj.body, function(val, name){
                        return encodeURIComponent(name) + '=' + encodeURIComponent(val);
                    }).join('&');
                    break;
                case 'string':
                    content = obj.body;
                    break;
                // TODO what should happen here?
//                case 'array':
//                    content = map(obj.body, function(el, i){
//                        return encodeURIComponent('[]') + '=' + encodeURIComponent(el);
//                    }).join('&');
//                    break;
                default:
                    content = obj.body.toString();
            }
            
            ajax.send(content);
        } else {
            ajax.send();   
        }
        
        //because why not
        return ajax;
    };

    //add special methods
    request.json = function jsonRequest(obj, done){
    	request(obj, function(err, body, xhr){
    		if (err) done(err, body, xhr);
            else {
                try {
                    var parsedData = request.parseJSON(body);
                    done(null, parsedData, xhr);    
                } catch(e) {
                    var err = new Error('invalid JSON');
                    //forward the original error along
                    err.original = e;
                    done(err, undefined, xhr);
                }
            }
    	});
    };

    request.jsonp = function jsonpRequest(obj, done){
    	//create script element
    	var scr = document.createElement('script');
    	//generate reasonably unique callback name
    	var cb = 'tinyrequest_' + Date.now() + '_' + Math.random().toString().split('.').pop();

        //did user request 'unknown errors'?
        obj.unknownErrors = !!obj.unknownErrors;
        
    	//create correct url
    	scr.src = (obj.url.match(/\?/)) ? (obj.url + '&callback=' + cb) : (obj.url + '?callback=' + cb);
        scr.async = false;
        
        //I'm not sure if I want to support this yet
        //(obj.async !== false) ? (scr.async = true) : (scr.async = false);
    	
        var cleanUp = function cleanUpJSONP(){
            //clean up scripts
            scr.parentNode.removeChild(scr);
            request.removeEvent(window, 'error', onError);
        };
        
    	//catch network errors
        scr.onerror = function(err){
    		done(err);
            //cleanup script
    		cleanUp();
    	};

    	//create callback method
    	window[cb] = function(data){
    		done(null, data);
			//cleanup script
			cleanUp();
    	};
        
        //attempt to catch scripting errors (invalid JSON data)
        //this works with only one request at a time
        //it will not handle multiple simultaneous jsonp requests
        var onError = function(err, filename, lineno, colno, stackTrace){
            //TODO make sure this is my error
            
            var returnError = function(){
                var newError = new Error('jsonp scripting error');
                newError.original = err;
                
                done(newError);
                cleanUp();
            };
            
            if (err.filename === scr.src){
                //CORS enabled JSONP
                //IE 10/11 always gives us the filename -- awesome
                returnError();
            }
            else if (filename === scr.src){
                //this is in the spec -- not sure if any browsers use it
                returnError();
            }
            else if (window.event && window.event.errorUrl === scr.src){
                //early IE -- only works once, not awesome
                window.event = null;
                returnError();
            }
            //good guess for an error in Chrome
            else if (obj.unknownErrors && err.target == window && err.filename === '' && err.message === 'Script error.'){
                //Chrome gives us nothing -- boo
                //this is an error from an untrusted script
                //console.log('**Chrome guess**');
                returnError();
            }
            //good guess for an error in Firefox
            else if (obj.unknownErrors && err.target === window && !err.filename){
                //console.log('**I am Firefox, I will offer no help');
                returnError();
            }
            else if (err.filename && err.filename !== scr.src){
                //this is explicitly not my error
                //skip it and do nothing here
            }
            else { 
                //don't know what to do -- clean up?
                cleanUp();
            }
        };
        request.addEvent(window, 'error', onError);
        
    	//insert script into document -- make jsonp request
    	var head = document.getElementsByTagName('head')[0];
    	head.appendChild(scr);
    };

    //add helpers
    request.parseJSON = function parseJSON(jsonStr){
    	if (window.JSON && window.JSON.parse) return (JSON.parse(jsonStr));

    	//logic derived from https://github.com/douglascrockford/JSON-js
        /* jshint -W054 */
        // boo, eval is evil
    	if (/^[\],:{}\s]*$/
		.test(jsonStr.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
		.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
		.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
		    return (new Function( 'return ' + jsonStr))();
		}
        /* jshint +W054 */

		return null;
    };
    
    //cross-browser event listeners
    request.addEvent = function addEvent(obj, event, handler){
        if(obj.addEventListener) obj.addEventListener(event, handler, false);
        else if (obj.attachEvent) obj.attachEvent('on'+event, handler);
    };
    request.removeEvent = function removeEvent(obj, event, handler){
        if(obj.removeEventListener) obj.removeEventListener(event, handler, false);
        else if (obj.detachEvent) obj.detachEvent('on'+event, handler);
    };
}(window);
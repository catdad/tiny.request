(function (global) {
	//util
	var each = global.each /* TODO remove */ = function(arr, func){
		var native = [].forEach;

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
			for (i in arr){
				if (arr.hasOwnProperty(i)) func(arr[i], i, arr);
			}
		})();
	};

    var request = global.request = function (obj, done) {
        //make sure obj exists
        obj = obj || {};
        //check settings and create defaults
        obj.url = obj.url || '#';
        obj.method = obj.method || 'GET';
        obj.async = obj.async || true;
        obj.body = obj.body || null;

       	//get correct XHR object
       	//create new request
        var ajax = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

        //state change listener
        ajax.onreadystatechange = function () {
            if (ajax.readyState === 4 && ajax.status === 200)
                //return (err, body, xhr)
                done(null, ajax.responseText, ajax);
            else if (ajax.readyState === 4 && ajax.status !== 0){
            	//return (err, body, xhr)
            	done(ajax.status, null, ajax);
            }
            else if (ajax.readyState == 4){
            	//hmm... do not handle this, onerror has got it
            	//done('unknown error -- likely timeout', null, ajax);
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
        	//return (err, body, xhr)
        	done(xhrErr, null, ajax)
        };
		
		//add any headers (must be done after .open but before .send)
		if (obj.headers)
			each(obj.headers, function(value, name){
				ajax.setRequestHeader(name, value);
			});
		
        ajax.send((obj.method === "POST") ? obj.body : null);

        //because why not
        return ajax;
    }

    //add special methods
    request.json = function jsonRequest(obj, done){
    	request(obj, function(err, body, xhr){
    		if (err) done(err, body, xhr);
    		else{
    			done(null, global.request.parseJSON(body), xhr);
    		}
    	});
    };

    request.jsonp = function jsonpRequest(obj, done){
    	//create script element
    	var scr = document.createElement('script');
    	//generate reasonably unique callback name
    	var cb = 'tinyrequest_' + Date.now() + '' + Math.random().toString().split('.').pop();

    	//create correct url
    	scr.src = (obj.url.match(/\?/)) ? (obj.url + '&callback=' + cb) : (obj.url + '?callback=' + cb);
    	
    	//catch network errors
    	scr.onerror = function(err){
    		done(err);
    		//cleanup script
    		scr.parentNode.removeChild(scr);
    	};

    	//create callback method
    	window[cb] = function(data){ 
    		done(null, data);
			//cleanup script
			scr.parentNode.removeChild(scr);
    	};

    	//insert script into document
    	var head = document.getElementsByTagName('head')[0];
    	head.appendChild(scr);
    };

    //add helpers
    request.parseJSON = function parseJSON(jsonStr){
    	if (window.JSON && window.JSON.parse) return (JSON.parse(jsonStr));

    	//logic derived from https://github.com/douglascrockford/JSON-js
    	if (/^[\],:{}\s]*$/
		.test(jsonStr.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
		.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
		.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
		    return (new Function( 'return ' + jsonStr))();
		}

		return null;
    };
})(this);
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

    global.request = function (obj, done) {
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
                done(null, ajax.responseText, ajax);
            else if (ajax.readyState === 4 && ajax.status !== 0){
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
})(this);